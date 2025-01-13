import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Custom CSS for additional flair

import Header from './Header'
import carousel1 from '../assets/carousel1.jpg';
import carousel2 from '../assets/carousel2.jpg';
import carousel3 from '../assets/carousel3.jpg';
import carousel4 from '../assets/carousel4.jpg';
import carousel5 from '../assets/carousel5.jpg';
import assignmentsImage from '../assets/assignmentsImage.jpg';
import pastPapersImage from '../assets/pastpapers.jpg';
import fairyTalesImage from '../assets/fairytales.jpg';
import notificationsImage from '../assets/notifications.jpg';
import reportCardsImage from '../assets/reportCardsImage.jpg';
import schoolImage from '../assets/schoolImage.jpg'; // This assumes there is a school image file

const Home = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <Header />
      {/* Main Carousel */}
     <div id="homeCarousel" className="carousel slide mt-5" data-bs-ride="carousel">
  <div className="carousel-inner">
    {[carousel1, carousel2, carousel3, carousel4, carousel5].map((image, index) => (
      <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
        <img
          src={image}
          className="d-block w-100"
          alt={`Slide ${index + 1}`}
          style={{
            objectFit: 'cover', // Ensure image scales properly
            height: '60vh', // Use percentage-based height for flexibility
          }}
        />
        <div className="carousel-caption d-none d-md-block">
          <h5>{['Excellence in Learning', 'Empowering Students', 'Innovation and Growth', 'Nurturing Talents', 'Building Leaders'][index]}</h5>
        </div>
      </div>
    ))}
  </div>
  <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Previous</span>
  </button>
  <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="visually-hidden">Next</span>
  </button>
</div>


      {/* Vision, Mission, Core Values */}
      <section className="container mt-5">
        <div className="row">
          <div className="col-md-4 text-center mb-4">
            <h2 className="text-primary fw-bold">Our Vision</h2>
            <p className="lead">To nurture roots to grow and wings to fly for our pupils.</p>
          </div>
          <div className="col-md-4 text-center mb-4">
            <h2 className="text-primary fw-bold">Our Mission</h2>
            <p className="lead">To be a center of affordable quality learning responsive to modern challenges.</p>
          </div>
          <div className="col-md-4 text-center mb-4">
            <h2 className="text-primary fw-bold">Core Values</h2>
            <ul className="list-unstyled">
              <li className="mb-2">Humility</li>
              <li className="mb-2">Excellence</li>
              <li className="mb-2">Accountability</li>
              <li className="mb-2">Respect</li>
              <li className="mb-2">Teamwork</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Study Corner */}
      <section className="container mt-5">
        <h2 className="text-center text-primary fw-bold mb-4">Study Corner</h2>
        <div id="studyCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner shadow-lg rounded">
            {[assignmentsImage, pastPapersImage, fairyTalesImage, notificationsImage, reportCardsImage].map((image, index) => (
              <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <img src={image} className="d-block w-100" alt={['Assignments', 'Past Papers', 'Fairy Tales', 'Notifications', 'Report Cards'][index]} style={{ height: '400px', objectFit: 'cover' }} />
                <div className="carousel-caption d-none d-md-block">
                  <h5>{['Assignments', 'Past Papers', 'Fairy Tales', 'Notifications', 'Report Cards'][index]}</h5>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#studyCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#studyCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      {/* Administrator's Message */}
      <section className="container mt-5">
        <h2 className="text-center text-primary fw-bold mb-4">Administrator's Message</h2>
        <div className="row align-items-center shadow-lg p-3 mb-5 bg-body rounded">
          <div className="col-md-4 text-center">
            <img src={schoolImage} alt="Admin" className="img-fluid rounded-circle" style={{ width: '150px', height: '150px' }} />
          </div>
          <div className="col-md-8">
            <p className="lead">Welcome to Msingi Bora Sigor Academy, where we believe in empowering the next generation of leaders. Our school provides a nurturing environment that encourages creativity, innovation, and personal growth. Join us in shaping a brighter future!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-light p-3 text-center">
        <p>&copy; 2024 Msingi Bora Sigor Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
