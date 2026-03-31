import { dataService } from '../../../services/dataService';
import { Plus, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { InputField, SelectField } from './ProfileShared';

const BankingInfo = ({ formData, handleInputChange, handleSave, isSaving, isFetchingIFSC, isVerifyingAccount, setFormData, currentUser }) => {
    const banks = currentUser?.banks || [];

    const handleAddBank = () => {
        if (!formData.bankName || !formData.accountNumber) {
            alert("Please fill bank details first");
            return;
        }

        const newBank = {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            branchName: formData.branchName,
            accHolderName: formData.accHolderName
        };

        const success = dataService.addUserBank(currentUser.username, newBank);
        if (success) {
            setFormData(prev => ({
                ...prev,
                accHolderName: '',
                bankName: '',
                ifscCode: '',
                branchName: '',
                accountNumber: '',
                confirmAccountNumber: ''
            }));
        }
    };

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex space-x-6">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                        <h2 className="text-lg font-bold text-[#0ea5e9] tracking-tight">Add Banking Information</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <InputField
                            label="Account Holder Name"
                            value={formData.accHolderName}
                            onChange={(e) => handleInputChange('accHolderName', e.target.value)}
                            placeholder={isVerifyingAccount ? "Verifying..." : "Account owner name"}
                            icon={isVerifyingAccount ? <RefreshCw size={14} className="animate-spin text-blue-500" /> : (formData.accHolderName && <ShieldCheck size={14} className="text-emerald-500" />)}
                        />
                        <InputField
                            label="Bank Name"
                            value={formData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            placeholder="Fetched automatically via IFSC"
                            icon={formData.bankName && <ShieldCheck size={14} className="text-emerald-500" />}
                        />
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative">
                                <InputField
                                    label="IFSC Code"
                                    value={formData.ifscCode}
                                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                                    placeholder="e.g. SBIN0001234"
                                />
                                {formData.branchName && (
                                    <div className="absolute right-3 top-[34px] flex items-center space-x-1 text-[9px] font-black text-emerald-500 uppercase">
                                        <ShieldCheck size={12} />
                                        <span>Verified</span>
                                    </div>
                                )}
                            </div>
                            <InputField
                                label="Branch Name"
                                value={formData.branchName}
                                readOnly
                                placeholder="Fetching..."
                                icon={isFetchingIFSC ? <RefreshCw size={14} className="animate-spin text-blue-500" /> : (formData.branchName && <ShieldCheck size={14} className="text-emerald-500" />)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <InputField
                                label="Account Number"
                                value={formData.accountNumber}
                                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                placeholder="Enter 11-16 digits"
                            />
                            <InputField
                                label="Confirm Account Number"
                                value={formData.confirmAccountNumber}
                                onChange={(e) => handleInputChange('confirmAccountNumber', e.target.value)}
                                placeholder="Re-enter to verify"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end pt-4">
                        <button onClick={handleAddBank} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full font-black uppercase text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                            <Plus size={16} />
                            <span>Add Bank to My List</span>
                        </button>
                    </div>
                </div>

                <div className="w-[380px] bg-white rounded-xl shadow-sm border border-slate-100 p-8 overflow-y-auto max-h-[500px]">
                    <h3 className="text-lg font-bold text-[#334e68] mb-6 flex items-center justify-between">
                        <span>My Added Banks</span>
                        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">{banks.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {banks.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <p className="text-xs font-bold uppercase tracking-widest">No banks added yet</p>
                            </div>
                        ) : (
                            banks.map((bank) => (
                                <div key={bank.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to remove this bank?")) {
                                                dataService.removeUserBank(currentUser.username, bank.id);
                                            }
                                        }}
                                        className="absolute top-3 right-3 text-rose-300 hover:text-rose-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                    <h4 className="text-[11px] font-black text-slate-700 uppercase">{bank.bankName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">A/C: xxxx {bank.accountNumber.slice(-4)}</p>
                                    <p className="text-[9px] font-black text-blue-600 uppercase mt-2 tracking-widest">{bank.ifscCode}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white flex items-center justify-between shadow-xl">
                <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl"><ShieldCheck size={24} /></div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">Bank Details Protection</h4>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">All your financial data is encrypted and secure with RuPiKsha.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankingInfo;
