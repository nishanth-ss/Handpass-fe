// DashboardLayout.jsx
import { Button } from "@mui/material";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const tabs = [
    { to: "device-management", label: "Device Management", icon: "📱" },
    { to: "connection-test", label: "Connection Test", icon: "🔌" },
    { to: "user-register", label: "User Register", icon: "📝" },
    { to: "user-delete", label: "User Delete", icon: "🗑️" },
    { to: "user-query", label: "User Query", icon: "🔍" },
    { to: "user-image", label: "User Image", icon: "🖼️" },
    { to: "group-management", label: "Group Management", icon: "👥" },
    { to: "rules-management", label: "Rules Management", icon: "📜" },
    { to: "pass-record", label: "Pass Record", icon: "📊" },
    { to: "reports", label: "Reports", icon: "📊" },
    { to: "firmware-check", label: "Firmware Check", icon: "🔄" },
  ];

  const navigate = useNavigate();
  const handleLogout = () => { navigate('/'); };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "#fff", padding: 20, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)" }}>
        <h2>Handpass-500 MS</h2>

        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            style={({ isActive }) => ({
              display: "block",
              padding: "10px",
              margin: "6px 0",
              background: isActive ? "#1890ff" : "transparent",
              color: isActive ? "#fff" : "#000",
              borderRadius: 8,
              textDecoration: "none"
            })}
          >
            <span style={{ marginRight: 10 }}>{t.icon}</span>
            {t.label}
          </NavLink>
        ))}

        <Button variant="outlined" color="danger" fullWidth onClick={handleLogout}>Logout</Button>

      </aside>

      {/* Main content */}
      <div style={{ flex: 1, backgroundColor: "#f1f1f1" }}>
        <main style={{ flex: 1, padding: 20, margin: "1rem", background: "#fff", height: "calc(100vh - 100px)", borderRadius: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
