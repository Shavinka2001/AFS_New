import React from 'react';

const PerformanceStats = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
                <svg className="h-5 w-5 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Performance Overview
            </h3>
            <div className="space-y-6">
                <div className="group">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Tasks Completed</span>
                        <span className="text-sm font-medium text-gray-900">85%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-gray-900 to-gray-800 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: '85%' }}
                        ></div>
                    </div>
                </div>
                <div className="group">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Customer Satisfaction</span>
                        <span className="text-sm font-medium text-gray-900">92%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-gray-900 to-gray-800 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: '92%' }}
                        ></div>
                    </div>
                </div>
                <div className="group">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Response Time</span>
                        <span className="text-sm font-medium text-gray-900">15min</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-gray-900 to-gray-800 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: '90%' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceStats; 