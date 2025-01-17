import React, { useState } from 'react';
import StudentList from './StudentList';
import StudentDetails from './StudentDetails';
import PaymentForm from './PaymentForm';
import '../styles/dashboard.css';

const BursarDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowPaymentForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <h2>Bursar Dashboard</h2>
        <StudentList role="bursar" onSelectStudent={handleSelectStudent} />
      </div>
      <div className="dashboard-section">
        {selectedStudent && (
          <>
            <StudentDetails student={selectedStudent} />
            <button onClick={() => setShowPaymentForm(!showPaymentForm)}>
              {showPaymentForm ? 'Close Payment Form' : 'Add Payment'}
            </button>
            {showPaymentForm && <PaymentForm studentId={selectedStudent.id} />}
          </>
        )}
      </div>
    </div>
  );
};

export default BursarDashboard;

