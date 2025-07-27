// saathi-bazaar-frontend/src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="new-home-container">
      {/* Navigation Header */}
      <nav className="new-home-nav">
        <div className="new-nav-content">
          <div className="new-nav-logo">
            <div className="logo-laurel">🌿</div>
            <span className="new-logo-text">SathiBazaar</span>
          </div>
          <div className="new-nav-links">
          </div>
          <div className="new-nav-actions">
            <button 
              className="nav-btn nav-btn-outline"
              onClick={() => navigate('/auth')}
            >
              Login
            </button>
            <button 
              className="nav-btn nav-btn-primary"
              onClick={() => navigate('/auth')}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="new-hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-wrapper">
          <div className="hero-main-text">
            <h1 className="hindi-headline">
              Wholesale Prices,<br />
              Delivered to Your Shop.
            </h1>
          </div>
          
          <div className="user-type-buttons">
            <button 
              className="user-type-btn vendor-btn"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="btn-icon">ℹ️</div>
              <div className="btn-content">
                <div className="btn-title">About</div>
                <div className="btn-subtitle">Learn more about SathiBazaar</div>
              </div>
            </button>
            
            <button 
              className="user-type-btn shopkeeper-btn"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="btn-icon">⭐</div>
              <div className="btn-content">
                <div className="btn-title">Features</div>
                <div className="btn-subtitle">Discover what we offer</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Why Choose SathiBazaar Section */}
      <section className="why-choose-section" id="about">
        <div className="why-choose-container">
          <div className="why-choose-header">
            <h2 className="why-choose-title">
              Why Choose <span className="brand-highlight">SathiBazaar</span>?
            </h2>
            <p className="why-choose-subtitle">
              We bridge the gap between wholesale vendors and local shopkeepers 
              with trust, quality, and convenience
            </p>
          </div>
          
          <div className="features-grid-6" id="features">
            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
              </div>
              <h3 className="card-title">Direct Delivery</h3>
              <p className="card-description">
                Fresh products delivered directly from 
                wholesale vendors to your shop
              </p>
            </div>

            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="card-title">Quality Assured</h3>
              <p className="card-description">
                All vendors are verified and 
                products are quality checked
              </p>
            </div>

            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <h3 className="card-title">Fast Service</h3>
              <p className="card-description">
                Quick order processing and same-
                day delivery available
              </p>
            </div>

            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="card-title">24/7 Support</h3>
              <p className="card-description">
                Round-the-clock customer 
                support in Hindi and English
              </p>
            </div>

            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 className="card-title">Fresh Products</h3>
              <p className="card-description">
                Always fresh vegetables, fruits, and 
                daily essentials
              </p>
            </div>

            <div className="why-choose-card">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <path d="M20 8v6M23 11l-3 3-3-3"/>
                </svg>
              </div>
              <h3 className="card-title">Trusted Partners</h3>
              <p className="card-description">
                Building lasting relationships 
                between vendors and shopkeepers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Left Section - Brand and Description */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">S</div>
                <span className="footer-brand-name">SathiBazaar</span>
              </div>
              <p className="footer-description">
                Connecting local shopkeepers with wholesale vendors 
                for fresh produce and daily essentials
              </p>
              <div className="footer-social">
                <div className="social-icon whatsapp">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                </div>
                <div className="social-icon instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle Section - Support */}
            <div className="footer-section">
              <h3 className="footer-section-title">Support</h3>
              <ul className="footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Right Section - Quick Links */}
            <div className="footer-section">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#how">How It Works</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#blog">Blog</a></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="footer-section">
              <h3 className="footer-section-title">Contact</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>+91 9876543210</span>
                </div>
                <div className="contact-item">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>support@sathibazaar.com</span>
                </div>
                <div className="contact-item">
                  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="footer-bottom">
            <div className="footer-copyright">
              <span>© 2025 SathiBazaar All rights reserved.</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="footer-decoration">
          <div className="decoration-circle decoration-1"></div>
          <div className="decoration-circle decoration-2"></div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
