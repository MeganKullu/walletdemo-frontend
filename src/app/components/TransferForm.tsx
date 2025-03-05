'use client';

import { useState, useEffect } from 'react';
import { wallet } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

interface TransferFormProps {
    onSuccess: () => void;
}

export default function TransferForm({ onSuccess }: TransferFormProps) {
    const [form, setForm] = useState({
        receiverEmail: '',
        amount: '',
        pin: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    // Get current user's email from JWT token
    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken: any = jwtDecode(token);
                // Assuming the email is stored in the token payload as 'email' or 'sub'
                const email = decodedToken.email || decodedToken.sub;
                if (email) {
                    setCurrentUserEmail(email);
                }
            }
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.receiverEmail || !form.amount || !form.pin) {
            toast.error('Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.receiverEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Check if user is trying to send money to themselves
        if (form.receiverEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
            toast.error('You cannot send money to yourself');
            return;
        }

        setIsLoading(true);
        try {
            await wallet.transferByEmail(
                form.receiverEmail,
                parseFloat(form.amount),
                form.pin
            );

            toast.success('Transfer successful!');
            setForm({ receiverEmail: '', amount: '', pin: '' }); // Reset form
            onSuccess(); // Callback to refresh wallet info
        } catch (error: any) {
            console.error('Transfer error:', error);

            // Extract specific error message from API response
            let errorMessage = 'Transfer failed';

            if (error.response) {
                // Handle structured API error responses
                if (error.response.data) {
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    }
                }

                // Add specific handling for common error codes
                if (error.response.status === 400) {
                    if (errorMessage === 'Transfer failed') {
                        errorMessage = 'Invalid transfer details. Please check and try again.';
                    }
                } else if (error.response.status === 401) {
                    errorMessage = 'Incorrect PIN or unauthorized access.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Recipient not found. Please verify the email address.';
                } else if (error.response.status === 403) {
                    errorMessage = 'You do not have permission to perform this transfer.';
                } else if (error.response.status === 422) {
                    errorMessage = 'Insufficient funds or invalid amount.';
                }
            }

            toast.error(`Transfer failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send Money</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="receiverEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient's Email
                    </label>
                    <input
                        id="receiverEmail"
                        name="receiverEmail"
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="email@example.com"
                        value={form.receiverEmail}
                        onChange={handleChange}
                    />
                </div>

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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
                        "Send Money"
                    )}
                </button>
            </form>
        </div>
    );
}