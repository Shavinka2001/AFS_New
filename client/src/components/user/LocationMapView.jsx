import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { mapsLoaderOptions, defaultMapCenter } from '../../config/mapsConfig';

const LocationMapView = ({ location, height = '300px' }) => {
  const { isLoaded } = useJsApiLoader(mapsLoaderOptions);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!location || !location.latitude || !location.longitude) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-gray-50 rounded-lg border border-gray-200 p-4" style={{ height }}>
        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="mt-2 text-gray-600 text-sm">No location coordinates available</p>
      </div>
    );
  }

  const position = {
    lat: parseFloat(location.latitude),
    lng: parseFloat(location.longitude)
  };

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg border border-gray-200"
      style={{ height, minHeight: height, width: '100%' }}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={position}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={position}
          onClick={() => setShowInfoWindow(true)}
        >
          {showInfoWindow && (
            <InfoWindow
              position={position}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-medium text-gray-900">
                  {/* Show saved name if location is deleted */}
                  {location.isDeleted
                    ? (location.confinedSpaceNameOrId || location.name)
                    : location.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {/* Show saved address/description if location is deleted */}
                  {location.isDeleted
                    ? (location.locationDescription || location.address || 'No address provided')
                    : (location.address || 'No address provided')}
                </p>
                {location.description && (
                  <p className="text-sm mt-1">{location.description}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
    </div>
  );
};

export default LocationMapView;
