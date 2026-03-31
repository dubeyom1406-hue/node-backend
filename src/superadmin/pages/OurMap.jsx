import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dataService } from '../../services/dataService';
import { MapPin, Navigation, Users, Search, Compass, RefreshCcw } from 'lucide-react';

import { indiaData } from '../../data/indiaData';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = [20.5937, 78.9629];
const defaultZoom = 5;

// Helper component to handle map view changes
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom, { animate: true });
        }
    }, [center, zoom, map]);
    return null;
};

const OurMap = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [states] = useState(Object.keys(indiaData));
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [adminLocation, setAdminLocation] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [unlocatedUsers, setUnlocatedUsers] = useState([]);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [mapZoom, setMapZoom] = useState(defaultZoom);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdminInfo, setShowAdminInfo] = useState(false);

    const fetchUsers = async () => {
        setRefreshing(true);
        try {
            const users = await dataService.getAllUsers();
            setAllUsers(users);
            handleSearch(users);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUsers().then(() => setLoading(false));

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setAdminLocation([pos.coords.latitude, pos.coords.longitude])
            );
        }
    }, []);

    useEffect(() => {
        if (selectedState) {
            setCities(indiaData[selectedState] || []);
            setSelectedCity('');
        } else {
            setCities([]);
        }
    }, [selectedState]);

    const attemptGeocode = async (user) => {
        if (!user.city || !user.state) return null;
        try {
            const query = `${user.city}, ${user.state}, India`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch { }
        return null;
    }

    const handleSearch = async (providedUsers = null) => {
        setLoading(true);
        setSelectedUser(null);
        const usersToFilter = providedUsers || allUsers;
        let filtered = usersToFilter.filter(u => {
            const userRole = u.role?.toUpperCase().replace('_', ' ');
            const targetRole = selectedRole?.toUpperCase().replace('_', ' ');

            const userState = u.state?.toLowerCase();
            const targetState = selectedState?.toLowerCase();

            const userCity = u.city?.toLowerCase();
            const targetCity = selectedCity?.toLowerCase();

            return (!selectedState || userState === targetState) &&
                (!selectedCity || userCity === targetCity) &&
                (!selectedRole || userRole === targetRole);
        });

        const located = [];
        const unlocated = [];

        const geoTasks = [];
        for (let i = 0; i < filtered.length; i++) {
            const u = filtered[i];
            if (u.latitude && u.longitude) {
                located.push({ ...u, lat: parseFloat(u.latitude), lng: parseFloat(u.longitude), source: 'gps' });
            } else if (filtered.length < 20 && i < 10) {
                geoTasks.push(
                    attemptGeocode(u).then(coords => {
                        if (coords) {
                            return { ...u, lat: coords[0], lng: coords[1], source: 'approx' };
                        }
                        return null;
                    })
                );
            } else {
                unlocated.push(u);
            }
        }

        if (geoTasks.length > 0) {
            const geoResults = await Promise.all(geoTasks);
            located.push(...geoResults.filter(r => r !== null));
        }

        setFilteredUsers(located);
        setUnlocatedUsers(unlocated);

        if (located.length > 0) {
            setMapCenter([located[0].lat, located[0].lng]);
            setMapZoom(8);
        } else if (selectedState) {
            setMapCenter(defaultCenter);
            setMapZoom(5);
        }

        setLoading(false);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
        const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    };

    const getIcon = (role, isSelected = false) => {
        const r = role?.toUpperCase().replace('_', ' ');
        let color = 'blue';
        switch (r) {
            case 'RETAILER': color = 'blue'; break;
            case 'DISTRIBUTOR': color = 'green'; break;
            case 'SUPER DISTRIBUTOR': color = 'gold'; break;
            default: color = 'blue';
        }

        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: isSelected ? [30, 48] : [25, 41],
            iconAnchor: isSelected ? [15, 48] : [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    };

    const adminIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-['Montserrat',sans-serif]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-amber-500/50">Network Presence Map</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Geospatial visualization of all regional endpoints (Leaflet Engine)</p>
                </div>
                <button onClick={fetchUsers} disabled={refreshing} className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50">
                    <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Syncing...' : 'Refresh Data'}
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Compass size={12} className="text-amber-500" /> Select State</label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><MapPin size={12} className="text-amber-500" /> Select City</label>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                        disabled={!selectedState}
                    >
                        <option value="">Select City</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Users size={12} className="text-amber-500" /> User Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:border-amber-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="">All Roles</option>
                        <option value="RETAILER">Retailer</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                        <option value="SUPER DISTRIBUTOR">Super Distributor</option>
                    </select>
                </div>

                <button
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="bg-[#0d1b2e] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                    <Search size={16} className={loading ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
                    {loading ? 'Locating...' : 'Locate Users'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Users size={14} className="text-amber-500" /> Matches Found ({filteredUsers.length + unlocatedUsers.length})
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {filteredUsers.map((u, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-100 transform transition-transform hover:translate-x-1"
                                    onClick={() => {
                                        const pos = [u.lat, u.lng];
                                        setMapCenter(pos);
                                        setMapZoom(12);
                                        setSelectedUser(u);
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[10px] font-black italic">{u.name?.charAt(0) || 'U'}</div>
                                        <p className="text-[11px] font-black text-slate-800 truncate">{u.name || u.username}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black">
                                        <span className="text-blue-600 uppercase italic">{u.source === 'gps' ? 'Live GPS' : 'Approx City'}</span>
                                        <span className="text-slate-400 italic">{u.city}</span>
                                    </div>
                                </div>
                            ))}

                            {unlocatedUsers.map((u, i) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl opacity-60">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-lg bg-slate-400 text-white flex items-center justify-center text-[10px] font-black italic">{u.name?.charAt(0) || 'U'}</div>
                                        <p className="text-[11px] font-black text-slate-800 truncate">{u.name || u.username}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black">
                                        <span className="text-slate-500 uppercase italic">No GPS Recieved</span>
                                        <span className="text-slate-400 italic">{u.city}</span>
                                    </div>
                                </div>
                            ))}

                            {filteredUsers.length === 0 && unlocatedUsers.length === 0 && !loading && (
                                <div className="text-center py-20 text-slate-300 font-black text-[10px] uppercase italic">
                                    No users found in this sector
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] relative">
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: '600px', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <ChangeView center={mapCenter} zoom={mapZoom} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Administrator Marker */}
                        {adminLocation && (
                            <Marker position={adminLocation} icon={adminIcon}>
                                <Popup>
                                    <div className="p-1 min-w-[120px]">
                                        <p className="font-black text-[10px] text-red-500 uppercase tracking-widest">Administrator</p>
                                        <p className="text-xs font-black text-slate-800 mt-1">Your Location</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* User Markers */}
                        {filteredUsers.map((user, idx) => (
                            <Marker
                                key={`marker_${idx}`}
                                position={[user.lat, user.lng]}
                                icon={getIcon(user.role, selectedUser?.id === user.id)}
                                eventHandlers={{
                                    click: () => setSelectedUser(user),
                                }}
                            >
                                <Popup>
                                    <div className="p-1 space-y-2 min-w-[180px] font-['Montserrat']">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase italic">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800">{user.name || user.username}</p>
                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{user.role}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mt-2">
                                            <div className="flex justify-between text-[10px] font-black">
                                                <span className="text-slate-400">CONTACT:</span>
                                                <span className="text-slate-700">{user.mobile}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black mt-1">
                                                <span className="text-slate-400">HUB:</span>
                                                <span className="text-slate-700">{user.city}, {user.state}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black mt-1">
                                                <span className="text-slate-400">STATUS:</span>
                                                <span className={user.source === 'gps' ? 'text-green-500' : 'text-blue-500'}>{user.source === 'gps' ? 'Verified GPS' : 'Approximate'}</span>
                                            </div>
                                        </div>

                                        {adminLocation && (
                                            <div className="pt-2 border-t border-slate-100 mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Navigation size={12} className="text-indigo-600" />
                                                    <span className="text-[8px] font-black text-indigo-800 uppercase tracking-tight">DISTANCE</span>
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md">
                                                    {calculateDistance(adminLocation[0], adminLocation[1], user.lat, user.lng)} KM
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-3xl shadow-2xl flex flex-col gap-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-100 pb-2">Map Legend</p>
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" alt="Admin" className="w-3 h-5" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">You (Admin)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" alt="Retailer" className="w-3 h-5" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Retailer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="Distributor" className="w-3 h-5" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Distributor</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" alt="Super Dist" className="w-3 h-5" />
                            <span className="text-[9px] font-black text-slate-700 uppercase">Super Dist</span>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 z-[1000] space-y-2">
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Located Users</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter">{filteredUsers.length}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                                <MapPin size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                    <Compass size={24} />
                </div>
                <div className="max-w-3xl">
                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest underline decoration-amber-500/30 mb-1">Geospatial Intelligence (Normal Map)</p>
                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">Users are located based on their last active GPS signal. If GPS is unavailable, the system attempts to visualize them at their registered city hub (marked as Approximate). Unlocated users are shown in the sidebar list for tracking.</p>
                </div>
            </div>
        </div>
    );
};

export default OurMap;
