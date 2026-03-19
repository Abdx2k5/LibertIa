// DashboardLayout.jsx
import { Outlet } from 'react-router-dom';
export default function DashboardLayout() {
  return <div style={{background:'#09090b',minHeight:'100vh'}}><Outlet /></div>;
}