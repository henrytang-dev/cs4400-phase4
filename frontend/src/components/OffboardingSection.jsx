import React, { useState } from "react";
import { post } from "../api";

export default function OffboardingSection() {
  const [staffForm, setStaffForm] = useState({ ssn: "" });
  const [patientForm, setPatientForm] = useState({ ssn: "" });
  const [message, setMessage] = useState("");

  const handleStaffChange = (e) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const submitRemoveStaff = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/staff/remove", staffForm);
      setMessage("Staff removed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitRemovePatient = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/patients/remove", patientForm);
      setMessage("Patient removed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>Remove Staff</h3>
        <form className="form-grid" onSubmit={submitRemoveStaff}>
          <input name="ssn" placeholder="SSN" value={staffForm.ssn} onChange={handleStaffChange} />
          <div className="actions">
            <button type="submit">Remove Staff</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Remove Patient</h3>
        <form className="form-grid" onSubmit={submitRemovePatient}>
          <input name="ssn" placeholder="SSN" value={patientForm.ssn} onChange={handlePatientChange} />
          <div className="actions">
            <button type="submit">Remove Patient</button>
          </div>
        </form>
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}
