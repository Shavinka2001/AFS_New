import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { mapsLoaderOptions, defaultMapCenter } from '../../../config/mapsConfig';

const LocationPicker = ({ onLocationSelected, initialLocation = null }) => {
  const { isLoaded } = useJsApiLoader(mapsLoaderOptions);

  const [markerPosition, setMarkerPosition] = useState(initialLocation ? {
    lat: initialLocation[0],
    lng: initialLocation[1]
  } : null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  
  useEffect(() => {
    if (isLoaded && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [isLoaded, geocoder]);
  
  const onMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setMarkerPosition({ lat, lng });
    
    if (geocoder) {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          
          // Pass location data to parent component
          if (onLocationSelected) {
            onLocationSelected({
              latitude: lat,
              longitude: lng,
              address: address
            });
          }
        } else {
          toast.error('Unable to find address for this location.');
          if (onLocationSelected) {
            onLocationSelected({
              latitude: lat,
              longitude: lng
            });
          }
        }
      });
    }
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }  return (
    <div className="h-72 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-4">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={markerPosition || defaultMapCenter}
        zoom={13}
        onClick={onMapClick}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
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
                    
                    // Pass location data to parent component
                    if (onLocationSelected) {
                      onLocationSelected({
                        latitude: lat,
                        longitude: lng,
                        address: address
                      });
                    }
                  }
                });
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationPicker;
