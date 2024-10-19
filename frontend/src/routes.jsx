// src/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Consult1 from './pages/Consult1';
import Consult2 from './pages/Consult2';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/consult1" element={<Consult1 />} />
      <Route path="/consult2" element={<Consult2 />} />
    </Routes>
  );
};

export default AppRoutes;
