import React, { useState } from "react";
import { post, get } from "../api";
import DataTable from "./DataTable";

export default function AppointmentsSection() {
  const [bookForm, setBookForm] = useState({
    patientId: "",
    apptDate: "",
    apptTime: "",
    apptCost: "",
  });
  const [assignForm, setAssignForm] = useState({
    patientId: "",
    apptDate: "",
    apptTime: "",
    doctorId: "",
  });
  const [symptomForm, setSymptomForm] = useState({
    patientId: "",
    numDays: "",
    apptDate: "",
    apptTime: "",
    symptomType: "",
  });
  const [completeForm, setCompleteForm] = useState({
    patientId: "",
    apptDate: "",
    apptTime: "",
  });
  const [overview, setOverview] = useState([]);
  const [message, setMessage] = useState("");

  const handleBookChange = (e) => {
    setBookForm({ ...bookForm, [e.target.name]: e.target.value });
  };

  const handleAssignChange = (e) => {
    setAssignForm({ ...assignForm, [e.target.name]: e.target.value });
  };

  const handleSymptomChange = (e) => {
    setSymptomForm({ ...symptomForm, [e.target.name]: e.target.value });
  };

  const handleCompleteChange = (e) => {
    setCompleteForm({ ...completeForm, [e.target.name]: e.target.value });
  };

  const submitBook = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/appointments/book", bookForm);
      setMessage("Appointment booked");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/appointments/assign_doctor", assignForm);
      setMessage("Doctor assigned");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitSymptom = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/appointments/record_symptom", symptomForm);
      setMessage("Symptom recorded");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/appointments/complete", completeForm);
      setMessage("Appointment completed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadOverview = async () => {
    setMessage("");
    try {
      const res = await get("/api/appointments/symptoms_overview");
      setOverview(res.data || []);
      setMessage("Symptoms overview refreshed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>Book Appointment</h3>
        <form className="form-grid" onSubmit={submitBook}>
          <input name="patientId" placeholder="Patient ID" value={bookForm.patientId} onChange={handleBookChange} />
          <input type="date" name="apptDate" placeholder="Date" value={bookForm.apptDate} onChange={handleBookChange} />
          <input
            type="text"
            name="apptTime"
            placeholder="HH:MM:SS"
            value={bookForm.apptTime}
            onChange={handleBookChange}
          />
          <input name="apptCost" placeholder="Cost" value={bookForm.apptCost} onChange={handleBookChange} />
          <div className="actions">
            <button type="submit">Book</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Assign Doctor</h3>
        <form className="form-grid" onSubmit={submitAssign}>
          <input name="patientId" placeholder="Patient ID" value={assignForm.patientId} onChange={handleAssignChange} />
          <input type="date" name="apptDate" placeholder="Date" value={assignForm.apptDate} onChange={handleAssignChange} />
          <input
            type="text"
            name="apptTime"
            placeholder="HH:MM:SS"
            value={assignForm.apptTime}
            onChange={handleAssignChange}
          />
          <input name="doctorId" placeholder="Doctor ID" value={assignForm.doctorId} onChange={handleAssignChange} />
          <div className="actions">
            <button type="submit">Assign</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>record symptom</h3>
        <form className="form-grid" onSubmit={submitSymptom}>
          <input name="patientId" placeholder="Patient ID" value={symptomForm.patientId} onChange={handleSymptomChange} />
          <input name="numDays" placeholder="Number of days" value={symptomForm.numDays} onChange={handleSymptomChange} />
          <input type="date" name="apptDate" placeholder="Date" value={symptomForm.apptDate} onChange={handleSymptomChange} />
          <input
            type="text"
            name="apptTime"
            placeholder="HH:MM:SS"
            value={symptomForm.apptTime}
            onChange={handleSymptomChange}
          />
          <input name="symptomType" placeholder="Symptom type" value={symptomForm.symptomType} onChange={handleSymptomChange} />
          <div className="actions">
            <button type="submit">Record</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Complete Appointment</h3>
        <form className="form-grid" onSubmit={submitComplete}>
          <input name="patientId" placeholder="Patient ID" value={completeForm.patientId} onChange={handleCompleteChange} />
          <input type="date" name="apptDate" placeholder="Date" value={completeForm.apptDate} onChange={handleCompleteChange} />
          <input
            type="text"
            name="apptTime"
            placeholder="HH:MM:SS"
            value={completeForm.apptTime}
            onChange={handleCompleteChange}
          />
          <div className="actions">
            <button type="submit">Complete</button>
          </div>
        </form>
      </div>
      <div className="actions">
        <button type="button" onClick={loadOverview}>
          Load Symptoms Overview
        </button>
      </div>
      <DataTable rows={overview} />
      {message && <div className="message">{message}</div>}
    </div>
  );
}
