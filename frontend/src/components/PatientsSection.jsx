import React, { useState } from "react";
import { post, get } from "../api";
import DataTable from "./DataTable";

export default function PatientsSection() {
  const [addForm, setAddForm] = useState({ssn: "",first_name: "",last_name: "",birthdate: "",address: "",funds: "",contact: "",  });
  const [fundsForm, setFundsForm] = useState({ ssn: "", funds: "" });
  const [charges, setCharges] = useState([]);
  const [message, setMessage] = useState("");

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleFundsChange = (e) => {
    setFundsForm({ ...fundsForm, [e.target.name]: e.target.value });
  };

  const submitAddPatient = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/patients/add", addForm);
      setMessage("Patient added");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitAddFunds = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/patients/add_funds", fundsForm);
      setMessage("Funds added");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadCharges = async () => {
    setMessage("");
    try {
      const res = await get("/api/patients/outstanding_charges");
      setCharges(res.data || []);
      setMessage("Outstanding charges refreshed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>add patient</h3>
        <form className="form-grid" onSubmit={submitAddPatient}>
          <input name="ssn" placeholder="SSN" value={addForm.ssn} onChange={handleAddChange} />
          <input name="first_name" placeholder="First name" value={addForm.first_name} onChange={handleAddChange} />
          <input name="last_name" placeholder="Last name" value={addForm.last_name} onChange={handleAddChange} />
          <input type="date" name="birthdate" placeholder="Birthdate" value={addForm.birthdate} onChange={handleAddChange} />
          <input name="address" placeholder="Address" value={addForm.address} onChange={handleAddChange} />
          <input name="funds" placeholder="Funds" value={addForm.funds} onChange={handleAddChange} />
          <input name="contact" placeholder="Contact" value={addForm.contact} onChange={handleAddChange} />
          <div className="actions">
            <button type="submit">Add</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>add funds</h3>
        <form className="form-grid" onSubmit={submitAddFunds}>
          <input name="ssn" placeholder="SSN" value={fundsForm.ssn} onChange={handleFundsChange} />
          <input name="funds" placeholder="Funds" value={fundsForm.funds} onChange={handleFundsChange} />
          <div className="actions">
            <button type="submit">Add Funds</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Outstanding Charges</h3>
        <div className="actions">
          <button type="button" onClick={loadCharges}>
            Refresh Outstanding Charges
          </button>
        </div>
      </div>
      <DataTable rows={charges} />
      {message && <div className="message">{message}</div>}
    </div>
  );
}
