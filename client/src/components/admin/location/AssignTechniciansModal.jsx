import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assignTechnicians } from '../../../services/locationService';
import { getTechnicians } from '../../../services/userService';

const AssignTechniciansModal = ({ isOpen, onClose, location, onAssign }) => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  
  // Fetch technicians (users with user role) when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
      
      // Set initial selected technicians if location has any
      if (location && location.assignedTechnicians) {
        const techIds = Array.isArray(location.assignedTechnicians) 
          ? location.assignedTechnicians.map(tech => typeof tech === 'object' ? tech._id : tech)
          : [];
        setSelectedTechnicianIds(techIds);
      } else {
        setSelectedTechnicianIds([]);
      }
    }
  }, [isOpen, location]);
  const fetchTechnicians = async () => {
    setFetchingUsers(true);
    try {
      const technicianUsers = await getTechnicians();
      setTechnicians(technicianUsers);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    } finally {
      setFetchingUsers(false);
    }
  };
  
  const handleToggleTechnician = (techId) => {
    setSelectedTechnicianIds(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await assignTechnicians(location._id, selectedTechnicianIds);
      toast.success('Technicians assigned successfully');
      onAssign && onAssign();
      onClose();
    } catch (error) {
      console.error('Error assigning technicians:', error);
      toast.error(error.message || 'Failed to assign technicians');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assign Technicians to {location?.name}</h2>
        
        {fetchingUsers ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Select Technicians:
              </label>
              
              {technicians.length === 0 ? (
                <p className="text-gray-500">No technicians available.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {technicians.map(tech => (
                    <div key={tech._id} className="flex items-center mb-2 p-1 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        id={`tech-${tech._id}`}
                        checked={selectedTechnicianIds.includes(tech._id)}
                        onChange={() => handleToggleTechnician(tech._id)}
                        className="mr-2"
                      />
                      <label htmlFor={`tech-${tech._id}`} className="cursor-pointer flex-1">
                        {tech.firstname} {tech.lastname} ({tech.email})
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-4 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading || fetchingUsers}
              >
                {loading ? 'Saving...' : 'Assign Technicians'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignTechniciansModal;
