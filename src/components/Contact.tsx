import React from 'react';
import { ContactInfo } from '../types';
import './Contact.css';

interface ContactProps {
  contactInfo: ContactInfo;
}

const Contact: React.FC<ContactProps> = ({ contactInfo }) => {
  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <p className="contact-intro">
            I'm always open to new opportunities and collaborations. Feel free to reach out!
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <strong>Email:</strong>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </div>
            {contactInfo.phone && (
              <div className="contact-item">
                <strong>Phone:</strong>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
              </div>
            )}
            {contactInfo.location && (
              <div className="contact-item">
                <strong>Location:</strong>
                <span>{contactInfo.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
