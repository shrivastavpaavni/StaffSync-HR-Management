import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/employees";
const emptyForm = { name: "", email: "", department: "", role: "", salary: "" };

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEmployees(term = search) {
    setLoading(true);
    try {
      const response = await axios.get(API, { params: term ? { search: term } : {} });
      setEmployees(response.data);
      setError("");
    } catch {
      setError("Could not reach the backend. Check that the server and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(""); }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadEmployees(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const departments = useMemo(() => new Set(employees.map(e => e.department)).size, [employees]);

  function updateField(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        setNotice("Employee updated successfully.");
      } else {
        await axios.post(API, form);
        setNotice("Employee added successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadEmployees(search);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save employee. Check the server connection.");
    }
  }

  function edit(employee) {
    setEditingId(employee._id);
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      salary: String(employee.salary)
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(employee) {
    if (!window.confirm(`Delete ${employee.name}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${employee._id}`);
      setNotice("Employee deleted.");
      await loadEmployees(search);
    } catch {
      setError("Unable to delete employee.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">S</span> StaffSync</a>
        <span className="top-label">PEOPLE OPERATIONS</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">EMPLOYEE DIRECTORY</p>
          <h1>People make the work.</h1>
          <p className="subtitle">Keep your employee information organized in one simple place.</p>
        </div>
        <div className="hero-art" aria-hidden="true"><span>✳</span><span>●</span><span>✦</span></div>
      </section>

      <section className="stats">
        <article className="stat"><span className="stat-label">Employees shown</span><strong>{employees.length}</strong></article>
        <article className="stat"><span className="stat-label">Departments shown</span><strong>{departments}</strong></article>
        <article className="stat"><span className="stat-label">Workspace</span><strong className="live"><i /> Local</strong></article>
      </section>

      {(error || notice) && <div className={error ? "message error" : "message success"} role="status">{error || notice}</div>}

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div><p className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</p><h2>{editingId ? "Edit employee" : "Add an employee"}</h2></div>
            <span className="panel-icon">＋</span>
          </div>
          <label>Full name<input name="name" value={form.name} onChange={updateField} placeholder="e.g. Aanya Sharma" required /></label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} placeholder="aanya@company.com" required /></label>
          <div className="field-row">
            <label>Department<input name="department" value={form.department} onChange={updateField} placeholder="Engineering" required /></label>
            <label>Role<input name="role" value={form.role} onChange={updateField} placeholder="Developer" required /></label>
          </div>
          <label>Annual salary (₹)<input name="salary" type="number" min="0" step="any" value={form.salary} onChange={updateField} placeholder="600000" required /></label>
          <button className="primary-button" type="submit">{editingId ? "Save changes" : "Add employee"} <span>↗</span></button>
          {editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel editing</button>}
          <p className="form-note">All fields are required. Employee details are saved to your MongoDB database.</p>
        </form>

        <section className="panel directory-panel">
          <div className="directory-heading">
            <div><p className="eyebrow">YOUR TEAM</p><h2>Employee directory</h2></div>
            <span className="count">{employees.length} records</span>
          </div>
          <div className="search-wrap"><span>⌕</span><input aria-label="Search employees by name" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee name..." /></div>
          {loading ? <div className="empty-state">Loading employees…</div> : employees.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">◎</span><strong>{search ? "No matching employees" : "Your directory is empty"}</strong><p>{search ? "Try another name." : "Add your first employee using the form."}</p></div>
          ) : (
            <div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>DEPARTMENT / ROLE</th><th>SALARY</th><th>ACTIONS</th></tr></thead>
              <tbody>{employees.map(employee => <tr key={employee._id}>
                <td><div className="person"><span className="avatar">{employee.name.trim().charAt(0).toUpperCase()}</span><span><strong>{employee.name}</strong><small>{employee.email}</small></span></div></td>
                <td><strong>{employee.department}</strong><small className="subline">{employee.role}</small></td>
                <td className="salary">₹{Number(employee.salary).toLocaleString("en-IN")}</td>
                <td><div className="actions"><button className="text-button" onClick={() => edit(employee)} type="button">Edit</button><button className="text-button danger-text" onClick={() => remove(employee)} type="button">Delete</button></div></td>
              </tr>)}</tbody>
            </table></div>
          )}
        </section>
      </section>
      <footer>StaffSync <span>·</span> A simple, focused employee management workspace</footer>
    </main>
  );
}
