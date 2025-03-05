'use client';

import { useState } from 'react';
import { wallet } from '@/app/lib/api';
import toast from 'react-hot-toast';

interface DepositFormProps {
    onSuccess: () => void;
}

export default function DepositForm({ onSuccess }: DepositFormProps) {
    const [form, setForm] = useState({
        amount: '',
        paymentMethod: 'card', // default payment method
        cardNumber: '',
        expiryDate: '',
        cvv: '',
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

        if (form.paymentMethod === 'card') {
            if (!form.cardNumber || !form.expiryDate || !form.cvv) {
                toast.error('Please fill in all card details');
                return;
            }

            // Basic card validation
            if (form.cardNumber.replace(/\s/g, '').length < 13) {
                toast.error('Please enter a valid card number');
                return;
            }
        }

        setIsLoading(true);
        try {
            // Simplify the request to just send the amount as the backend expects
            await wallet.deposit(parseFloat(form.amount));

            toast.success('Deposit successful!');
            setForm({
                amount: '',
                paymentMethod: 'card',
                cardNumber: '',
                expiryDate: '',
                cvv: '',
            });
            onSuccess(); // Refresh wallet info
        } catch (error: any) {
        
            let errorMessage = 'Deposit failed';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            toast.error(`Deposit failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deposit Funds</h3>
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
                            required
                            className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                    </label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={form.paymentMethod}
                        onChange={handleChange}
                    >
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                </div>

                {form.paymentMethod === 'card' && (
                    <>
                        <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                            </label>
                            <input
                                id="cardNumber"
                                name="cardNumber"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="1234 5678 9012 3456"
                                value={form.cardNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date
                                </label>
                                <input
                                    id="expiryDate"
                                    name="expiryDate"
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="MM/YY"
                                    value={form.expiryDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <input
                                    id="cvv"
                                    name="cvv"
                                    type="text"
                                    required
                                    maxLength={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="123"
                                    value={form.cvv}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </>
                )}

                {form.paymentMethod === 'bank' && (
                    <div className="p-4 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                            To deposit via bank transfer, please use the following details:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-sm text-blue-800">
                            <li>Account Name: Your Wallet</li>
                            <li>Account Number: 123456789</li>
                            <li>Sort Code: 12-34-56</li>
                            <li>Reference: Your wallet ID</li>
                        </ul>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || form.paymentMethod === 'bank'}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
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
                        "Deposit Funds"
                    )}
                </button>
            </form>
        </div>
    );
}