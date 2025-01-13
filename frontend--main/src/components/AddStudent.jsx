import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/addStudent.css";

const AddStudent = () => {
  const [name, setName] = useState("");
  const [admission_number, setAdmission_number] = useState("");
  const [grade, setGrade] = useState("");
  const [use_bus, setUse_bus] = useState(false); // Fixed naming consistency
  const [balance, setBalance] = useState(0);
  const [grades, setGrades] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      setMessage("Fetching grades...");
      try {
        const response = await axios.get(
          "https://bfd46d82-011c-4928-9f66-d73819e1918a-00-38r4sqvff4osq.worf.replit.dev:5000/grades"
        );
        console.log("Grades fetched:", response.data);
        setGrades(response.data);
        setMessage("");
      } catch (error) {
        console.error("Error fetching grades:", error);
        setMessage("Error fetching grades. Please try again.");
      }
    };

    fetchGrades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const studentData = {
      name,
      admission_number,
      grade,
      balance,
      use_bus, // Corrected field reference
    };

    try {
      const response = await axios.post(
        "https://bfd46d82-011c-4928-9f66-d73819e1918a-00-38r4sqvff4osq.worf.replit.dev:5000/students",
        studentData
      );
      setMessage(response.data.message || "Student added successfully.");
      // Clear the form fields after submission
      setName("");
      setAdmission_number("");
      setGrade("");
      setUse_bus(false);
      setBalance(0);
    } catch (error) {
      console.error("Error adding student:", error);
      setMessage("Error adding student. Please try again.");
    }
  };

  return (
    <div className="add-student">
      <div className="form-container">
        <h2>Add Student</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Admission Number:</label>
            <input
              type="text"
              value={admission_number}
              onChange={(e) => setAdmission_number(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Grade:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            >
              <option value="" disabled>
                Select grade
              </option>
              {grades.map((g) => (
                <option key={g.id} value={g.grade}>
                  {g.grade}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={use_bus}
                onChange={() => setUse_bus(!use_bus)}
              />
              Will use bus
            </label>
          </div>
          <div className="form-group">
            <label>Initial Balance:</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value))}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Add Student
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;



                     
