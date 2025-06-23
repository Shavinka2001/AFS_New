import React from "react";

const WorkOrderSearch = ({ search, onChange, onSearch, onClear }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e);
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Search Work Orders</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
            Order ID
          </label>
          <input
            type="text"
            name="id"
            id="id"
            value={search.id || ''}
            onChange={onChange}
            placeholder="Search by order ID..."
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter full or partial order ID
          </p>
        </div>

        <div>
          <label htmlFor="confinedSpaceNameOrId" className="block text-sm font-medium text-gray-700 mb-1">
            Space Name/ID
          </label>
          <input
            type="text"
            name="confinedSpaceNameOrId"
            id="confinedSpaceNameOrId"
            value={search.confinedSpaceNameOrId || ''}
            onChange={onChange}
            placeholder="Search by space name..."
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
          />
        </div>
        
        
        
        <div>
          <label htmlFor="dateOfSurvey" className="block text-sm font-medium text-gray-700 mb-1">
            Survey Date
          </label>
          <input
            type="date"
            name="dateOfSurvey"
            id="dateOfSurvey"
            value={search.dateOfSurvey || ''}
            onChange={onChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm p-2 border"
          />
        </div>
        
        <div className="lg:col-span-2 flex items-end space-x-4">
          <button
            type="submit"
            className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClear}
            className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderSearch;