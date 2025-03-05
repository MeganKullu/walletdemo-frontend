'use client';

import { useState } from 'react';
import { wallet } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface WithdrawFormProps {
    onSuccess: () => void;
    currentBalance?: number;
}

export default function WithdrawForm({ onSuccess, currentBalance = 0 }: WithdrawFormProps) {
    const [form, setForm] = useState({
        amount: '',
        withdrawalMethod: 'bank',
        accountName: '',
        accountNumber: '',
        pin: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.amount || parseFloat(form.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        // Check if withdrawal amount exceeds balance
        if (parseFloat(form.amount) > currentBalance) {
            toast.error('Insufficient funds for this withdrawal');
            return;
        }

        if (!form.pin) {
            toast.error('Please enter your PIN to authorize this withdrawal');
            return;
        }

        if (form.withdrawalMethod === 'bank') {
            if (!form.accountName || !form.accountNumber) {
                toast.error('Please fill in all bank details');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Prepare account details based on withdrawal method
            const accountDetails = form.withdrawalMethod === 'bank'
                ? {
                    accountName: form.accountName,
                    accountNumber: form.accountNumber,
                }
                : {
                    paypalEmail: form.accountName
                };

            // Call the actual API endpoint
            await wallet.withdraw(
                parseFloat(form.amount),
                form.withdrawalMethod,
                accountDetails,
                form.pin
            );

            toast.success('Withdrawal request submitted successfully!');
            setForm({
                amount: '',
                withdrawalMethod: 'bank',
                accountName: '',
                accountNumber: '',
                pin: '',
            });
            onSuccess(); // Refresh wallet info
        } catch (error: any) {
            let errorMessage = 'Withdrawal failed';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            toast.error(`Withdrawal failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Withdraw Funds</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={currentBalance}
                            required
                            className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Available balance: ${currentBalance.toFixed(2)}</p>
                </div>

                <div>
                    <label htmlFor="withdrawalMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Withdrawal Method
                    </label>
                    <select
                        id="withdrawalMethod"
                        name="withdrawalMethod"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={form.withdrawalMethod}
                        onChange={handleChange}
                    >
                        <option value="bank">Bank Transfer</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </div>

                {form.withdrawalMethod === 'bank' && (
                    <>
                        <div>
                            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Holder Name
                            </label>
                            <input
                                id="accountName"
                                name="accountName"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="John Doe"
                                value={form.accountName}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Number
                            </label>
                            <input
                                id="accountNumber"
                                name="accountNumber"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="123456789"
                                value={form.accountNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                )}

                {form.withdrawalMethod === 'paypal' && (
                    <div>
                        <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            PayPal Email
                        </label>
                        <input
                            id="paypalEmail"
                            name="accountName"  // Reusing the accountName field
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="your@email.com"
                            value={form.accountName}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN
                    </label>
                    <input
                        id="pin"
                        name="pin"
                        type="password"
                        required
                        maxLength={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="****"
                        value={form.pin}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-rose-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        "Withdraw Funds"
                    )}
                </button>
            </form>
        </div>
    );
}