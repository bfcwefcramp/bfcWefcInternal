import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MSMEForm from './components/MSMEForm';
import Experts from './components/Experts';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/form" element={<MSMEForm />} />
          <Route path="/experts" element={<Experts />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
