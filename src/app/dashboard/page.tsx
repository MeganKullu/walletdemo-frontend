'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/components/AuthGuard';
import Navigation from '@/app/components/Navigation';
import { wallet, user } from '@/app/lib/api';
import toast from 'react-hot-toast';
import EmailSummaryButton from '@/app/components/EmailSummaryButton';

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
    const [isPinSet, setIsPinSet] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initializeDashboard() {
            try {
                // Check PIN status first
                const response = await user.checkPinStatus();

                if (!response.isPinSet) {
                    // Redirect immediately without rendering dashboard
                    toast.error('You need to set up your PIN first');
                    router.push('/setup-pin');
                    return;
                }

                // PIN is set, continue loading dashboard data
                setIsPinSet(true);
                await fetchWalletInfo();
            } catch (error) {
                toast.error('An error occurred loading your dashboard');
            } finally {
                setIsLoading(false);
            }
        }

        initializeDashboard();
    }, [router]);

    const fetchWalletInfo = async () => {
        try {
            const walletData = await wallet.getWalletInfo();
            setWalletInfo(walletData);
        } catch (error) {
            toast.error('Failed to fetch wallet information');
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transferForm.receiverEmail || !transferForm.amount || !transferForm.pin) {
            toast.error('Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(transferForm.receiverEmail)) {
            toast.error('Please enter a valid email address');
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

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    if (!isPinSet) {
        return null; // Don't render anything if PIN isn't set (redundant but safe)
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Receiver's Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={transferForm.receiverEmail}
                                        onChange={(e) => setTransferForm({ ...transferForm, receiverEmail: e.target.value })}
                                        placeholder="Enter recipient's email"
                                        autoComplete="off"
                                    />
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
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'SUCCESS'
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
                    <EmailSummaryButton />
                </main>
            </div>
        </AuthGuard>
    );
}