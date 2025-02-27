'use client';

import { useEffect } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Approve Users Card */}
                <Link href="/admin/approve-users" 
                      className="block p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                    Approve Users
                  </h3>
                  <p className="text-indigo-700">
                    Review and approve pending user registrations
                  </p>
                </Link>

                {/* View Transactions Card */}
                <Link href="/admin/transactions" 
                      className="block p-6 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                    View Transactions
                  </h3>
                  <p className="text-emerald-700">
                    Monitor all wallet transactions
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}