import React, { useState } from "react";
import { post, get } from "../api";
import DataTable from "./DataTable";

export default function DepartmentsSection() {
  const [addForm, setAddForm] = useState({
    deptId: "", ssn: "", firstName: "", lastName: "", birthdate: "", startdate: "", address: "", staffId: "", salary: "",
  });
  const [manageForm, setManageForm] = useState({ ssn: "", deptId: "" });
  const [removeForm, setRemoveForm] = useState({ ssn: "", deptId: "" });
  const [departments, setDepartments] = useState([]);
  const [medicalStaff, setMedicalStaff] = useState([]);
  const [message, setMessage] = useState("");

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleManageChange = (e) => {
    setManageForm({ ...manageForm, [e.target.name]: e.target.value });
  };

  const handleRemoveChange = (e) => {
    setRemoveForm({ ...removeForm, [e.target.name]: e.target.value });
  };
  const submitAddStaff = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/departments/add_staff", addForm);
      setMessage("Staff added to department");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitManage = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/departments/manage", manageForm);
      setMessage("Department manager updated");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitRemove = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/departments/remove_staff", removeForm);
      setMessage("Staff removed from department");
    } catch (err) {
      setMessage(err.message);
    }
  };
  const loadDepartments = async () => {
    setMessage("");
    try {
      const res = await get("/api/departments/view");
      setDepartments(res.data || []);
      setMessage("Departments refreshed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadMedicalStaff = async () => {
    setMessage("");
    try {
      const res = await get("/api/medical_staff/view");
      setMedicalStaff(res.data || []);
      setMessage("Medical staff refreshed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>Add Staff To Department</h3>
        <form className="form-grid" onSubmit={submitAddStaff}>
          <input name="deptId" placeholder="Department ID" value={addForm.deptId} onChange={handleAddChange} />
          <input name="ssn" placeholder="SSN" value={addForm.ssn} onChange={handleAddChange} />
          <input name="firstName" placeholder="First name" value={addForm.firstName} onChange={handleAddChange} />
          <input name="lastName" placeholder="Last name" value={addForm.lastName} onChange={handleAddChange} />
          <input type="date" name="birthdate" placeholder="Birthdate" value={addForm.birthdate} onChange={handleAddChange} />
          <input type="date" name="startdate" placeholder="Start date" value={addForm.startdate} onChange={handleAddChange} />
          <input name="address" placeholder="Address" value={addForm.address} onChange={handleAddChange} />
          <input name="staffId" placeholder="Staff ID" value={addForm.staffId} onChange={handleAddChange} />
          <input name="salary" placeholder="Salary" value={addForm.salary} onChange={handleAddChange} />
          <div className="actions">
            <button type="submit">Add Staff</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>manage departmnt</h3>
        <form className="form-grid" onSubmit={submitManage}>
          <input name="ssn" placeholder="Manager SSN" value={manageForm.ssn} onChange={handleManageChange} />
          <input name="deptId" placeholder="Department ID" value={manageForm.deptId} onChange={handleManageChange} />
          <div className="actions">
            <button type="submit">Assign Manager</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Remove Staff From Department</h3>
        <form className="form-grid" onSubmit={submitRemove}>
          <input name="ssn" placeholder="SSN" value={removeForm.ssn} onChange={handleRemoveChange} />
          <input name="deptId" placeholder="Department ID" value={removeForm.deptId} onChange={handleRemoveChange} />
          <div className="actions">
            <button type="submit">Remove Staff</button>
          </div>
        </form>
      </div>
      <div className="actions">
        <button type="button" onClick={loadDepartments}>
          Load Departments
        </button>
        <button type="button" className="secondary" onClick={loadMedicalStaff}>
          Load Medical Staff
        </button>
      </div>
      <DataTable rows={departments} />
      <DataTable rows={medicalStaff} />
      {message && <div className="message">{message}</div>}
    </div>
  );
}
