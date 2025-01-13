import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DirectorDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [paymentsPerDay, setPaymentsPerDay] = useState([]);
  const [paymentsPerMonth, setPaymentsPerMonth] = useState(0);
  const [paymentsPerTerm, setPaymentsPerTerm] = useState(0);
  const [paymentsPerYear, setPaymentsPerYear] = useState(0);
  const [totalExpected, setTotalExpected] = useState(0);
  const [termPayments, setTermPayments] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch admins, payments, and term-related data on mount
  useEffect(() => {
    const fetchAdminsAndPayments = async () => {
      try {
        // Fetch admins
        const adminResponse = await axios.get('https://backend1-nbbb.onrender.com/users?role=Admin');
        setAdmins(adminResponse.data);

        // Fetch payments per day
        const dayResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/day');
        setPaymentsPerDay(dayResponse.data);

        // Fetch payments per month
        const monthResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/month');
        setPaymentsPerMonth(monthResponse.data.total);

        // Fetch payments per term
        const termResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/term');
        setPaymentsPerTerm(termResponse.data.total);

        // Fetch payments per year
        const yearResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/year');
        setPaymentsPerYear(yearResponse.data.total);

        // Fetch total expected for the term
        const expectedResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/expected');
        setTotalExpected(expectedResponse.data.total);

        // Fetch all payments made for the term
        const termPaymentsResponse = await axios.get('https://backend1-nbbb.onrender.com/payments/term/all');
        setTermPayments(termPaymentsResponse.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAdminsAndPayments();
  }, []);

  // Delete Admin functionality
  const deleteAdmin = async (adminId) => {
    try {
      await axios.delete(`https://backend1-nbbb.onrender.com/users/${adminId}`);
      alert('Admin deleted');
      setAdmins(admins.filter(admin => admin.id !== adminId));
    } catch (err) {
      console.error(err);
    }
  };

  // Add notification
  const addNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://backend1-nbbb.onrender.com/notifications', { message: notificationMessage });
      alert('Notification added');
      setNotificationMessage(''); // Clear the input after submission
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Director Dashboard</h2>

      {/* Admin Management */}
      <h3>Admin Management</h3>
      <ul>
        {admins.map(admin => (
          <li key={admin.id}>
            {admin.name} - {admin.email}
            <button onClick={() => deleteAdmin(admin.id)}>Delete Admin</button>
          </li>
        ))}
      </ul>

      {/* Payments Per Day */}
      <h3>Payments Made Today</h3>
      <ul>
        {paymentsPerDay.map(payment => (
          <li key={payment.id}>
            {payment.date} - Amount: {payment.amount}
          </li>
        ))}
      </ul>

      {/* Payments Per Month */}
      <h3>Total Payments for the Month</h3>
      <p>Total Amount: {paymentsPerMonth}</p>

      {/* Payments Per Term */}
      <h3>Total Payments for the Term</h3>
      <p>Total Amount: {paymentsPerTerm}</p>

      {/* Payments Per Year */}
      <h3>Total Payments for the Year</h3>
      <p>Total Amount: {paymentsPerYear}</p>

      {/* Total Expected Payment for the Term */}
      <h3>Total Expected Payment for the Term</h3>
      <p>Expected Amount: {totalExpected}</p>

      {/* All Payments Made for the Term */}
      <h3>All Payments for the Term</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Amount</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {termPayments.map(payment => (
            <tr key={payment.id}>
              <td>{payment.date}</td>
              <td>{payment.studentName}</td>
              <td>{payment.amount}</td>
              <td>{payment.method}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Notification */}
      <h3>Add Notification</h3>
      <form onSubmit={addNotification}>
        <textarea
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          placeholder="Enter notification message"
          required
        />
        <button type="submit">Add Notification</button>
      </form>
    </div>
  );
};

export default DirectorDashboard;
