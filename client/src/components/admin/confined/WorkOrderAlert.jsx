import React from "react";

const WorkOrderAlert = ({ type, message }) => {
  if (!message) return null;
  
  const styles = {
    error: {
      container: "mb-6 p-4 bg-white border-l-4 border-red-500 rounded-xl animate-fadeIn shadow-lg",
      icon: "h-5 w-5 text-red-500",
      text: "text-sm text-gray-900"
    },
    success: {
      container: "mb-6 p-4 bg-white border-l-4 border-gray-900 rounded-xl animate-fadeIn shadow-lg",
      icon: "h-5 w-5 text-gray-900",
      text: "text-sm text-gray-900"
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className={currentStyle.container}>
      <div className="flex">
        <div className="flex-shrink-0">
          {type === "error" ? (
            <svg className={currentStyle.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className={currentStyle.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={currentStyle.text}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderAlert;