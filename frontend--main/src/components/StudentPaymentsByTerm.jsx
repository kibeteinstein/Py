import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentPaymentsByTerm = ({ studentId }) => {
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch available terms
    const fetchTerms = async () => {
      try {
        const response = await axios.get('https://backend1-nbbb.onrender.com/terms');
        setTerms(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch terms.');
      }
    };

    fetchTerms();
  }, []);

  const fetchPaymentsByTerm = async (termId) => {
    try {
      const response = await axios.get(`https://backend1-nbbb.onrender.com/students/${studentId}/payments/term/${termId}`);
      setPayments(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch payments for the selected term.');
    }
  };

  return (
    <div>
      <h4>Student Payments by Term</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <label>Select Term: </label>
      <select value={selectedTerm} onChange={(e) => {
        setSelectedTerm(e.target.value);
        fetchPaymentsByTerm(e.target.value);
      }}>
        <option value="">-- Select Term --</option>
        {terms.map(term => (
          <option key={term.id} value={term.id}>
            {term.name} ({term.start_date} - {term.end_date})
          </option>
        ))}
      </select>

      <h5>Payments for Selected Term:</h5>
      {payments.length > 0 ? (
        <ul>
          {payments.map(payment => (
            <li key={payment.id}>
              Amount: {payment.amount} | Date: {new Date(payment.date).toLocaleDateString()} | Method: {payment.method}
            </li>
          ))}
        </ul>
      ) : (
        <p>No payments found for this term.</p>
      )}

      <button onClick={() => generateReceipt(payments)}>Generate Receipt</button>
    </div>
  );
};

// Receipt Generation
const generateReceipt = (payments) => {
  if (payments.length === 0) {
    alert('No payments to generate a receipt.');
    return;
  }

  const receiptContent = payments.map(payment => (
    `Amount: ${payment.amount}, Date: ${new Date(payment.date).toLocaleDateString()}, Method: ${payment.method}`
  )).join('\n');

  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(`<pre>${receiptContent}</pre>`);
  receiptWindow.document.write('<h4>Thank you for your payment!</h4>');
  receiptWindow.document.close();
};

export default StudentPaymentsByTerm;
