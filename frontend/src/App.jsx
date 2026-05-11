import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import Schedules from './pages/Schedules';
import ETACalculator from './pages/ETACalculator';
import Settings from './pages/Settings';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/eta" element={<ETACalculator />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
