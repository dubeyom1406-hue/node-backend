import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Play } from 'lucide-react';
import { dataService } from '../../services/dataService';

const IconMap = (iconName) => {
    let Icon = LucideIcons[iconName] || LucideIcons.Video || Search;
    if (typeof Icon !== 'function' && typeof Icon !== 'object') Icon = Search;
    return <Icon size={32} strokeWidth={1.5} />;
};

const VideoCard = ({ title, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 relative h-28 flex flex-col justify-between hover:shadow-md transition-shadow">
        <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</h4>
        <div className="flex items-end justify-between mt-2">
            <div className={`${color} p-2 rounded-lg opacity-90`}>
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <button className="bg-[#00aa9a] hover:bg-[#008f82] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm flex items-center shadow-sm transition-colors">
                View Video
            </button>
        </div>
    </div>
);

const BannerCard = ({ title, subTitle, image, gradientClass }) => (
    <div className={`w-full h-44 rounded-lg shadow-sm relative overflow-hidden flex flex-col justify-center px-8 text-white ${!image ? gradientClass : ''}`}>
        {image && (
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
        {image && <div className="absolute inset-0 bg-black/30 z-[1]"></div>}

        <div className="z-10 relative">
            <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{title}</h3>
            <p className="text-sm opacity-90 mb-4 font-medium drop-shadow-md">{subTitle}</p>
            <button className="bg-white/20 hover:bg-white/40 text-white text-xs font-bold px-4 py-2 rounded transition-all backdrop-blur-md border border-white/30 shadow-lg active:scale-95">
                Know More
            </button>
        </div>

        {/* Decorative Circles - only if no image */}
        {!image && (
            <>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
            </>
        )}
    </div>
);

const FilterButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-colors ${active
            ? 'bg-[#00aa9a] text-white shadow-sm'
            : 'bg-[#00aa9a]/10 text-[#00aa9a] hover:bg-[#00aa9a]/20'
            }`}
    >
        {label}
    </button>
);

const TrainingPromotions = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [promoData, setPromoData] = useState(dataService.getData().promotions);

    const filters = ['All', 'PDF', 'Images', 'Videos', 'Training Videos'];

    useEffect(() => {
        const updatePromo = () => setPromoData(dataService.getData().promotions);
        window.addEventListener('dataUpdated', updatePromo);
        return () => window.removeEventListener('dataUpdated', updatePromo);
    }, []);

    return (
        <div className="animate-in fade-in duration-300">
            {/* Filters */}
            <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                    {filters.map(filter => (
                        <FilterButton
                            key={filter}
                            label={filter}
                            active={activeFilter === filter}
                            onClick={() => setActiveFilter(filter)}
                        />
                    ))}
                </div>
            </div>

            {/* Images Section */}
            {(activeFilter === 'All' || activeFilter === 'Images') && (
                <div className="mb-8">
                    <h3 className="text-slate-700 text-sm font-normal mb-4">Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promoData.banners.map((banner, idx) => (
                            <BannerCard
                                key={idx}
                                title={banner.title}
                                subTitle={banner.subTitle}
                                image={banner.image}
                                gradientClass={`bg-gradient-to-r ${banner.gradient}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Videos Section */}
            {(activeFilter === 'All' || activeFilter === 'Videos' || activeFilter === 'Training Videos') && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-slate-700 text-sm font-normal">Training Videos</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-8 pr-4 py-1.5 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-[#00aa9a] w-48"
                            />
                            <Search size={12} className="absolute left-3 top-2 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {promoData.videos.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 relative h-28 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.title}</h4>
                                <div className="flex items-end justify-between mt-2">
                                    <div className={`${item.color} p-2 rounded-lg opacity-90`}>
                                        {IconMap(item.icon)}
                                    </div>
                                    <button className="bg-[#00aa9a] hover:bg-[#008f82] text-white text-[10px] font-bold px-3 py-1.5 rounded-sm flex items-center shadow-sm transition-colors">
                                        View Video
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingPromotions;
