import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentPage from './PaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/pay" element={<PaymentPage />} />
      {/* Fallback route if they land on home */}
      <Route path="/" element={<div className="text-center p-10">Welcome to SugamPay. Please initiate payment from a merchant site.</div>} />
    </Routes>
  );
}

export default App;