import React, { useState } from 'react';
import { Search, BookOpen, MapPin, ExternalLink, ChevronLeft, Loader2 } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-lg z-20 relative">
      {/* Header */}
      <div className="p-4 bg-blue-900 text-white shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          聖經地圖 Explorer
        </h1>
        <p className="text-blue-200 text-xs mt-1">探索聖經中的地理與經節</p>
      </div>

      {/* Details View */}
      {selectedDetails ? (
        <div className="flex-1 overflow-y-auto">
          <button 
            onClick={onBackToList}
            className="flex items-center gap-1 text-blue-700 p-4 hover:bg-blue-50 w-full font-medium transition-colors border-b"
          >
            <ChevronLeft className="w-4 h-4" />
            返回列表
          </button>
          
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{selectedDetails.name}</h2>
              <p className="text-gray-500 text-sm">{selectedDetails.englishName}</p>
            </div>

            <a 
              href={selectedDetails.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              在 Google Maps 中開啟
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="font-bold text-amber-900 mb-2">歷史背景</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                {selectedDetails.historicalSignificance}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                相關經節
              </h3>
              <div className="space-y-4">
                {selectedDetails.verses.map((verse, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                    <span className="block text-blue-700 font-bold text-sm mb-1">{verse.reference}</span>
                    <p className="text-gray-700 leading-relaxed font-serif">{verse.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="搜尋地名 (如：伯利恆)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              <button type="submit" className="hidden">Search</button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingState === LoadingState.LOADING_LIST ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span>正在搜尋聖經地理資料...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10 px-4">
                    <p>找不到相關地名。</p>
                    <p className="text-sm mt-2">試著搜尋 "加利利" 或 "耶路撒冷"</p>
                  </div>
                ) : (
                  locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-800">{loc.name}</h3>
                        {loadingState === LoadingState.LOADING_DETAILS && selectedDetails === null && (
                           // Show spinner on the clicked item if strictly necessary, 
                           // but simplistic approach is global spinner overlay or checking ID.
                           // For simplicity, we rely on global loading overlay or toast in App.
                           <span className="hidden">Loading</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{loc.shortDescription}</p>
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