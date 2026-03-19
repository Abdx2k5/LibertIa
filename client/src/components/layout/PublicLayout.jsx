import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090b" }}>
      <Outlet />
    </div>
  );
}