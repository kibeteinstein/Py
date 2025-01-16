import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/addStudent.css';
const AddStudent = () => {
  const [name, setName] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('');
  const [balance, setBalance] = useState(0);
  const [use_bus, setUse_bus] = useState(false);
  const [destination_id, setDestination_id] = useState(null);
  const [is_boarding, setIs_boarding] = useState(false); // State for is_boarding
  const [grades, setGrades] = useState([]);
  const [busDestinations, setBuDestinations] = useState([]);
  const [terms, setTerms] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch grades, bus destinations, and terms from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch grades
        const gradeResponse = await axios.get('https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/grades');
        setGrades(gradeResponse.data);

        // Fetch bus destinations
        const destinationResponse = await axios.get('https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/destinations');
        setBusDestinations(destinationResponse.data);

        // Fetch active terms
        const termResponse = await axios.get('https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/terms');
        setTerms(termResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Error loading data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!grade) {
      setMessage("Please select a grade.");
      return;
    }

    // Ensure a term is selected
    const activeTerm = terms.find(term => term.is_active);
    if (!activeTerm) {
      setMessage("No active term found.");
      return;
    }

    const studentData = {
      name,
      admission_number: admissionNumber,
      phone,
      grade_id: grade, // Send grade ID
      balance,
      use_bus: use_bus,
      destination_id: use_bus ? destination_id : null, // Send destination ID if using bus
      is_boarding: is_boarding, // Include is_boarding in the data
      
      password: "securePassword", // Placeholder password
      term_id: activeTerm.id, // Pass active term ID
    };

    try {
      const response = await axios.post(
        "https://7f47d908-dbee-420b-bbaa-bb243aa6b89a-00-3i21golrk2i7y.spock.replit.dev:5000/students",
        studentData
      );
      setMessage(response.data.message || "Student added successfully.");
      // Reset form fields after successful submission
      setName('');
      setAdmissionNumber('');
      setPhone('');
      setGrade('');
      setBalance(0);
      setUse_bus(false);
      setIs_boarding(false); // Reset is_boarding checkbox
      
      setDestination_id(null);
    } catch (error) {
      console.error("Error adding student:", error);
      setMessage(
        error.response?.data?.error || "Error adding student. Please try again."
      );
    }
  };

  return (
    <div>
      <h1>Add New Student</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Admission Number:</label>
          <input type="text" value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} required />
        </div>
        <div>
          <label>Phone:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label>Grade:</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} required>
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Balance:</label>
          <input type="number" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value))} />
        </div>
        <div>
  <label>Is Boarding:</label>
  <input type="checkbox" checked={is_boarding} onChange={(e) => setIs_boarding(e.target.checked)} />
</div>
        
        <div>
          <label>Will use Bus:</label>
          <input type="checkbox" checked={use_bus} onChange={(e) => setUse_bus(e.target.checked)} />
        </div>
        {use_bus && (
          <div>
            <label>Bus Destination:</label>
            <select value={destination_id} onChange={(e) => setDestination_id(e.target.value)} required>
              <option value="">Select Destination</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </div>
      
        )}
        <button type="submit">Add Student</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddStudent;





                     
