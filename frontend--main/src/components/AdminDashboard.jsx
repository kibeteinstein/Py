import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import Header from "./Header";
const AdminDashboard = () => {
  const navigate = useNavigate();

  const sections = [
    { label: "Students", icon: "📚", path: "/students" },
    { label: "Staff", icon: "👩‍🏫", path: "/admin/staff" },
    { label: "Notifications", icon: "🔔", path: "/admin/notifications" },
    { label: "Gallery", icon: "🖼️", path: "/admin/gallery" },
    { label: "Terms", icon: "📅", path: "/admin/terms" },
    { label: "Fees", icon: "💰", path: "/admin/fees" },
    { label: "Grades", icon: "🎓", path: "/admin/grades" },
    { label: "Classes", icon: "🏫", path: "/admin/classes" },
  ];

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        <p>Effortlessly manage your school with these powerful tools:</p>
        <div className="dashboard-sections">
          {sections.map((section, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(section.path)}
            >
              <div className="card-icon">{section.icon}</div>
              <div className="card-title">{section.label}</div>
            </div>
          ))}
        </div>
        <footer className="dashboard-footer">
          <p>
            Designed for seamless school management. <span>&copy; 2025</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
    
