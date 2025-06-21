// import React from 'react';

// const ProfessionalDetails = () => {
//     return (
//         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
//                 <svg className="h-5 w-5 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                 </svg>
//                 Professional Details
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-6">
//                     <div className="group">
//                         <label className="block text-sm font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">Employee ID</label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value="TECH-2024-001"
//                                 className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900 pl-4 pr-4 py-3 transition-all duration-200 hover:bg-gray-100"
//                                 readOnly
//                             />
//                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="group">
//                         <label className="block text-sm font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">Join Date</label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value="January 15, 2024"
//                                 className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900 pl-4 pr-4 py-3 transition-all duration-200 hover:bg-gray-100"
//                                 readOnly
//                             />
//                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="space-y-6">
//                     <div className="group">
//                         <label className="block text-sm font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">Specialization</label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value="System Maintenance & Repair"
//                                 className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900 pl-4 pr-4 py-3 transition-all duration-200 hover:bg-gray-100"
//                                 readOnly
//                             />
//                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="group">
//                         <label className="block text-sm font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">Certification</label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value="Advanced Technical Certification"
//                                 className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 bg-gray-50 text-gray-900 pl-4 pr-4 py-3 transition-all duration-200 hover:bg-gray-100"
//                                 readOnly
//                             />
//                             <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProfessionalDetails; 