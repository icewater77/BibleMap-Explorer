import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { fetchBibleLocations, fetchLocationDetails } from './services/geminiService';
import { LocationData, LocationDetails, LoadingState } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<LocationDetails | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  // Initial Load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingState(LoadingState.LOADING_LIST);
      try {
        const initialLocations = await fetchBibleLocations();
        setLocations(initialLocations);
      } catch (error) {
        console.error("Failed to load initial locations", error);
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async (query: string) => {
    setLoadingState(LoadingState.LOADING_LIST);
    setSelectedDetails(null); // Clear details on new search
    try {
      const results = await fetchBibleLocations(query);
      setLocations(results);
      if (window.innerWidth < 768) {
         setIsMobileListOpen(true);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleSelectLocation = useCallback(async (loc: LocationData) => {
    setSelectedLocation(loc);
    // If we are on mobile, maybe close the list partialy or keep it open.
    // For this UI, if details are loaded, the sidebar switches to details view.
    
    // Check if we already have details for this exact location to avoid re-fetching
    if (selectedDetails && selectedDetails.id === loc.id) {
      return;
    }

    setLoadingState(LoadingState.LOADING_DETAILS);
    try {
      const details = await fetchLocationDetails(loc);
      setSelectedDetails(details);
      // On mobile, ensure sidebar is visible to show details
      if (window.innerWidth < 768) setIsMobileListOpen(true);
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  }, [selectedDetails]);

  const handleBackToList = () => {
    setSelectedDetails(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar (Desktop: fixed width, Mobile: absolute/drawer) */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-full md:w-96 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isMobileListOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <Sidebar 
          locations={locations}
          selectedDetails={selectedDetails}
          onSearch={handleSearch}
          onSelectLocation={handleSelectLocation}
          onBackToList={handleBackToList}
          loadingState={loadingState}
        />
        
        {/* Mobile Toggle Handle (Only visible on mobile when closed, technically handled by map click usually or a separate button) */}
      </div>

      {/* Toggle Button for Mobile (Floating) */}
      <button 
        className="md:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setIsMobileListOpen(!isMobileListOpen)}
      >
        {isMobileListOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        )}
      </button>

      {/* Main Content: Map */}
      <div className="flex-1 relative">
        <MapComponent 
          locations={locations} 
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            handleSelectLocation(loc);
            // On mobile map click, we might want to minimize the drawer to see the map, 
            // but here we keep logic simple: clicking marker opens details.
          }} 
        />

        {/* Loading Overlay for Details */}
        {loadingState === LoadingState.LOADING_DETAILS && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-xl flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="font-medium text-gray-700">正在讀取詳細經節資料...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;