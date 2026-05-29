import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { AgentChat } from './pages/AgentChat';
import { ProductsCRUD } from './pages/ProductsCRUD';
import { CompetitorIntel } from './pages/CompetitorIntel';
import { NetworkHealth } from './pages/NetworkHealth';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="chat" element={<AgentChat />} />
            <Route path="products" element={<ProductsCRUD />} />
            <Route path="competitors" element={<CompetitorIntel />} />
            <Route path="network" element={<NetworkHealth />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
