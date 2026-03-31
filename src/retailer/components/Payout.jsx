import React, { useState } from 'react';
import { Send, Wallet, IndianRupee, CheckCircle, AlertCircle } from 'lucide-react';

const Payout = () => {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transactionType, setTransactionType] = useState('IMPS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTransactionStatus(null);

    // Simulate payout processing
    setTimeout(() => {
      setIsProcessing(false);
      setTransactionStatus({
        success: Math.random() > 0.3, // 70% success rate for demo
        transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
        message: Math.random() > 0.3 ? 'Payout successful!' : 'Payout failed. Please try again.'
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Send className="text-white" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-white">Payout</h1>
              <p className="text-purple-100">Transfer money to bank accounts</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {transactionStatus && (
          <div className={`p-4 ${transactionStatus.success ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {transactionStatus.success ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <div>
                <p className={`font-medium ${transactionStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                  {transactionStatus.message}
                </p>
                <p className={`text-sm ${transactionStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  Transaction ID: {transactionStatus.transactionId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePayoutSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <IndianRupee className="inline mr-1" size={16} />
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                min="1"
                max="50000"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Wallet className="inline mr-1" size={16} />
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipient Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              {['IMPS', 'NEFT', 'RTGS'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="transactionType"
                    value={type}
                    checked={transactionType === type}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send size={20} />
                  <span>Initiate Payout</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Recent Transactions */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Payouts</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">₹{(Math.random() * 1000 + 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">To: ****{Math.floor(1000 + Math.random() * 9000)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">Completed</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payout;
