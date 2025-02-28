import { useEffect, useState } from 'react';
import { admin } from '@/app/lib/api';

// Transaction summary component
function TransactionSummary() {
  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalTransferred: 0,
    transactionCount: 0
  });
  
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await admin.getTransactionSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching transaction summary:', error);
      }
    };
    
    fetchSummary();
  }, []);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-gray-500 text-sm font-medium">Total Money In</h3>
        <p className="text-2xl font-bold text-green-600">${summary.totalIn.toFixed(2)}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-gray-500 text-sm font-medium">Total Money Out</h3>
        <p className="text-2xl font-bold text-red-600">${summary.totalOut.toFixed(2)}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-gray-500 text-sm font-medium">Total Transferred</h3>
        <p className="text-2xl font-bold text-blue-600">${summary.totalTransferred.toFixed(2)}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-gray-500 text-sm font-medium">Transaction Count</h3>
        <p className="text-2xl font-bold text-gray-800">{summary.transactionCount}</p>
      </div>
    </div>
  );
}

// Enhanced transaction table component
function TransactionTable() {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await admin.getAllTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    
    fetchTransactions();
  }, []);
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          All Transactions
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction: any) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.direction === 'CREDIT' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.direction === 'DEBIT'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.direction}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.senderName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.receiverName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    transaction.status === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main admin dashboard component
export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {/* Transaction summary widgets */}
      <TransactionSummary />
      
      {/* Transactions table */}
      <TransactionTable />
    </div>
  );
}