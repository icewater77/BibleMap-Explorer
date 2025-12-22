
import React, { useState } from 'react';
import { Search, BookOpen, MapPin, ExternalLink, ChevronLeft, Loader2, Library } from 'lucide-react';
import { LocationData, LocationDetails, LoadingState } from '../types';

interface SidebarProps {
  locations: LocationData[];
  selectedDetails: LocationDetails | null;
  onSearch: (query: string) => void;
  onSelectLocation: (loc: LocationData) => void;
  onBackToList: () => void;
  loadingState: LoadingState;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  locations, 
  selectedDetails, 
  onSearch, 
  onSelectLocation,
  onBackToList,
  loadingState 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-lg z-20 relative font-sans">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Library className="w-6 h-6 text-amber-300" />
          聖經恢復本地圖
        </h1>
        <p className="text-amber-200 text-[10px] tracking-widest uppercase mt-1 opacity-80">Recovery Version Bible Explorer</p>
      </div>

      {selectedDetails ? (
        <div className="flex-1 overflow-y-auto bg-stone-50">
          <button 
            onClick={onBackToList}
            className="flex items-center gap-1 text-amber-900 p-4 hover:bg-amber-100/50 w-full font-bold transition-colors border-b border-stone-200"
          >
            <ChevronLeft className="w-4 h-4" />
            返回列表
          </button>
          
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-1">{selectedDetails.name}</h2>
              <p className="text-stone-500 italic text-sm">{selectedDetails.englishName}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a 
                href={selectedDetails.googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-800 text-white rounded hover:bg-stone-950 transition-colors text-xs font-medium shadow-sm"
              >
                <MapPin className="w-3 h-3" />
                Google Maps
              </a>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                歷史背景與屬靈意義
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedDetails.historicalSignificance}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-amber-700" />
                相關經節 (恢復本)
              </h3>
              <div className="space-y-4">
                {selectedDetails.verses.map((verse, idx) => (
                  <div key={idx} className="verse-card p-5 rounded-lg shadow-sm border border-stone-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-amber-900 font-bold text-sm">{verse.reference}</span>
                      {verse.url && (
                        <a 
                          href={verse.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-stone-400 hover:text-amber-700 flex items-center gap-1"
                        >
                          於 TWGBR 閱讀 <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-stone-800 leading-loose font-serif text-[15px]">{verse.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="搜尋地名 (如：耶路撒冷)..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-shadow text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3.5 top-2.5 text-stone-400 w-4 h-4" />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingState === LoadingState.LOADING_LIST ? (
              <div className="flex flex-col items-center justify-center h-40 text-stone-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
                <span className="text-xs font-medium uppercase tracking-widest">載入中...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {locations.length === 0 ? (
                  <div className="text-center text-stone-400 mt-10 px-4 italic text-sm">
                    找不到相關地名。
                  </div>
                ) : (
                  locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left p-4 rounded-xl hover:bg-amber-50 border border-stone-100 hover:border-amber-200 transition-all group shadow-sm bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-stone-800 group-hover:text-amber-900">{loc.name}</h3>
                        <MapPin className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-600" />
                      </div>
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">{loc.shortDescription}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
