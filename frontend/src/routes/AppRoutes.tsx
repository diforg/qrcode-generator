import { Route, Routes } from "react-router-dom";

import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { DashboardPage } from "../pages/DashboardPage";
import { GeneratorPage } from "../pages/GeneratorPage";
import { HistoryPage } from "../pages/HistoryPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";


export function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}