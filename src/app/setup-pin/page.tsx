'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/components/AuthGuard';
import { user } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function SetupPin() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    setLoading(true);
    try {
      await user.setupPin(pin);
      toast.success('PIN set successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast.error('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your PIN
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your PIN will be used to authenticate transfers
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                  Enter 4-digit PIN
                </label>
                <div className="mt-1">
                  <input
                    id="pin"
                    name="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700">
                  Confirm PIN
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPin"
                    name="confirmPin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Setting PIN...' : 'Set PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}