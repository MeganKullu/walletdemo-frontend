// components/TransactionSummary.jsx
'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/app/lib/api';
import toast from 'react-hot-toast';
export default function TransactionSummary() {
  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalTransferred: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await admin.getTransactionSummary();
        setSummary(data);
        setError(null);
      } catch (error) {
        toast.error('Something went wrong, please try again later');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        {error}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Money In",
      value: `$${summary.totalIn.toFixed(2)}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    },
    {
      title: "Total Money Out",
      value: `$${summary.totalOut.toFixed(2)}`,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l9 2-9 18-9-18 9-2zm0 0v8" />
        </svg>
      )
    },
    {
      title: "Total Transferred",
      value: `$${summary.totalTransferred.toFixed(2)}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      title: "Transaction Count",
      value: summary.transactionCount.toString(),
      color: "text-gray-800",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <div 
          key={index} 
          className={`${card.bgColor} ${card.borderColor} border rounded-lg shadow-sm p-4 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
            <div className="rounded-full p-2">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}