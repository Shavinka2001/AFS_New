import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import LocationPicker from './LocationPicker';

const LocationModal = ({ isOpen, onClose, onSubmit, location, isEdit, mapRef }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  // Initialize form data when editing an existing location
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        description: location.description || '',
        address: location.address || '',
        latitude: location.latitude || null,
        longitude: location.longitude || null
      });
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select a location on the map');
      return;
    }

    if (!formData.address) {
      toast.error('Address is required');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error(error.message || 'Error saving location');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 w-full max-w-2xl mx-auto my-8 shadow-2xl transform transition-all animate-slideIn border border-gray-100">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {location ? 'Edit Location' : 'Add New Location'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>        </div>

        <form onSubmit={handleSubmit} className="space-y-4">          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="e.g. Main Building"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address*
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="e.g. 123 Main St"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              placeholder="Brief description of this location"
            ></textarea>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude*
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude || ''}
                onChange={handleChange}
                required
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="e.g. 41.40338"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude*
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude || ''}
                onChange={handleChange}
                required
                step="0.000001"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                placeholder="e.g. 2.17403"
              />
            </div>
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location on Map*
            </label>
            <LocationPicker 
              onLocationSelected={(coords) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  address: coords.address || prev.address
                }));
              }}
              initialLocation={
                formData.latitude && formData.longitude
                  ? [formData.latitude, formData.longitude]
                  : null
              }
            />
            {formData.latitude && formData.longitude && (
              <p className="mt-2 text-sm text-gray-600">
                Selected coordinates: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-600">              {formData.address || 'No address selected yet. Click on the map to select a location.'}
            </p>
          </div>

          <div className="flex justify-end space-x-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {location ? 'Updating...' : 'Adding...'}
                </div>              ) : isEdit ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
