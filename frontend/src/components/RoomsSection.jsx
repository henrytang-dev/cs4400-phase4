import React, { useState } from "react";
import { post, get } from "../api";
import DataTable from "./DataTable";

export default function RoomsSection() {
  const [assignNurseForm, setAssignNurseForm] = useState({
    nurseId: "",
    roomNumber: "",
  });
  const [assignRoomForm, setAssignRoomForm] = useState({
    ssn: "", roomNumber: "", roomType: "",
  });
  const [releaseForm, setReleaseForm] = useState({ roomNumber: "" });
  const [overview, setOverview] = useState([]);
  const [message, setMessage] = useState("");

  const handleAssignNurseChange = (e) => {
    setAssignNurseForm({ ...assignNurseForm, [e.target.name]: e.target.value });
  };

  const handleAssignRoomChange = (e) => {
    setAssignRoomForm({ ...assignRoomForm, [e.target.name]: e.target.value });
  };

  const handleReleaseChange = (e) => {
    setReleaseForm({ ...releaseForm, [e.target.name]: e.target.value });
  };

  const submitAssignNurse = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/rooms/assign_nurse", assignNurseForm);
      setMessage("Nurse assigned");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitAssignRoom = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/rooms/assign_patient", assignRoomForm);
      setMessage("Room assigned to patient");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitReleaseRoom = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/rooms/release", releaseForm);
      setMessage("Room released");
    } catch (err) {
      setMessage(err.message);
    }
  };
  const loadOverview = async () => {
    setMessage("");
    try {
      const res = await get("/api/rooms/overview");
      setOverview(res.data || []);
      setMessage("Room overview refreshed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>Assign Nurse To Room</h3>
        <form className="form-grid" onSubmit={submitAssignNurse}>
          <input name="nurseId" placeholder="Nurse ID" value={assignNurseForm.nurseId} onChange={handleAssignNurseChange} />
          <input name="roomNumber" placeholder="Room number" value={assignNurseForm.roomNumber} onChange={handleAssignNurseChange} />
          <div className="actions">
            <button type="submit">Assign Nurse</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Assign room To Patient</h3>
        <form className="form-grid" onSubmit={submitAssignRoom}>
          <input name="ssn" placeholder="Patient SSN" value={assignRoomForm.ssn} onChange={handleAssignRoomChange} />
          <input name="roomNumber" placeholder="Room number" value={assignRoomForm.roomNumber} onChange={handleAssignRoomChange} />
          <input name="roomType" placeholder="Room type" value={assignRoomForm.roomType} onChange={handleAssignRoomChange} />
          <div className="actions">
            <button type="submit">Assign Room</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>release room</h3>
        <form className="form-grid" onSubmit={submitReleaseRoom}>
          <input name="roomNumber" placeholder="Room number" value={releaseForm.roomNumber} onChange={handleReleaseChange} />
          <div className="actions">
            <button type="submit">Release</button>
          </div>
        </form>
      </div>
      <div className="actions">
        <button type="button" onClick={loadOverview}>
          Load Room Overview
        </button>
      </div>
      <DataTable rows={overview} />
      {message && <div className="message">{message}</div>}
    </div>
  );
}
