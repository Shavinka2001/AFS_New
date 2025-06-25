import React, { useState } from 'react';

const LocationTable = ({ locations = [], loading, onEdit, onDelete, onViewOnMap, onAssignTechnicians, onManageBuildings }) => {
  const [expanded, setExpanded] = useState({});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (locations.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">No locations found</p>
        <p className="text-sm text-gray-500">Add a new location to get started.</p>
      </div>
    );
  }
  
  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Technicians
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {locations.map((location) => (
            <React.Fragment key={location._id}>
              <tr className="hover:bg-gray-50 group transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpand(location._id)}
                      className="focus:outline-none"
                      title={expanded[location._id] ? "Hide details" : "Show details"}
                    >
                      <svg
                        className={`w-4 h-4 mr-1 transition-transform ${expanded[location._id] ? "rotate-90 text-blue-600" : "text-gray-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="text-sm font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => toggleExpand(location._id)}>
                      {location.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {location.latitude && location.longitude ? 
                      `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 
                      'No coordinates'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{location.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    location.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {location.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {location.assignedTechnicians && location.assignedTechnicians.length > 0 ? (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {location.assignedTechnicians.length} assigned
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">No technicians assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onViewOnMap && onViewOnMap(location)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View on map"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onAssignTechnicians && onAssignTechnicians(location)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Assign technicians"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10m-5 4h5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onManageBuildings && onManageBuildings(location)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Manage buildings"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(location)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit location"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(location)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete location"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              {expanded[location._id] && (
                <tr>
                  <td colSpan={5} className="bg-blue-50 border-t border-blue-100 px-8 py-4">
                    <div className="flex flex-col md:flex-row md:space-x-8">
                      <div className="flex-1 mb-2 md:mb-0">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Description</div>
                        <div className="text-sm text-gray-700">{location.description || <span className="italic text-gray-400">No description</span>}</div>
                        <div className="mt-2 text-xs text-gray-500 font-semibold">Created At:</div>
                        <div className="text-xs text-gray-600">{location.createdAt ? new Date(location.createdAt).toLocaleString() : "N/A"}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-semibold mb-1">Buildings</div>
                        {location.buildings && location.buildings.length > 0 ? (
                          <ul className="list-disc ml-5 text-sm text-gray-700">
                            {location.buildings.map((b, i) => (
                              <li key={b._id || i}>
                                <span className="font-semibold">{b.name}</span>
                                {b.description && <span className="ml-2 text-xs text-gray-500">({b.description})</span>}
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {b.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="italic text-gray-400">No buildings added</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationTable;
