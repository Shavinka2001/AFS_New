import React from "react";

const StatCard = ({ name, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition duration-300 flex items-center space-x-4">
    <div className="bg-gray-100 p-3 rounded-full text-2xl">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{name}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

export default StatCard;