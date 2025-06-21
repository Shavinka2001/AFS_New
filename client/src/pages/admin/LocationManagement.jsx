import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getLocations, createLocation, deleteLocation, updateLocation } from '../../services/locationService';
import LocationMap from '../../components/admin/location/LocationMap';
import LocationTable from '../../components/admin/location/LocationTable';
import LocationModal from '../../components/admin/location/LocationModal';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Default center (Sri Lanka)
  const [mapZoom, setMapZoom] = useState(7);
  
  const mapRef = useRef(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data.locations || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(err.message || "Failed to fetch locations");
      toast.error(err.message || "Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setIsEdit(true);
    setShowModal(true);
    
    // Center map on the location being edited
    if (location.latitude && location.longitude) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      setMapZoom(14);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(locationId);
        toast.success("Location deleted successfully");
        fetchLocations();
      } catch (err) {
        toast.error(err.message || "Error deleting location");
      }
    }
  };

  const handleSubmit = async (locationData) => {
    try {
      if (isEdit && selectedLocation) {
        await updateLocation(selectedLocation._id, locationData);
        toast.success("Location updated successfully");
      } else {
        await createLocation(locationData);
        toast.success("Location added successfully");
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      toast.error(err.message || "Error saving location");
    }
  };

  const handleMapLocationSelect = (lat, lng, address) => {
    if (mapRef.current && mapRef.current.updateMarkerPosition) {
      mapRef.current.updateMarkerPosition(lat, lng, address);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Location Management
              </h1>
              <p className="mt-2 text-base text-gray-700">
                Add and manage location points for your organization
              </p>
            </div>
            <button
              onClick={handleAddLocation}
              className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New Location</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl animate-fadeIn shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Map */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Interactive Map</h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on the map to select a location or search for an address
              </p>
            </div>
            <div className="p-6">
              <LocationMap 
                ref={mapRef}
                locations={locations} 
                center={mapCenter}
                zoom={mapZoom}
                onLocationSelect={handleMapLocationSelect}
                editingLocation={selectedLocation}
                height="500px"
              />
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Locations</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your saved locations
              </p>
            </div>
            <div className="p-6">
              <LocationTable 
                locations={locations}
                loading={loading}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onViewOnMap={(location) => {
                  setMapCenter({ lat: location.latitude, lng: location.longitude });
                  setMapZoom(15);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showModal && (
        <LocationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          location={selectedLocation}
          isEdit={isEdit}
          mapRef={mapRef}
        />
      )}
    </div>
  );
};

export default LocationManagement;
