import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/addStudent.css';

const AddStudent = () => {
  const [name, setName] = useState('');
  const [admission_number, setAdmission_number] = useState('');
  const [grade, setGrade] = useState('');  // Initialize as empty string for now
  const [balance, setBalance] = useState(0);
  const [use_bus, setUse_bus] = useState(false);
  const [destination_id, setDestination_id] = useState('');
  const [is_boarding, setIs_boarding] = useState(false);
  const [grades, setGrades] = useState([]);
  const [busDestinations, setBusDestinations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grades and bus destinations
        const gradeResponse = await axios.get('https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/grades');
        setGrades(gradeResponse.data);

        const destinationResponse = await axios.get('https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/destinations');
        setBusDestinations(destinationResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load grades or destinations.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!grade) {
      setMessage('Please select a grade.');
      return;
    }

    const studentData = {
      name,
      admission_number: admissionNumber,
      grade_id: grade,  // grade_id instead of grade (since your Student model uses grade_id)
      balance,
      is_boarding: isBoarding,
      use_bus: use_bus,
      destination_id: useBus ? destinationId : null,
    };

    try {
      const response = await axios.post('/students', studentData);
      setMessage(response.data.message || 'Student added successfully.');
      setName('');
      setAdmissionNumber('');
      setGrade('');
      setBalance(0);
      setUse_bus(false);
      setDestination_id('');
      setIs_boarding(false);
    } catch (error) {
      console.error('Error adding student:', error);
      setMessage(error.response?.data?.error || 'Error adding student. Please try again.');
    }
  };

  return (
    <div className="add-student">
      <h1>Add New Student</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Admission Number:</label>
          <input type="text" value={admission_number} onChange={(e) => setAdmission_number(e.target.value)} required />
        </div>
        <div>
          <label>Grade:</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} required>
            <option value="">Select Grade</option>
            {grades.length > 0 ? (
              grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.grade}  {/* Display the grade name */}
                </option>
              ))
            ) : (
              <option value="">Loading Grades...</option>
            )}
          </select>
        </div>
        <div>
          <label>Is Boarding:</label>
          <input type="checkbox" checked={is_boarding} onChange={(e) => setIs_boarding(e.target.checked)} />
        </div>
        <div>
          <label>Will Use Bus:</label>
          <input type="checkbox" checked={use_bus} onChange={(e) => setUse_bus(e.target.checked)} />
        </div>
        {use_bus && (
          <div>
            <label>Bus Destination:</label>
            <select value={destination_id} onChange={(e) => setDestination_id(e.target.value)} required>
              <option value="">Select Destination</option>
              {busDestinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Balance:</label>
          <input type="number" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value))} />
        </div>
        <button type="submit">Add Student</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddStudent;
