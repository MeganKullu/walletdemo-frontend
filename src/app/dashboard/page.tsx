'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/components/AuthGuard';
import Navigation from '@/app/components/Navigation';
import { wallet, user } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

interface WalletInfo {
  balance: number;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    timestamp: string;
    status: string;
    description: string;
    senderName: string;
    receiverName: string;
  }>;
}

interface UserSearchResult {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transferForm, setTransferForm] = useState({
    receiverEmail: '',
    amount: '',
    pin: '',
  });
  const [receiverSuggestions, setReceiverSuggestions] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPinSet, setIsPinSet] = useState(true); // Default to true until we check

  useEffect(() => {
    checkPinStatus();
    fetchWalletInfo();
  }, []);

  const checkPinStatus = async () => {
    try {
      const response = await user.checkPinStatus();
      setIsPinSet(response.isPinSet);
      
      // If PIN is not set, redirect to setup PIN page
      if (!response.isPinSet) {
        toast.error('You need to set up your PIN first');
        router.push('/setup-pin');
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    }
  };

  const fetchWalletInfo = async () => {
    try {
      const walletData = await wallet.getWalletInfo();
      setWalletInfo(walletData);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      toast.error('Failed to fetch wallet information');
    }
  };

  // Debounced search function
  const searchUsers = debounce(async (email: string) => {
    if (!email || email.length < 3) {
      setReceiverSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await user.searchByEmail(email);
      setReceiverSuggestions(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setTransferForm({ ...transferForm, receiverEmail: email });
    searchUsers(email);
  };

  const selectReceiver = (email: string) => {
    setTransferForm({ ...transferForm, receiverEmail: email });
    setReceiverSuggestions([]);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.receiverEmail || !transferForm.amount || !transferForm.pin) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await wallet.transferByEmail(
        transferForm.receiverEmail,
        parseFloat(transferForm.amount),
        transferForm.pin
      );
      
      toast.success('Transfer successful!');
      fetchWalletInfo();
      setTransferForm({ receiverEmail: '', amount: '', pin: '' }); // Reset form
    } catch (error: any) {
      toast.error(error.response?.data || 'Transfer failed');
    }
  };

  if (!isPinSet) {
    return null; // Don't render anything while redirecting
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Balance Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Your Balance</h2>
              <div className="mt-1 text-3xl font-semibold text-indigo-600">
                ${walletInfo?.balance.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Money</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Receiver's Email
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={transferForm.receiverEmail}
                    onChange={handleEmailChange}
                    placeholder="Enter recipient's email"
                  />
                  
                  {/* Email search results dropdown */}
                  {receiverSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                      {receiverSuggestions.map(user => (
                        <div 
                          key={user.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectReceiver(user.email)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="text-sm text-gray-500 mt-1">Searching...</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PIN
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={transferForm.pin}
                    onChange={(e) => setTransferForm({ ...transferForm, pin: e.target.value })}
                    placeholder="****"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Transfer
                </button>
              </form>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        With
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {walletInfo?.transactions && walletInfo.transactions.length > 0 ? (
                      walletInfo.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type === 'TRANSFER' 
                              ? (transaction.senderName === localStorage.getItem('userName') 
                                ? transaction.receiverName 
                                : transaction.senderName)
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}