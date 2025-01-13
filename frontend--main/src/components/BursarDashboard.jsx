import React, { useState } from 'react';
import StudentList from './StudentList';
import StudentDetails from './StudentDetails';
import PaymentForm from './PaymentForm';
import BusPaymentForm from './BusPaymentForm';
import '../styles/dashboard.css';

const BursarDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBusPaymentForm, setShowBusPaymentForm] = useState(false);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowPaymentForm(false);
    setShowBusPaymentForm(false);
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
            <StudentDetails student={selectedStudent} showAddPayment={false} />
            <button onClick={() => setShowPaymentForm(!showPaymentForm)}>
              {showPaymentForm ? 'Close Payment Form' : 'Add Payment'}
            </button>
            <button onClick={() => setShowBusPaymentForm(!showBusPaymentForm)}>
              {showBusPaymentForm ? 'Close Bus Payment Form' : 'Add Bus Payment'}
            </button>

            {showPaymentForm && <PaymentForm studentId={selectedStudent.id} />}
            {showBusPaymentForm && <BusPaymentForm studentId={selectedStudent.id} />}
          </>
        )}
      </div>
    </div>
  );
};

export default BursarDashboard;
