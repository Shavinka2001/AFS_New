import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getLocations, createLocation, deleteLocation, updateLocation } from '../../services/locationService';
import LocationMap from '../../components/admin/location/LocationMap';
import LocationTable from '../../components/admin/location/LocationTable';
import LocationModal from '../../components/admin/location/LocationModal';
import AssignedLocations from '../../components/admin/location/AssignedLocations';
import AssignTechniciansModal from '../../components/admin/location/AssignTechniciansModal';
import BuildingManagement from '../../components/admin/location/BuildingManagement';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
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
      setMapZoom(15);
    }
  };

  const handleDeleteLocation = async (location) => {
    if (window.confirm(`Are you sure you want to delete ${location.name}?`)) {
      try {
        await deleteLocation(location._id);
        toast.success("Location deleted successfully");
        fetchLocations();
      } catch (err) {
        toast.error(err.message || "Failed to delete location");
      }
    }
  };

  const handleSubmitLocation = async (formData) => {
    try {
      if (isEdit && selectedLocation) {
        await updateLocation(selectedLocation._id, formData);
        toast.success("Location updated successfully");
      } else {
        await createLocation(formData);
        toast.success("Location created successfully");
      }
      fetchLocations();
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save location");
    }
  };

  const handleViewOnMap = (location) => {
    if (location.latitude && location.longitude) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      setMapZoom(15);
      
      // Scroll to map if on mobile
      const mapElement = document.getElementById('location-map');
      if (mapElement && window.innerWidth < 768) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  const handleAssignTechnicians = (location) => {
    setSelectedLocation(location);
    setShowAssignModal(true);
  };

  const handleManageBuildings = (location) => {
    setSelectedLocation(location);
    setShowBuildingModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Location Management</h1>
        <button 
          onClick={handleAddLocation}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          Add New Location
        </button>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="order-2 lg:order-1">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Locations</h2>            <LocationTable 
              locations={locations} 
              loading={loading}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
              onViewOnMap={handleViewOnMap}
              onAssignTechnicians={handleAssignTechnicians}
              onManageBuildings={handleManageBuildings}
            />
          </div>
        </div>
        
        <div id="location-map" className="order-1 lg:order-2">
          <div className="bg-white shadow rounded-lg p-4 ">
            <h2 className="text-xl font-semibold mb-4">Map View</h2>
            <div className="h-[500px] w-full">
              <LocationMap 
                locations={locations}
                center={mapCenter}
                zoom={mapZoom}
                onMarkerClick={handleEditLocation}
                mapRef={mapRef}
              />
            </div>
          </div>
        </div>
      </div>
      
      
      
      {showModal && (
        <LocationModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitLocation}
          location={selectedLocation}
          isEdit={isEdit}
          mapRef={mapRef}
        />
      )}
        {showAssignModal && (
        <AssignTechniciansModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          location={selectedLocation}
          onAssign={fetchLocations}
        />
      )}

      {showBuildingModal && (
        <BuildingManagement
          isOpen={showBuildingModal}
          onClose={() => setShowBuildingModal(false)}
          location={selectedLocation}
        />
      )}
    </div>
  );
};

export default LocationManagement;
