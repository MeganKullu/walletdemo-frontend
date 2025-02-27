'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import Navigation from '@/app/components/Navigation';
import api, { admin } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface PendingUser {
    id: number;
    name: string;
    email: string;
    registrationDate: string;
}

export default function ApproveUsers() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const response = await admin.getPendingUsers();
            console.log("response for pending users", response.data);
            setPendingUsers(response.data);
        } catch (error) {
            console.error("Error fetching pending users:", error);
            toast.error('Failed to fetch pending users');
        }
    };

    const handleApprove = async (userId: number) => {
        try {
            await admin.approveUser(userId);
            toast.success('User approved successfully');
            fetchPendingUsers();
        } catch (error) {
            toast.error('Failed to approve user');
        }
    };

    return (
        <AuthGuard requireAdmin>
            <div className="min-h-screen bg-gray-100">
                <Navigation />

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pendingUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-200"
                                                    >
                                                        Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {pendingUsers.length === 0 && (
                                    <p className="text-center py-4 text-gray-500">
                                        No pending approvals
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}