const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync";

app.use(cors());
app.use(express.json());

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/employees", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees." });
  }
});

app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, department, role, salary } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim() || !role?.trim() || salary === "" || salary === undefined || Number(salary) < 0 || !Number.isFinite(Number(salary))) {
      return res.status(400).json({ message: "Please provide valid values for every field." });
    }
    const employee = await Employee.create({ name, email, department, role, salary: Number(salary) });
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An employee with this email already exists." });
    res.status(400).json({ message: error.message || "Could not create employee." });
  }
});

app.put("/api/employees/:id", async (req, res) => {
  try {
    const { name, email, department, role, salary } = req.body;
    if (!name?.trim() || !email?.trim() || !department?.trim() || !role?.trim() || salary === "" || salary === undefined || Number(salary) < 0 || !Number.isFinite(Number(salary))) {
      return res.status(400).json({ message: "Please provide valid values for every field." });
    }
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, email, department, role, salary: Number(salary) },
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not update employee." });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid employee ID." });
  }
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`StaffSync API running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
