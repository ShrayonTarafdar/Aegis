import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import Bank from "./pages/Bank";
import Hacker from "./pages/Hacker";
// (Import other pages as we build them)

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand">Project Aegis</span>
      </nav>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pay" element={<Payment />} />
        <Route path="/bank" element={<Bank />} />
        <Route path="/hacker" element={<Hacker />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
