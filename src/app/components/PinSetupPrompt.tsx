'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { user } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function PinSetupPrompt() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [needsPin, setNeedsPin] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    try {
      const response = await user.checkPinStatus();
      
      if (!response.isPinSet) {
        setNeedsPin(true);
      }
    } catch (error) {
      console.error('Error checking PIN status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupNow = () => {
    router.push('/setup-pin');
  };

  const handleLater = () => {
    setNeedsPin(false);
    localStorage.setItem('pinReminderDismissed', 'true');
  };

  if (loading || !needsPin || localStorage.getItem('pinReminderDismissed')) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Setup Your PIN</h2>
        <p className="mb-4">
          You need to set up a PIN to make transfers. This helps keep your account secure.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleLater}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Remind me later
          </button>
          <button
            onClick={handleSetupNow}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Setup now
          </button>
        </div>
      </div>
    </div>
  );
}