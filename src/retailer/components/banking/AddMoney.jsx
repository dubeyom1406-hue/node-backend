import React, { useState } from 'react';
import { Wallet, CreditCard, ShieldCheck, RefreshCw, CheckCircle2, IndianRupee, ArrowRight, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService, BACKEND_URL } from '../../../services/dataService';

const AddMoney = () => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const currentUser = dataService.getData().currentUser;

    const handleAddMoney = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
            alert("Please enter a valid amount (minimum ₹1)");
            return;
        }

        setIsLoading(true);
        try {
            // Updated to use Razorpay
            const response = await fetch(`${BACKEND_URL}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    customer_id: currentUser.username || currentUser.mobile || 'customer_1',
                    customer_email: currentUser.email || `${currentUser.mobile || 'customer'}@rupiksha.com`,
                    customer_phone: currentUser.mobile || '9999999999',
                    customer_name: currentUser.businessName || currentUser.name || 'RUPIKSHA USER'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Server error initiating payment");
            }

            const result = await response.json();
            if (result.success) {
                const options = {
                    key: result.key, // Razorpay Key ID
                    amount: result.amount, // Amount in paise
                    currency: "INR",
                    name: "RUPIKSHA",
                    description: "Wallet Add Money",
                    order_id: result.order_id,
                    handler: async function (response) {
                        // Payment Verification
                        try {
                            const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });

                            if (!verifyRes.ok) throw new Error("Verification failed at server");

                            const verifyResult = await verifyRes.json();
                            if (verifyResult.success) {
                                alert("Payment successful and verified!");
                                window.location.reload();
                            } else {
                                alert("Verification failed: " + verifyResult.message);
                            }
                        } catch (err) {
                            alert(`Error verifying payment: ${err.message}`);
                        }
                    },
                    prefill: {
                        name: currentUser.name || "User",
                        email: currentUser.email || "user@example.com",
                        contact: currentUser.mobile || "9999999999"
                    },
                    theme: {
                        color: "#1e40af"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert(result.message || "Failed to initiate payment. Please try again.");
            }

            /* --- CASHFREE FLOW (HIDDEN/DISABLED) --- 
            const responseCF = await fetch(`${BACKEND_URL}/create-order-cf`, { // Renamed to keep separate if needed
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_amount: parseFloat(amount),
                    customer_id: currentUser.username || currentUser.mobile || 'customer_1',
                    customer_email: currentUser.email || `${currentUser.mobile || 'customer'}@rupiksha.com`,
                    customer_phone: currentUser.mobile || '9999999999',
                    customer_name: currentUser.businessName || currentUser.name || 'RuPiKsha User'
                })
            });
            const resultCF = await responseCF.json();
            if (resultCF.success) {
                if (resultCF.data.payment_link) {
                    window.location.href = resultCF.data.payment_link;
                }
            }
            */

        } catch (error) {
            alert("Connection error. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const presetAmounts = [100, 500, 1000, 2000, 5000];

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] font-['Inter',sans-serif]">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Add Money to Wallet</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant Wallet Top-up</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-1.5 rounded-full">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">PCI-DSS Secure</span>
                </div>
            </div>

            <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
                <div className="w-full max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Wallet size={200} />
                        </div>

                        <div className="mb-10 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Available Balance</p>
                            <h2 className="text-4xl font-black text-slate-800 flex items-center justify-center">
                                <IndianRupee size={28} className="text-blue-600" />
                                <span>{currentUser?.balance || '0.00'}</span>
                            </h2>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Enter Amount</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-600">
                                        <IndianRupee size={24} strokeWidth={3} />
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-16 py-6 text-3xl font-black outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {presetAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setAmount(amt.toString())}
                                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${amount === amt.toString() ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                                    >
                                        +{amt}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleAddMoney}
                                disabled={isLoading || !amount || parseFloat(amount) < 1}
                                className="w-full bg-[#1e40af] text-white py-6 rounded-3xl font-black uppercase text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        <span>Initiating Gateway...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Recharge Wallet Now</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-[9px] font-bold uppercase">Zero Hidden Charges</span>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Smartphone size={14} className="text-blue-500" />
                                    <span className="text-[9px] font-bold uppercase">Safe for UPI & Card</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AddMoney;
