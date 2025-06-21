import React from 'react';

const PersonalInformation = ({ user }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="h-5 w-5 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">First Name</label>
                        <input
                            type="text"
                            value={user.firstname}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Last Name</label>
                        <input
                            type="text"
                            value={user.lastname}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Email</label>
                        <input
                            type="email"
                            value={user.email}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Phone</label>
                        <input
                            type="tel"
                            value={user.phone}
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Role</label>
                        <input
                            type="text"
                            value="Senior Technician"
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Department</label>
                        <input
                            type="text"
                            value="Technical Support"
                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900"
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInformation; 