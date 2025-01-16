import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/studentList.css";
import Header from './Header';
import { useNavigate } from "react-router-dom";
const StudentList = ({ role, onSelectStudent }) => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let url = "https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/students"; // Default for Admin & Bursar

        if (role === "teacher") {
          const staffId = localStorage.getItem("staffId"); // Assuming staffId is stored after login
          url = `https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/staff/${staffId}/students`;
        }

        const response = await axios.get(url);
        setStudents(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch students. Please try again.");
      }
    };
    fetchStudents();
  }, [role]);
  const handleAddStudent = () => {
    navigate("/add-student"); // Navigate to AddStudent page
  };

  return (
    <div className="student-list-container">
      <Header />
      <h2>Student List</h2>
      <button className="add-student-btn" onClick={handleAddStudent}>
        Add Student
      </button>
      {error && <p className="error-message">{error}</p>}

      <div className="student-list">
{students.map((student) => (
  <div
    key={student.id}
    className="student-card"
    onClick={() => onSelectStudent(student)}
  >
    <h3>{student.name}</h3>
    <p>
      <strong>Grade:</strong> {student.grade}
    </p>
    <p>
      <strong>Balance:</strong> {student.balance}
    </p>
  </div>
))}

      </div>
    </div>
  );
};

export default StudentList;
