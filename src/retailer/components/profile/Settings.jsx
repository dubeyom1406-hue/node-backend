import React from 'react';
import { motion } from 'framer-motion';
import { SelectField } from './ProfileShared';

const Settings = ({ formData, handleInputChange, handleSave }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">System Settings</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Customize your application preferences</p>
            </div>
            <div className="p-8 space-y-6">
                {[
                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive transaction alerts via email' },
                    { id: 'whatsappUpdates', label: 'WhatsApp Updates', desc: 'Get important updates on your WhatsApp' },
                    { id: 'twoStepAuth', label: 'Two-Step Authentication', desc: 'Add an extra layer of security' }
                ].map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                        <div>
                            <h4 className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{setting.label}</h4>
                            <p className="text-[11px] text-slate-400 font-medium">{setting.desc}</p>
                        </div>
                        <div
                            onClick={() => handleInputChange(setting.id, !formData[setting.id])}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData[setting.id] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                animate={{ x: formData[setting.id] ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </div>
                    </div>
                ))}

                <div className="grid grid-cols-2 gap-8 pt-4">
                    <SelectField
                        label="Interface Theme"
                        value={formData.theme}
                        options={['light', 'dark', 'system']}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                    />
                    <SelectField
                        label="Preferred Language"
                        value={formData.language}
                        options={['English', 'Hindi', 'Bengali']}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                    />
                </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-10 py-3 rounded-full font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Save Global Settings</button>
            </div>
        </div>
    );
};

export default Settings;
