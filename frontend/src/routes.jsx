// src/routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Consult1 from './pages/Consult1';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/consult1" element={<Consult1 />} />
    </Routes>
  );
};

export default AppRoutes;
