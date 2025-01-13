import React from 'react';
import { useAuth } from '../auth/AuthProvider'; // Assuming useAuth is in the auth folder
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Header = () => {
  const { isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'bursar':
        navigate('/BursarDashboard');
        break;
      case 'director':
        navigate('/DirectorDashboard');
        break;
      case 'teacher':
        navigate('/TeacherDashboard');
        break;
      case 'student':
        navigate('/StudentDashboard');
        break;
      default:
        navigate('/LoginDashboard');
    }
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      logout(); // Assuming you have a logout function in the auth provider
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white p-3 shadow-lg sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        {/* School Logo */}
        <img src={logo} alt="School Logo" className="logo img-fluid" style={{ width: '150px', height: 'auto' }} />

        {/* Navigation Items */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <nav>
          <ul className="nav">
          <li className="nav-item">
              <button className="btn btn-light me-2 fw-bold" onClick={() => navigate('/Home')}>Home</button>
            </li>
            <li className="nav-item">
              <button className="btn btn-light me-2 fw-bold" onClick={goToDashboard}>Dashboard</button>
            </li>
            <li className="nav-item">
              <button className="btn btn-light me-2 fw-bold" onClick={() => navigate('/events')}>Events</button>
            </li>
            <li className="nav-item">
              <button className="btn btn-light me-2 fw-bold" onClick={() => navigate('/gallery')}>Gallery</button>
            </li>
            <li className="nav-item">
              <button className="btn btn-light me-2 fw-bold" onClick={() => navigate('/notifications')}>Notifications</button>
            </li>
            <li className="nav-item dropdown">
              <button className="btn btn-light dropdown-toggle fw-bold" id="aboutDropdown" data-bs-toggle="dropdown">
                About Us
              </button>
              <ul className="dropdown-menu" aria-labelledby="aboutDropdown">
                <li><a className="dropdown-item" href="/about">About Us</a></li>
                <li><a className="dropdown-item" href="/contact">Contact Us</a></li>
              </ul>
            </li>

            {/* Login / Logout Button */}
            <li className="nav-item">
              <button 
                className={`btn ${isLoggedIn ? 'btn-danger' : 'btn-success'} fw-bold`} 
                onClick={handleLoginLogout}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
