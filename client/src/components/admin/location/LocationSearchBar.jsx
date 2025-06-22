import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const LocationSearchBar = ({ onLocationFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geocoder, setGeocoder] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Initialize geocoder and autocomplete once Google Maps API is loaded
    if (window.google && window.google.maps) {
      setGeocoder(new window.google.maps.Geocoder());
      
      if (window.google.maps.places) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode'],
          fields: ['place_id', 'geometry', 'formatted_address']
        });
        
        setAutocomplete(autocompleteInstance);
        
        // Add listener for place selection
        autocompleteInstance.addListener('place_changed', handlePlaceChanged);
      }
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          setGeocoder(new window.google.maps.Geocoder());
          
          if (window.google.maps.places && inputRef.current) {
            const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
              types: ['geocode'],
              fields: ['place_id', 'geometry', 'formatted_address']
            });
            
            setAutocomplete(autocompleteInstance);
            
            // Add listener for place selection
            autocompleteInstance.addListener('place_changed', handlePlaceChanged);
          }
          
          clearInterval(checkGoogleMaps);
        }
      }, 500);
      
      return () => clearInterval(checkGoogleMaps);
    }
    
    return () => {
      // Clean up event listener
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);
  
  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested
        toast.warning('Please select a location from the dropdown suggestions');
        return;
      }
      
      const location = place.geometry.location;
      const formattedAddress = place.formatted_address;
      
      onLocationFound({
        latitude: location.lat(),
        longitude: location.lng(),
        address: formattedAddress
      });
      
      toast.success(`Location selected: ${formattedAddress}`);
    }
  };
    const handleSearch = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation to prevent parent form submission
    
    if (!searchQuery.trim()) {
      toast.warning('Please enter a location to search');
      return;
    }
    
    if (!geocoder) {
      toast.error('Maps service not yet initialized. Please try again in a moment.');
      return;
    }
    
    setIsSearching(true);
    
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);
      
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const formattedAddress = results[0].formatted_address;
        
        onLocationFound({
          latitude: location.lat(),
          longitude: location.lng(),
          address: formattedAddress
        });
        
        toast.success(`Found location: ${formattedAddress}`);
      } else {
        toast.error(`Could not find location: ${searchQuery}`);
      }
    });
  };
    return (
    <div className="mb-4">
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location or start typing for suggestions..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
        />
        <button 
          type="button"
          onClick={handleSearch}
          className="bg-gray-800 text-white px-4 py-2 rounded-r-xl hover:bg-gray-700"
          disabled={isSearching}
        >
          {isSearching ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>Search</span>
            </div>          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Type an address or location name and select from suggestions, or use the search button
      </p>
    </div>
  );
};

export default LocationSearchBar;
