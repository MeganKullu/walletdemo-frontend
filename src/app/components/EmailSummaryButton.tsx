// components/EmailSummaryButton.jsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { user } from '../lib/api';

export default function EmailSummaryButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const handleEmailSummary = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await user.emailTransactionSummary();
      setMessageType('success');
      setMessage('Success! Your transaction summary has been sent to your email address.');
    } catch (error) {
      setMessageType('error');
      setMessage('Error: ' + (error as any).response?.data || 'Could not send email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-start mt-6">
      <button 
        onClick={handleEmailSummary}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <FaEnvelope className="mr-2" />
            Email My Transaction Summary
          </>
        )}
      </button>
      
      {message && (
        <div className={`mt-2 text-sm rounded-md p-2 ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-600 border border-green-200' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}