import React from 'react';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            text: "Completed system maintenance",
            time: "2 hours ago",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        },
        {
            id: 2,
            text: "Updated technical documentation",
            time: "4 hours ago",
            icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        },
        {
            id: 3,
            text: "Resolved customer ticket #1234",
            time: "1 day ago",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
                <svg className="h-5 w-5 mr-2 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div 
                        key={activity.id}
                        className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        <div className="flex-shrink-0 mt-1">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-gray-900 to-gray-800"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                                {activity.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {activity.time}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activity.icon} />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity; 