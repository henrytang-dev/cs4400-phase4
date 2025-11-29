import React, { useState } from "react";
import PatientsSection from "./components/PatientsSection";
import DepartmentsSection from "./components/DepartmentsSection";
import AppointmentsSection from "./components/AppointmentsSection";
import OrdersSection from "./components/OrdersSection";
import RoomsSection from "./components/RoomsSection";
import OffboardingSection from "./components/OffboardingSection";

const tabs = [
  { id: "patients", label: "Patients", element: <PatientsSection /> },
  { id: "departments", label: "Departments/Staff", element: <DepartmentsSection /> },
  { id: "appointments", label: "Appointments", element: <AppointmentsSection /> },
  { id: "orders", label: "Orders", element: <OrdersSection /> },
  { id: "rooms", label: "Rooms", element: <RoomsSection /> },
  { id: "offboarding", label: "Offboarding", element: <OffboardingSection /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("patients");

  return (
    <div className="app">
      <h1>Er management system</h1>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel">
        {tabs.map((tab) =>
          activeTab === tab.id ? <div key={tab.id}>{tab.element}</div> : null
        )}
      </div>
    </div>
  );
}
