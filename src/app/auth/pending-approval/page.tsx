'use client';

import Link from 'next/link';

export default function PendingApproval() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="rounded-full bg-yellow-100 p-4 mx-auto w-16 h-16 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">
          Registration Pending Approval
        </h2>
        
        <p className="text-gray-600">
          Your registration is pending admin approval. You will be able to access your
          account once an administrator approves your registration.
        </p>
        
        <div className="mt-4">
          <Link
            href="/auth/login"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}