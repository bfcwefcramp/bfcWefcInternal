import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MSMEForm from './components/MSMEForm';

import Experts from './components/Experts';
import EventsPage from './components/EventsPage';

import MSMEDetail from './components/MSMEDetail';
import MSMEList from './components/MSMEList';

import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import ExpertPortal from './components/ExpertPortal';
import UserManagement from './components/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - Protected */}
          <Route element={<PrivateRoute roles={['admin']} />}>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/list" element={<Layout><MSMEList /></Layout>} />
            <Route path="/form" element={<Layout><MSMEForm /></Layout>} />
            <Route path="/experts" element={<Layout><Experts /></Layout>} />
            <Route path="/events" element={<Layout><EventsPage /></Layout>} />
            <Route path="/msme/:id" element={<Layout><MSMEDetail /></Layout>} />
          </Route>

          {/* Sudo Admin Routes */}
          <Route element={<PrivateRoute roles={['sudo_admin']} />}>
            <Route path="/users" element={<Layout><UserManagement /></Layout>} />
          </Route>

          {/* Expert Route - Protected */}
          <Route element={<PrivateRoute roles={['expert']} />}>
            <Route path="/expert-dashboard" element={<ExpertPortal />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
