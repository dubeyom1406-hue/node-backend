import React from 'react';
import { EyeOff, ArrowRight } from 'lucide-react';

const PasswordDetails = ({ formData, handleInputChange, handleSave, isSaving, showPasswords, setShowPasswords }) => {
    return (
        <div className="flex space-x-6">
            <div className="flex-1 bg-white rounded-xl shadow-xl border border-slate-200 p-10 flex flex-col">
                <h2 className="text-xl font-bold text-[#0ea5e9] mb-10">Change Password</h2>
                <div className="space-y-12 mb-12">
                    <div className="space-y-1 relative">
                        <label className="text-sm font-bold text-slate-400 block pb-1">New Password</label>
                        <div className="relative border-b border-slate-200">
                            <input
                                type={showPasswords ? "text" : "password"}
                                className="w-full py-2 bg-transparent outline-none text-slate-700 font-bold"
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            />
                            <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-0 bottom-2 text-slate-400"><EyeOff size={16} /></button>
                        </div>
                    </div>
                    <div className="space-y-1 relative">
                        <label className="text-sm font-bold text-slate-400 block pb-1">Confirm Password</label>
                        <div className="relative border-b border-slate-200">
                            <input
                                type={showPasswords ? "text" : "password"}
                                className="w-full py-2 bg-transparent outline-none text-slate-700 font-bold"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            />
                            <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-0 bottom-2 text-slate-400"><EyeOff size={16} /></button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-auto">
                    <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-12 py-3.5 rounded-full font-black uppercase text-sm flex items-center space-x-3 shadow-2xl hover:bg-blue-900 transition-all active:scale-95">
                        <span>{isSaving ? 'Submitting...' : 'Submit'}</span>
                        {!isSaving && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-xl border border-slate-200 p-10">
                <h3 className="text-xl font-bold text-slate-700 mb-8">Password should follow these rules:-</h3>
                <div className="space-y-6 text-sm text-slate-400 font-medium leading-relaxed">
                    <p>1. Length can be 8 to 15 characters.</p>
                    <p>2. At least 1 numeric.</p>
                    <p>3. At least one capital letter.</p>
                    <p>4. At least one small letter.</p>
                    <p>5. At least one special letter.</p>
                    <p>6. Any order of characters in password are allowed.</p>
                    <p>7. No space(s)</p>
                </div>
            </div>
        </div>
    );
};

export default PasswordDetails;
