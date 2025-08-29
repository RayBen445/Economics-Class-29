import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>LAUTECH Economics '29</h4>
          <p>Community Portal for LAUTECH Economics Class of 2029</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#help">Help & Support</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Features</h4>
          <ul>
            <li>Academic Planning</li>
            <li>Study Groups</li>
            <li>Resource Sharing</li>
            <li>Community Forums</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 support@lautech-econ29.com</p>
          <p>🏫 LAUTECH, Ogbomoso</p>
          <div className="footer-social">
            <span>🌐</span>
            <span>📱</span>
            <span>💬</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 LAUTECH Economics Class of '29. All rights reserved.</p>
        <p>Built with ❤️ for academic excellence</p>
      </div>
    </footer>
  );
};