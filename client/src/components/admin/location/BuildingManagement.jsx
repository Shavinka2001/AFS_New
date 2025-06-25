import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getBuildingsForLocation, addBuildingToLocation, updateBuildingInLocation, deleteBuildingFromLocation } from '../../../services/buildingService';

const BuildingManagement = ({ location, onClose, isOpen }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (isOpen && location) {
      fetchBuildings();
    }
  }, [isOpen, location]);

  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const response = await getBuildingsForLocation(location._id);
      setBuildings(response.buildings || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error(error.message || 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Building name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingBuilding) {
        await updateBuildingInLocation(location._id, editingBuilding._id, formData);
        toast.success('Building updated successfully');
      } else {
        await addBuildingToLocation(location._id, formData);
        toast.success('Building added successfully');
      }
      
      resetForm();
      fetchBuildings();
    } catch (error) {
      console.error('Error saving building:', error);
      toast.error(error.message || 'Failed to save building');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (building) => {
    setEditingBuilding(building);
    setFormData({ name: building.name, description: building.description || '' });
    setIsFormVisible(true);
  };

  const handleDelete = async (buildingId) => {
    if (!window.confirm('Are you sure you want to delete this building?')) return;

    setLoading(true);
    try {
      await deleteBuildingFromLocation(location._id, buildingId);
      toast.success('Building deleted successfully');
      fetchBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error(error.message || 'Failed to delete building');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingBuilding(null);
    setIsFormVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Building Management</h2>
            <p className="text-gray-600 mt-1">Manage buildings for {location?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add Building Button */}
          <div className="mb-6">
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isFormVisible ? 'Cancel' : 'Add New Building'}
            </button>
          </div>

          {/* Add/Edit Building Form */}
          {isFormVisible && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBuilding ? 'Edit Building' : 'Add New Building'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="e.g. Building A, Main Building"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                      placeholder="Brief description of the building"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingBuilding ? 'Update' : 'Add Building')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Buildings List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buildings ({buildings.length})
            </h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : buildings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No buildings found</p>
                <p className="text-gray-400 text-sm mt-1">Add buildings to organize your location</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((building) => (
                  <div key={building._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900">{building.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(building)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit building"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(building._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete building"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {building.description && (
                      <p className="text-gray-600 text-sm mb-3">{building.description}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${building.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {building.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span>Created: {new Date(building.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingManagement;
