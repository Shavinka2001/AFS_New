import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { assignTechnicians, getLocations } from '../../../services/locationService';
import { getTechnicians } from '../../../services/userService';

const AssignTechniciansModal = ({ isOpen, onClose, location, onAssign }) => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [assignedTechniciansMap, setAssignedTechniciansMap] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTechniciansAndAssignments();

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

  const fetchTechniciansAndAssignments = async () => {
    setFetchingUsers(true);
    setError('');
    try {
      const [technicianUsers, locationsData] = await Promise.all([
        getTechnicians(),
        getLocations()
      ]);

      setTechnicians(technicianUsers);

      const technicianAssignmentMap = {};
      const locations = locationsData?.locations || locationsData?.data || [];

      locations.forEach(loc => {
        if (loc.assignedTechnicians && Array.isArray(loc.assignedTechnicians)) {
          loc.assignedTechnicians.forEach(techId => {
            if (location && loc._id !== location._id) {
              const technicianId = typeof techId === 'object' ? techId._id : techId;
              technicianAssignmentMap[technicianId] = loc;
            }
          });
        }
      });

      setAssignedTechniciansMap(technicianAssignmentMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load technicians and assignments');
      toast.error('Failed to load technician data');
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleToggleTechnician = (techId) => {
    if (!selectedTechnicianIds.includes(techId) && assignedTechniciansMap[techId]) {
      const assignedLocation = assignedTechniciansMap[techId];
      toast.warning(`This technician is already assigned to location: ${assignedLocation.name}`);
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Assign Technicians to <span className="text-blue-600">{location?.name}</span>
        </h2>

        {fetchingUsers ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Select Technicians:</label>
              {error && <div className="text-red-500 mb-2">{error}</div>}

              {technicians.length === 0 ? (
                <p className="text-gray-500">No technicians available.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {technicians.map((tech) => {
                    const isAssignedElsewhere = assignedTechniciansMap[tech._id];
                    const isSelected = selectedTechnicianIds.includes(tech._id);

                    return (
                      <div
                        key={tech._id}
                        className={`flex items-start justify-between p-3 rounded-lg border transition-all shadow-sm
                          ${
                            isAssignedElsewhere
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-50 border-blue-500'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-start gap-3 w-full">
                          {/* Custom Checkbox */}
                          <label
                            htmlFor={`tech-${tech._id}`}
                            className={`relative flex items-start pt-1 ${
                              isAssignedElsewhere ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`tech-${tech._id}`}
                              checked={isSelected}
                              onChange={() => handleToggleTechnician(tech._id)}
                              disabled={isAssignedElsewhere}
                              className="sr-only peer"
                            />
                            <div
                              className={`
                                w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                ${
                                  isAssignedElsewhere
                                    ? 'border-gray-400 bg-gray-200'
                                    : 'border-blue-600 peer-checked:bg-blue-600'
                                }
                              `}
                            >
                              <svg
                                className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </label>

                          {/* Technician Info */}
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">
                              {tech.firstname} {tech.lastname}
                            </span>
                            <span className="text-gray-500">{tech.email}</span>
                            {isAssignedElsewhere && (
                              <span className="text-xs text-blue-600 italic mt-1">
                                Assigned to: {assignedTechniciansMap[tech._id].name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
