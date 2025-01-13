
import React, { useState } from 'react';
import StudentList from './StudentList';
import StudentDetails from './StudentDetails';

const TeacherDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      <StudentList role="teacher" onSelectStudent={setSelectedStudent} />
      <StudentDetails student={selectedStudent} showAddPayment={false} />
    </div>
  );
};

export default TeacherDashboard;
