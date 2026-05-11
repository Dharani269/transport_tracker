import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PrivateLayout() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
