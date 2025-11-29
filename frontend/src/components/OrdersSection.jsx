import React, { useState } from "react";
import { post } from "../api";

export default function OrdersSection() {
  const [placeForm, setPlaceForm] = useState({
    orderNumber: "", priority: "", patientId: "", doctorId: "", cost: "", labType: "", drug: "", dosage: "",
  });
  const [completeForm, setCompleteForm] = useState({ num_orders: "" });
  const [message, setMessage] = useState("");

  const handlePlaceChange = (e) => {
    setPlaceForm({ ...placeForm, [e.target.name]: e.target.value });
  };

  const handleCompleteChange = (e) => {
    setCompleteForm({ ...completeForm, [e.target.name]: e.target.value });
  };

  const submitPlaceOrder = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/orders/place", placeForm);
      setMessage("Order placed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const submitCompleteOrders = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await post("/api/orders/complete", completeForm);
      setMessage("Orders completed");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="section">
      <div className="card">
        <h3>Place Order</h3>
        <form className="form-grid" onSubmit={submitPlaceOrder}>
          <input name="orderNumber" placeholder="Order number" value={placeForm.orderNumber} onChange={handlePlaceChange} />
          <input name="priority" placeholder="Priority" value={placeForm.priority} onChange={handlePlaceChange} />
          <input name="patientId" placeholder="Patient ID" value={placeForm.patientId} onChange={handlePlaceChange} />
          <input name="doctorId" placeholder="Doctor ID" value={placeForm.doctorId} onChange={handlePlaceChange} />
          <input name="cost" placeholder="Cost" value={placeForm.cost} onChange={handlePlaceChange} />
          <input name="labType" placeholder="Lab type" value={placeForm.labType} onChange={handlePlaceChange} />
          <input name="drug" placeholder="Drug" value={placeForm.drug} onChange={handlePlaceChange} />
          <input name="dosage" placeholder="Dosage" value={placeForm.dosage} onChange={handlePlaceChange} />
          <div className="actions">
            <button type="submit">Place Order</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>Complete Orders</h3>
        <form className="form-grid" onSubmit={submitCompleteOrders}>
          <input name="num_orders" placeholder="Number of orders" value={completeForm.num_orders} onChange={handleCompleteChange} />
          <div className="actions">
            <button type="submit">Complete</button>
          </div>
        </form>
      </div>
      {message && <div className="message">{message}</div>}
    </div>
  );
}
