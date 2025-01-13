import React, { useState } from 'react';

const PaymentForm = ({ studentId, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePayment = async () => {
    setError('');
    setSuccess('');

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://backend1-nbbb.onrender.com/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          amount: parseFloat(amount),
          method,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment.');
      }

      setSuccess('Payment successfully added!');
      onPaymentSuccess();
      setAmount('');
      setMethod('cash');
    } catch (err) {
      setError(err.message || 'Failed to add payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Make Payment</h4>
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>
      <div>
        <label>Method:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="mpesa">M-Pesa</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>
      <div>
        <label>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Add Payment'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default PaymentForm;
