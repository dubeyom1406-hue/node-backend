import React, { useState, useEffect } from 'react';
import {
    Plane, Hotel, Bus, TrainFront, Calendar, MapPin,
    Search, ArrowRight, User, Phone, Receipt, TrendingUp,
    Ticket, Building2, Wallet, Landmark, ShieldCheck, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../services/dataService';
import { initSpeech, speak } from '../../services/speechService';

const Icon3D = ({ icon: Icon, color, size = 48, shadow }) => (
    <div className="flex items-center justify-center rounded-2xl" style={{
        width: size, height: size, background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: shadow || `0 8px 16px ${color}40, inset 0 1px 0 rgba(255,255,255,0.3)`,
        position: 'relative', overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '40%', bottom: '40%', background: 'rgba(255,255,255,0.25)', borderRadius: '50%', filter: 'blur(3px)' }} />
        <Icon size={size * 0.5} color="white" strokeWidth={2.5} />
    </div>
);

const INDIAN_AIRPORTS = ["Mumbai (BOM)", "Delhi (DEL)", "Bangalore (BLR)", "Hyderabad (HYD)", "Chennai (MAA)"];
const INDIAN_CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad"];

const Travel = () => {
    const [activeTab, setActiveTab] = useState('air');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: '...', long: '...' });

    useEffect(() => {
        const currentUser = dataService.getCurrentUser();
        setUser(currentUser);
        dataService.verifyLocation().then(loc => setLocation(loc));
    }, []);

    const NAVY = '#0f2557';
    const NAVY3 = '#2257a8';

    const tabs = [
        { id: 'air', label: 'Flight', icon: Plane, color: '#3b82f6' },
        { id: 'hotel', label: 'Hotel', icon: Hotel, color: '#8b5cf6' },
        { id: 'bus', label: 'Bus', icon: Bus, color: '#10b981' },
        { id: 'rail', label: 'Railway', icon: TrainFront, color: '#ef4444' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] font-['Poppins',sans-serif]">
            {/* Header */}
            <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Icon3D icon={Plane} color={NAVY} size={40} />
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">Travel Hub</h1>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Book Flights, Hotels & more</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">OTA Services Live</span>
                        <button onClick={() => { initSpeech(); speak("ट्रेवल हब में आपका स्वागत है।", "hi-IN"); }}
                            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all">
                            <BellRing size={12} /> Voice
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(t => {
                        const active = activeTab === t.id;
                        return (
                            <motion.button key={t.id} whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(t.id)}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-sm transition-all flex-shrink-0"
                                style={active ? { background: t.color, color: '#fff', boxShadow: `0 4px 15px ${t.color}40` } : { background: 'white', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                                <t.icon size={14} />
                                {t.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 max-w-7xl mx-auto">
                    <div className="space-y-8">

                        {/* Search Panel */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From</label>
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder="Enter City/Airport" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:border-[#1E73BE] focus:bg-white outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To</label>
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder="Enter City/Airport" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:border-[#1E73BE] focus:bg-white outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:border-[#1E73BE] focus:bg-white outline-none transition-all appearance-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Travelers</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder="1 Adult" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-12 pr-4 py-4 text-sm font-bold focus:border-[#1E73BE] focus:bg-white outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="trip" defaultChecked className="accent-[#1E73BE]" />
                                            <span className="text-xs font-black text-slate-600 uppercase">One Way</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="trip" className="accent-[#1E73BE]" />
                                            <span className="text-xs font-black text-slate-600 uppercase">Round Trip</span>
                                        </label>
                                    </div>
                                    <button className="w-full md:w-auto bg-[#1E73BE] text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                        Search {activeTab}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Offers & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Exclusive Offers</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 relative overflow-hidden group">
                                            <div className="relative z-10 space-y-2">
                                                <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Travel Sale</span>
                                                <h4 className="text-lg font-black text-slate-800 leading-tight">GET UPTO ₹2000 OFF</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">On your first flight booking</p>
                                            </div>
                                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                                <Plane size={80} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Search</h3>
                                <div className="space-y-4">
                                    {[
                                        { f: 'BOM', t: 'DEL', d: '25 Feb' },
                                        { f: 'HYD', t: 'BLR', d: '28 Feb' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <p className="font-black text-slate-700">{s.f}</p>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <p className="font-black text-slate-700">{s.t}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">{s.d}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: UNIFIED RETAILER HUB */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100 h-fit sticky top-0">
                        {/* Wallet */}
                        <div className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50" />
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative z-10">
                                <Wallet size={14} className="text-sky-500" /> Travel Wallet
                            </h3>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-400">₹</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {user?.wallet?.balance || "0.00"}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-100 w-fit">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-sky-700 uppercase tracking-tight">Ready for Direct Booking</span>
                                </div>
                            </div>
                        </div>

                        {/* Bank */}
                        <div className="p-8">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Landmark size={14} className="text-emerald-500" /> Linked Accounts
                            </h3>
                            {user?.banks && user.banks.length > 0 ? (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h4 className="text-xs font-black text-slate-900 uppercase mb-2">{user.banks[0].bankName}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">A/C Ending</p>
                                            <p className="text-[10px] font-black text-slate-900">XXXX{user.banks[0].accountNumber?.slice(-4)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">IFSC</p>
                                            <p className="text-[10px] font-black text-slate-900">{user.banks[0].ifscCode}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                                    <p className="text-[9px] font-bold text-orange-600 uppercase">No Account Saved</p>
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="p-8 bg-slate-50/50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <MapPin size={14} className="text-red-500" /> Booking Location
                            </h3>
                            <div className="space-y-4">
                                <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative group">
                                    {location.lat !== '...' ? (
                                        <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://maps.google.com/maps?q=${location.lat},${location.long}&z=14&output=embed`}
                                            className="grayscale-[20%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                            <div className="w-6 h-6 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex gap-4">
                                        <div><span className="text-[8px] font-bold text-slate-400 mr-1 uppercase">Lat</span><span className="text-[10px] font-black text-slate-900">{location.lat}</span></div>
                                        <div><span className="text-[8px] font-bold text-slate-300 mr-1 uppercase">Long</span><span className="text-[10px] font-black text-slate-900">{location.long}</span></div>
                                    </div>
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Travel;
