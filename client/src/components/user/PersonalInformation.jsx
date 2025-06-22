import React from 'react';

const PersonalInformation = ({ user }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-70"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gray-50 to-transparent rounded-tr-full"></div>
            
            {/* Header with improved styling */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                                        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-2.5 rounded-lg mr-3 text-white shadow-md">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        Personal Information
                    </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                   
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-5">
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">First Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={user.firstname || 'Not provided'}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">Last Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={user.lastname || 'Not provided'}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={user.email || 'Not provided'}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-5">
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">Phone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <input
                                type="tel"
                                value={user.phone || 'Not provided'}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">Role</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={user.role || "Technician"}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5 transition-all group-hover:text-gray-900">Department</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={user.department || "Technical Support"}
                                className="block w-full rounded-xl border-0 bg-gray-50/70 py-3.5 pl-12 pr-4 text-gray-900 font-medium shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-500 read-only:bg-gray-50/50 transition-all"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
            </div>
            
          
        </div>
    );
};

export default PersonalInformation; 