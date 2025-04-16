'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Feature Request',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill out all required fields');
      return;
    }
    
    setError('');
    // In a real app, you would send this data to a backend
    console.log('Form submitted:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'Feature Request',
        message: ''
      });
    }, 1000);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header />
      
      <div className="card p-8 mb-8 border-l-4 border-indigo-500 bg-indigo-900/20 rounded-lg">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6">Support & Feature Requests</h1>
        
        {submitted ? (
          <div className="bg-indigo-700/30 p-6 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-300 mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-semibold text-indigo-200 mb-2">Thank You!</h2>
            <p className="text-gray-300 mb-4">
              Your request has been submitted successfully. We appreciate your feedback and will consider it for future updates.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-6">
              We're constantly working to improve Hellenistic based on user feedback. If you have a suggestion
              for a new feature, found a bug, or need help using the app, please fill out the form below.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-indigo-200 mb-2">Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-indigo-950/70 border border-indigo-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-indigo-200 mb-2">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-indigo-950/70 border border-indigo-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-indigo-200 mb-2">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-indigo-950/70 border border-indigo-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Question">General Question</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-indigo-200 mb-2">Message*</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-indigo-950/70 border border-indigo-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe your feature request or issue in detail..."
                ></textarea>
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Submit Request
                </button>
              </div>
            </form>
            
            <div className="mt-12 pt-8 border-t border-indigo-800/30">
              <h2 className="text-xl font-semibold text-indigo-200 mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-indigo-300 mb-2">How often do you release updates?</h3>
                  <p className="text-gray-300">
                    We aim to release major updates every 2-3 months, with smaller bug fixes and improvements rolled out as needed.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-indigo-300 mb-2">How are feature requests prioritized?</h3>
                  <p className="text-gray-300">
                    We prioritize features based on user demand, technical feasibility, and alignment with our overall vision for the app.
                    Features that benefit the most users typically get implemented first.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-indigo-300 mb-2">What if I find a bug?</h3>
                  <p className="text-gray-300">
                    Please report any bugs using this form. Include steps to reproduce the issue, your device information,
                    and screenshots if possible.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 