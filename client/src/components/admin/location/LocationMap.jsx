import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { mapsLoaderOptions, defaultMapCenter, defaultZoom } from '../../../config/mapsConfig';

const LocationMap = forwardRef(({
  locations = [],
  center = defaultMapCenter,
  zoom = defaultZoom,
  height = '400px',
  onLocationSelect,
  editingLocation = null
}, ref) => {
  const { isLoaded } = useJsApiLoader(mapsLoaderOptions);

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');

  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);

  useEffect(() => {
    // If editing an existing location, set the marker position
    if (editingLocation && editingLocation.latitude && editingLocation.longitude) {
      setMarkerPosition({
        lat: editingLocation.latitude,
        lng: editingLocation.longitude
      });
      setCurrentAddress(editingLocation.address || '');
    } else {
      setMarkerPosition(null);
      setCurrentAddress('');
    }
  }, [editingLocation]);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    
    if (geocoder) {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setCurrentAddress(address);
          
          // Pass location data to parent component
          if (onLocationSelect) {
            onLocationSelect(lat, lng, address);
          }
        } else {
          toast.error('Unable to find address for this location.');
        }
      });
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchAddress) return;
    
    if (geocoder) {
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          const newPosition = { lat: lat(), lng: lng() };
          
          setMarkerPosition(newPosition);
          setCurrentAddress(results[0].formatted_address);
          
          // Pan map to the new location
          if (map) {
            map.panTo(newPosition);
            map.setZoom(15);
          }
          
          // Pass location data to parent component
          if (onLocationSelect) {
            onLocationSelect(lat(), lng(), results[0].formatted_address);
          }
        } else {
          toast.error('Location not found. Please try a different search term.');
        }
      });
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateMarkerPosition: (lat, lng, address) => {
      setMarkerPosition({ lat, lng });
      setCurrentAddress(address || '');
    },
    getCurrentPosition: () => {
      return {
        position: markerPosition,
        address: currentAddress
      };
    }
  }));

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center" style={{ height }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search for an address or place"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Instructions */}
      <p className="text-sm text-gray-600">
        Click on the map to select a location or search for an address above.
      </p>

      {/* Current selection display */}
      {markerPosition && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-sm text-gray-600">{currentAddress || 'Address unavailable'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height, width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onClick={onMapClick}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Display saved locations */}
          {locations.map((location) => (
            <Marker
              key={location._id}
              position={{ lat: location.latitude, lng: location.longitude }}
              onClick={() => handleLocationClick(location)}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          ))}

          {/* Display the current marker for adding/editing */}
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={(e) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarkerPosition({ lat, lng });
                
                if (geocoder) {
                  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                      const address = results[0].formatted_address;
                      setCurrentAddress(address);
                      
                      // Pass location data to parent component
                      if (onLocationSelect) {
                        onLocationSelect(lat, lng, address);
                      }
                    }
                  });
                }
              }}
            />
          )}

          {/* Display info window for selected location */}
          {selectedLocation && (
            <InfoWindow
              position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-medium text-gray-900">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                {selectedLocation.description && (
                  <p className="text-sm mt-1">{selectedLocation.description}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
});

export default LocationMap;
