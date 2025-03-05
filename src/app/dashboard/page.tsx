'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/app/components/AuthGuard';
import Navigation from '@/app/components/Navigation';
import { wallet, user } from '@/app/lib/api';
import toast from 'react-hot-toast';
import EmailSummaryButton from '@/app/components/EmailSummaryButton';
import TransferForm from '@/app/components/TransferForm';

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
        receiverEmail: string;
    }>;
}

type ActionType = 'transfer' | 'deposit' | 'withdraw' | null;

export default function Dashboard() {
    const router = useRouter();
    const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
    const [isPinSet, setIsPinSet] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAction, setCurrentAction] = useState<ActionType>(null);

    useEffect(() => {
        async function initializeDashboard() {
            try {
                // Check PIN status first
                const response = await user.checkPinStatus();

                if (!response.isPinSet) {
                    // Redirect immediately without rendering dashboard
                    toast.error('You need to set up your PIN first');
                    router.push('/auth/setup-pin');
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

    // Handle action button clicks
    const handleActionClick = (action: ActionType) => {
        if (action === 'deposit' || action === 'withdraw') {
            toast(`${action.charAt(0).toUpperCase() + action.slice(1)} feature coming soon!`);
            return;
        }
        setCurrentAction(action);
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => handleActionClick('deposit')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg flex flex-col items-center justify-center transition duration-150"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Deposit</span>
                        </button>
                        <button
                            onClick={() => handleActionClick('transfer')}
                            className={`${currentAction === 'transfer'
                                ? 'bg-indigo-700'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } text-white py-3 px-4 rounded-lg flex flex-col items-center justify-center transition duration-150`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Transfer</span>
                        </button>
                        <button
                            onClick={() => handleActionClick('withdraw')}
                            className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-lg flex flex-col items-center justify-center transition duration-150"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            <span>Withdraw</span>
                        </button>
                    </div>

                    {/* Conditional Action Form */}
                    {currentAction === 'transfer' && (
                        <div className="mb-6">
                            <TransferForm onSuccess={fetchWalletInfo} />
                        </div>
                    )}

                    {/* Recent Transactions */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                                <EmailSummaryButton />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                To
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {walletInfo?.transactions && walletInfo.transactions.length > 0 ? (
                                            walletInfo.transactions.map((transaction) => (
                                                console.log("transaction",transaction),
                                                <tr key={transaction.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transaction.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${transaction.amount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {transaction.type === 'TRANSFER' ? transaction.receiverName : transaction.receiverEmail}
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
                </main>
            </div>
        </AuthGuard>
    );
}