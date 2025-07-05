import React, { useState, useEffect } from 'react';
import { getAssignedLocations } from '../../../services/locationService';
import { getTechnicianById } from '../../../services/userService';
import { toast } from 'react-toastify';
import AssignTechniciansModal from './AssignTechniciansModal';

const AssignedLocations = ({ isAdmin = false }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicianDetails, setTechnicianDetails] = useState({});

  useEffect(() => {
    fetchAssignedLocations();
  }, []);
  const fetchAssignedLocations = async () => {
    setLoading(true);
    try {
      const data = await getAssignedLocations();
      setLocations(data.data || []);
    } catch (error) {
      console.error('Error fetching assigned locations:', error);
      toast.error(error.message || 'Failed to load your assigned locations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (location) => {
    setSelectedLocation(location);
  };

  const handleAssignTechnicians = () => {
    if (selectedLocation) {
      setShowAssignModal(true);
    } else {
      toast.info('Please select a location first');
    }
  };

  const handleAssignmentComplete = () => {
    fetchAssignedLocations();
    setShowAssignModal(false);
  };

  const fetchTechnicianDetails = async (technicianIds) => {
    const techDetails = {};
    
    if (!technicianIds || !technicianIds.length) return;
    
    for (const id of technicianIds) {
      try {
        if (!technicianDetails[id]) {
          const techData = await getTechnicianById(id);
          techDetails[id] = techData;
        }
      } catch (error) {
        console.error(`Error fetching details for technician ${id}:`, error);
      }
    }
    
    setTechnicianDetails(prevDetails => ({
      ...prevDetails,
      ...techDetails
    }));
  };

  useEffect(() => {
    if (selectedLocation?.assignedTechnicians?.length > 0) {
      fetchTechnicianDetails(selectedLocation.assignedTechnicians);
    }
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isAdmin ? 'Manage Location Assignments' : 'My Assigned Locations'}
        </h2>
        
        {isAdmin && (
          <button 
            onClick={handleAssignTechnicians}
            disabled={!selectedLocation}
            className={`px-4 py-2 rounded-md ${
              !selectedLocation 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Assign Technicians
          </button>
        )}
      </div>
      
      {locations.length === 0 ? (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="mt-2 text-gray-600">
            {isAdmin 
              ? 'No locations found. Please add locations first.' 
              : "You don't have any assigned locations yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(location => (
            <div 
              key={location._id} 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedLocation?._id === location._id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleViewDetails(location)}
            >
              <h3 className="font-medium text-lg mb-2">
                {/* Show saved name if deleted */}
                {location.isDeleted
                  ? (location.confinedSpaceNameOrId || location.name)
                  : location.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {/* Show saved address/description if deleted */}
                {location.isDeleted
                  ? (location.locationDescription || location.address)
                  : location.address}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  location.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </span>
                <button 
                  className="text-blue-600 hover:underline text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(location);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedLocation && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">{selectedLocation.name}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedLocation(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-600"><strong>Address:</strong> {selectedLocation.address}</p>
              <p className="text-gray-600"><strong>Description:</strong> {selectedLocation.description || 'No description provided'}</p>
              <p className="text-gray-600">
                <strong>Coordinates:</strong> {selectedLocation.latitude?.toFixed(6)}, {selectedLocation.longitude?.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Status:</strong> {selectedLocation.isActive ? 'Active' : 'Inactive'}</p>
              <p className="text-gray-600">
                <strong>Created:</strong> {new Date(selectedLocation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Assigned Work:</h4>
            <p className="text-gray-600">Work orders related to this location will appear here.</p>
          </div>
            {/* Display assigned technicians */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Assigned Technicians:</h4>
            {selectedLocation.assignedTechnicians?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLocation.assignedTechnicians.map((techId) => {
                  const tech = technicianDetails[techId];
                  return (
                    <span key={techId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {tech ? (
                        <>
                          <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {tech.firstname?.[0]}{tech.lastname?.[0]}
                          </span>
                          {tech.firstname} {tech.lastname}
                        </>
                      ) : (
                        `Technician (${techId.substring(0, 6)}...)`
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No technicians assigned yet.</p>
            )}
          </div>
        </div>
      )}      <AssignTechniciansModal 
        isOpen={showAssignModal} 
        onClose={() => setShowAssignModal(false)} 
        location={selectedLocation} 
        onAssign={handleAssignmentComplete}
      />
    </div>
  );
};

export default AssignedLocations;
