import React, { useState } from 'react';

const BusPaymentForm = ({ studentId, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || !date || !term) {
      setError('All fields are required');
      return;
    }

    const paymentData = {
      studentId,
      amount,
      method,
      date,
      term,
    };

    try {
      const response = await fetch('https://backend1-nbbb.onrender.com/api/bus-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add bus payment');
      }

      setSuccess('Bus payment added successfully');
      onPaymentSuccess();
      setAmount('');
      setDate('');
      setTerm('Term 1');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>Add Bus Payment</h3>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <label>Amount:</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />

      <label>Payment Method:</label>
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="mpesa">M-Pesa</option>
        <option value="bank">Bank</option>
      </select>

      <label>Date:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Term:</label>
      <select value={term} onChange={(e) => setTerm(e.target.value)}>
        <option value="Term 1">Term 1</option>
        <option value="Term 2">Term 2</option>
        <option value="Term 3">Term 3</option>
      </select>

      <button type="submit">Add Bus Payment</button>
    </form>
  );
};

export default BusPaymentForm;