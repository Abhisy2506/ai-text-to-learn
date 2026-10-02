import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layouts/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes share the AppLayout shell */}
        <Route path="/" element={<AppLayout />} />
        <Route path="/course/:courseId" element={<AppLayout />} />
        <Route path="/lesson/:lessonId" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}