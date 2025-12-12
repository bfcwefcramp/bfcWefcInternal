import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MSMEForm from './components/MSMEForm';
import Experts from './components/Experts';

import MSMEDetail from './components/MSMEDetail';
import MSMEList from './components/MSMEList';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/list" element={<MSMEList />} />
          <Route path="/form" element={<MSMEForm />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/msme/:id" element={<MSMEDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
