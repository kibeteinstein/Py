import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentTable from './PaymentTable';  // Importing the reusable component for payments

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [student, setStudent] = useState(null);  // Store the full student data, including grade
  const [studentId, setStudentId] = useState('');  // Assuming you have a way to get the studentId

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student-specific data (including their grade)
        const studentResponse = await axios.get(`https://backend1-nbbb.onrender.com/students/${studentId}`);
        const paymentsResponse = await axios.get(`https://backend1-nbbb.onrender.com/payments?studentId=${studentId}`);

        setStudent(studentResponse.data);
        setPayments(paymentsResponse.data);
        setBalance(studentResponse.data.balance);  // Assuming balance is part of the student's data

        // Fetch assignments based on the student's grade
        const assignmentsResponse = await axios.get(`https://backend1-nbbb.onrender.com/assignments?grade=${studentResponse.data.grade}`);
        setAssignments(assignmentsResponse.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  return (
    <div>
      <h2>Student Dashboard</h2>

      {student && (
        <>
          {/* Balance Section */}
          <div>
            <h3>Your Balance: {balance}</h3>
          </div>

          {/* Assignments Section */}
          <div>
            <h3>Your Assignments for Grade {student.grade}</h3>
            <ul>
              {assignments.map((assignment) => (
                <li key={assignment.id}>
                  {assignment.name} - <a href={assignment.downloadLink} target="_blank" rel="noopener noreferrer">Download</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments Section */}
          <div>
            <h3>Your Payments</h3>
            <PaymentTable payments={payments} balance={balance} />
          </div>

          {/* Notifications Section */}
          <div>
            <h3>Add Notification</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const notification = { message: e.target.message.value, studentId };
                axios.post(`https://backend1-nbbb.onrender.com/notifications`, notification)
                  .then(() => alert('Notification added'))
                  .catch((err) => console.error(err));
              }}
            >
              <textarea name="message" placeholder="Enter notification message" required></textarea>
              <button type="submit">Add Notification</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
