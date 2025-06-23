"use client"

import { useEffect, useState } from "react"
import { getWorkOrders, deleteWorkOrder, createWorkOrder, updateWorkOrder } from '../../services/workOrderService';
import { getLocations } from '../../services/locationService';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// StatCard Component
const StatCard = ({ name, value, icon, trend }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{name}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {trend}
            </span>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center">{icon}</div>
      </div>
    </div>
  )
}

// UserTable Component
const UserTable = ({ users, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Name</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Email</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Role</th>
            <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.firstname?.[0] || "U"}
                      {user.lastname?.[0] || ""}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user.firstname} {user.lastname}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-gray-600">{user.email}</td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.userType === "admin" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.userType}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Location Card Component for Dashboard
const LocationCard = ({ location, orders, onViewOrder, onEditOrder, onAddOrder, onDeleteOrder, downloadSinglePDF }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md h-[320px] flex flex-col w-full relative">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LocationIcon className="h-4 w-4 text-gray-700" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{location.name}</h3>
              <p className="text-xs text-gray-600 truncate max-w-[180px]">{location.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {orders.length}
            </span>
           
          </div>
        </div>
      </div>      <div className="px-3 py-2 flex-1 flex flex-col overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center text-center py-4 flex-1">
            <ClipboardIcon className="h-4 w-4 text-gray-400 mr-1" />
            <p className="text-xs text-gray-500">No work orders</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header for table */}            <div className="bg-gray-50 sticky top-0 z-10 rounded-t-md">
              <table className="min-w-full text-xs border-collapse table-fixed">
                <thead>                  <tr className="text-xs">
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 w-[40%]">
                      ID
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 w-[30%]">
                      Date
                    </th>
                    <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 w-[30%]">
                      Actions
                    </th>
                  </tr>
                </thead>              </table>            </div>
              {/* Scrollable container for all orders */}            <div className="flex-1 overflow-y-auto h-[230px] overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300">
              <table className="min-w-full text-xs border-collapse table-fixed">
                <tbody className="bg-white divide-y divide-gray-100">
                  {/* All orders in a single scrollable list */}
                  {orders.map((order, index) => (                    <tr 
                      key={order._id || index} 
                      className="hover:bg-gray-50 transition-colors h-[46px]"
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900 truncate max-w-[100px]">{order.confinedSpaceNameOrId}</span>
                          <span className={`ml-1.5 inline-flex h-2 w-2 rounded-full ${order.permitRequired ? 'bg-amber-500' : 'bg-green-500'}`} 
                                title={order.permitRequired ? "Permit Required" : "No Permit Required"}>
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[80px]">{order.dateOfSurvey?.slice(0, 10) || "No date"}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-1">
                          <button 
                            onClick={() => onViewOrder(order)} 
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors" 
                            title="View Order"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => downloadSinglePDF(order)}
                            className="p-1 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                            title="Download PDF"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => onDeleteOrder(order._id)} 
                            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Order"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>                      
                      </td>                    
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* View All Orders Button */}
            <div className="mt-auto pt-2 border-t border-gray-100">
              <a href={`/admin/workorders?location=${location._id}`} className="text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center py-1">
                View All Orders
                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Work Order Grid Component
const WorkOrderLocationGrid = ({ workOrdersByLocation, loading, onViewOrder, onEditOrder, onAddOrder, onDeleteOrder, downloadSinglePDF }) => {  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (          <div key={i} className="h-[420px] bg-gray-100 rounded-xl animate-pulse flex flex-col">
            <div className="h-16 bg-gray-200 rounded-t-xl"></div>            <div className="flex-1 p-4 space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-full mb-2"></div>
              {/* Scrollable area for orders */}
              <div className="h-[230px] overflow-hidden space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
              {/* View All Orders button placeholder */}
              <div className="h-6 bg-gray-200 rounded-lg w-1/3 mx-auto mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  const locationEntries = Object.values(workOrdersByLocation);
  
  if (!locationEntries || locationEntries.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
          <LocationIcon className="h-10 w-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No locations or work orders found.</p>
        <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">
          Add locations and work orders to see them displayed here with their associated data.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {locationEntries.map((entry) => (
        <LocationCard 
          key={entry.location._id} 
          location={entry.location} 
          orders={entry.orders}
          onViewOrder={onViewOrder}
          onEditOrder={onEditOrder}
          onAddOrder={onAddOrder}
          onDeleteOrder={onDeleteOrder}
          downloadSinglePDF={downloadSinglePDF}
        />
      ))}
    </div>
  );
}

// Icons as SVG components
const UsersIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
)

const ClipboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
  </svg>
)

const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 012 2z"
    />
  </svg>
)

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

// Add WorkOrder Icon
const WorkOrderIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </svg>
)

// Location Icon
const LocationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
    />
  </svg>
)

// Main Dashboard Component
export default function Dashboard() {
  const [stats, setStats] = useState([    {
      name: "Confined Orders",
      value: 0,
      icon: <ClipboardIcon className="text-white w-6 h-6" />,
      trend: "orders",
    },
  ])
  const [users, setUsers] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [locations, setLocations] = useState([])
  const [workOrdersByLocation, setWorkOrdersByLocation] = useState({})
  const [loading, setLoading] = useState(true)
  const [orderLoading, setOrderLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(true)
  const [admin, setAdmin] = useState({    firstname: "Admin",
    lastname: "",
    userType: "admin",
  })
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [isView, setIsView] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  })
  // Define fetchData function outside useEffect to make it reusable
  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      // Fetch users
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const userArray = Array.isArray(data) ? data : []
      setUsers(userArray)
      
      // Fetch work orders
      setOrderLoading(true)
      const orders = await getWorkOrders()
      const orderList = Array.isArray(orders) ? orders : []
      setWorkOrders(orderList)
      setOrderLoading(false)
      
      // Fetch locations
      setLocationLoading(true)
      try {
        const locationData = await getLocations()
        const locationList = (locationData?.locations || locationData?.data || [])
        setLocations(locationList)
        
        // Group work orders by location
        const ordersByLocation = {}
        
        // First, create entries for all locations, even those without orders
        locationList.forEach(location => {
          ordersByLocation[location._id] = {
            location,
            orders: []
          }
        })
        
        // Then add orders to their respective locations
        orderList.forEach(order => {
          // Try to match order to location by name or address
          const matchedLocation = locationList.find(location => 
            location.name === order.confinedSpaceNameOrId ||
            location.name === order.building ||
            location.address === order.building
          )
          
          if (matchedLocation) {
            // If we found a match, add to that location
            ordersByLocation[matchedLocation._id].orders.push(order)
          } else {
            // If no match, create a "Unknown Location" category
            if (!ordersByLocation['unknown']) {
              ordersByLocation['unknown'] = {
                location: { 
                  _id: 'unknown',
                  name: 'Other Locations', 
                  address: 'Unspecified location' 
                },
                orders: []
              }
            }
            ordersByLocation['unknown'].orders.push(order)
          }
        })
        
        setWorkOrdersByLocation(ordersByLocation)
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
      setLocationLoading(false)
      
      // Update stats
      setStats((prev) => [
        { ...prev[0], value: orderList.length },
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      setUsers([])
      setWorkOrders([])
      setOrderLoading(false)
    }
    setLoading(false)
  }
  useEffect(() => {
    // Get admin info from localStorage (set this on login)
    const adminData = localStorage.getItem("User")
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData))
      } catch (error) {
        console.error("Error parsing admin data:", error)
      }
    }

    fetchData()
  }, [])

  // Effect for updating the time dynamically
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentDateTime({
        date: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [])
  // Handler functions for work orders
  const handleViewOrder = (order) => {
    setCurrentOrder(order)
    setIsView(true)
    setIsEdit(false)
    setShowOrderModal(true)
  }

  const handleEditOrder = (order) => {
    setCurrentOrder(order)
    setIsView(false)
    setIsEdit(true)
    setShowOrderModal(true)
  }
    const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this work order? This action cannot be undone.")) {
      try {
        // Use the imported deleteWorkOrder service function instead of direct fetch
        await deleteWorkOrder(orderId);
        
        // Remove the order from the local state
        const updatedOrders = workOrders.filter(order => order._id !== orderId);
        setWorkOrders(updatedOrders);
        
        // Update the work orders by location
        const updatedWorkOrdersByLocation = {...workOrdersByLocation};
        
        Object.keys(updatedWorkOrdersByLocation).forEach(locationId => {
          updatedWorkOrdersByLocation[locationId].orders = 
            updatedWorkOrdersByLocation[locationId].orders.filter(order => order._id !== orderId);
        });
        
        setWorkOrdersByLocation(updatedWorkOrdersByLocation);
        
        // Update stats
        setStats(prev => [
          { ...prev[0], value: updatedOrders.length },
        ]);
        
        // Show success message
        alert("Work order deleted successfully");
      } catch (error) {
        console.error("Error deleting work order:", error);
        alert("Error deleting work order: " + (error.message || "Failed to delete work order"));
      }
    }
  }

  const handleAddWorkOrder = (location) => {
    // If a location is provided, pre-fill the order with that location's info
    setCurrentOrder(location ? {
      building: location.name,
      confinedSpaceNameOrId: '',
      locationDescription: '',
      
      dateOfSurvey: new Date().toISOString().split('T')[0],
      permitRequired: false,
      // Add other default fields as needed
    } : null)
    setIsView(false)
    setIsEdit(false)
    setShowOrderModal(true)
  }

  const handleOrderModalClose = () => {
    setShowOrderModal(false)
    setCurrentOrder(null)
  }

  const downloadSinglePDF = async (order) => {
    try {
      const doc = new jsPDF();
      
      // Add company header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("CONFINED SPACE ASSESSMENT", 105, 15, { align: "center" });
      
      // Add form header
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Form No: CS-" + order._id?.slice(-6) || 'N/A', 14, 25);
      doc.text("Date: " + order.dateOfSurvey?.slice(0, 10) || 'N/A', 14, 30);
      doc.text("Surveyors: " + order.surveyors?.join(", ") || 'N/A', 14, 35);

      // Add sections using autoTable - location information
      const locationInfo = [
        ['Space Name/ID:', order.confinedSpaceNameOrId || 'N/A'],
        ['Building:', order.building || 'N/A'],
        ['Location Description:', order.locationDescription || 'N/A']
      ];
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("1. LOCATION INFORMATION", 14, 50);
      
      let currentY = 55;
      
      autoTable(doc, {
        body: locationInfo,
        startY: currentY,
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 130 }
        },
        theme: 'grid',
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10;
        }
      });
      
      // Add images section if available
      if (order.pictures && order.pictures.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("CONFINED SPACE IMAGES", 14, currentY);
        currentY += 10;
        
        // Track the promises for image loading
        const imagePromises = [];
        const imgInfos = [];
        
        // Prepare image loading
        for (let i = 0; i < order.pictures.length && i < 3; i++) {
          const imgPath = order.pictures[i];
          const imageUrl = imgPath.startsWith('http') 
            ? imgPath 
            : `http://localhost:5002${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
          
          const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set canvas dimensions proportional to image
              let imgWidth = img.width;
              let imgHeight = img.height;
              const maxWidth = 170;
              const maxHeight = 120;
              
              // Resize image to fit within maximum dimensions while maintaining aspect ratio
              if (imgWidth > maxWidth || imgHeight > maxHeight) {
                const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                imgWidth *= ratio;
                imgHeight *= ratio;
              }
              
              canvas.width = imgWidth;
              canvas.height = imgHeight;
              
              // Draw image on canvas
              ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
              
              // Get image data as base64
              const dataUrl = canvas.toDataURL('image/jpeg');
              
              // Store image info for adding to PDF
              imgInfos.push({
                dataUrl,
                width: imgWidth,
                height: imgHeight
              });
              
              resolve();
            };
            
            img.onerror = (err) => {
              console.error(`Error loading image: ${imageUrl}`, err);
              resolve(); // Resolve anyway to continue with other images
            };
            
            img.src = imageUrl;
          });
          
          imagePromises.push(promise);
        }
        
        // Wait for all images to load
        await Promise.all(imagePromises);
        
        // Add images to PDF once loaded
        if (imgInfos.length > 0) {
          // Define dimensions
          const marginLeft = 14;
          const marginRight = 14;
          const pageWidth = doc.internal.pageSize.getWidth();
          const availableWidth = pageWidth - marginLeft - marginRight;
          const xPositions = [marginLeft, marginLeft + availableWidth / 2];
          
          let xPos = marginLeft;
          let yPos = currentY;
          const spaceBetweenImages = 10;
          
          // Add each image
          for (let i = 0; i < imgInfos.length; i++) {
            const imgInfo = imgInfos[i];
            
            // Check if we need to add a new row
            if (i > 0 && i % 2 === 0) {
              yPos += imgInfo.height + spaceBetweenImages;
              xPos = marginLeft;
            } else if (i > 0) {
              xPos = marginLeft + availableWidth / 2;
            }
            
            // Check if we need a new page
            if (yPos + imgInfo.height > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPos = 20;
              xPos = marginLeft;
            }
            
            try {
              doc.addImage(imgInfo.dataUrl, 'JPEG', xPos, yPos, imgInfo.width, imgInfo.height);
            } catch (imgError) {
              console.error('Error adding image to PDF:', imgError);
            }
          }
          
          // Update Y position for next content
          currentY = yPos + Math.max(...imgInfos.slice(-Math.min(imgInfos.length, 2)).map(img => img.height)) + spaceBetweenImages;
        } else {
          doc.setFontSize(10);
          doc.setFont(undefined, 'italic');
          doc.text("No images available", marginLeft, currentY + 10);
          currentY += 20;
        }
      }
      
      // Add more sections with hazard data, classifications etc.
      
      // Save the PDF
      doc.save(`confined-space-assessment-${order.confinedSpaceNameOrId || 'report'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
    const handleOrderSubmit = async (formData) => {
    try {
      // Use the imported service functions
      if (isEdit) {
        await updateWorkOrder(currentOrder._id, formData);
      } else {
        await createWorkOrder(formData);
      }
      
      // Show success message
      alert(`Work order ${isEdit ? 'updated' : 'added'} successfully`);
      
      // Refresh data to update the UI
      await fetchData();
      
      // Close the modal
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error saving work order:", error);
      alert("Error saving work order: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {admin.firstname} {admin.lastname}!
              </h1>              <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex items-center space-x-2">
                  <CalendarIcon />
                  <span className="text-sm">{currentDateTime.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon />
                  <span className="text-sm">{currentDateTime.time}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-slate-900 font-bold text-xl">
                  {admin.firstname?.[0] || "A"}
                  {admin.lastname?.[0] || ""}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-300 font-medium">Role</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-slate-900">
                  {admin.userType === "admin" ? "Administrator" : "User"}
                </span>
              </div>            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              name={stat.name}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
          <StatCard
            name="Total Locations"
            value={locations.length}
            icon={<LocationIcon className="text-white w-6 h-6" />}
            trend="With work orders"
          />
        </div>        {/* Work Orders by Location Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <WorkOrderIcon className="h-5 w-5" />
                <span>Work Orders by Location</span>
              </h2>
              <div className="flex items-center space-x-3">
                <a href="/admin/workorders" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-white px-3 py-2 rounded-md border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow transition-all">
                  View All Orders
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8">
            <WorkOrderLocationGrid 
              workOrdersByLocation={workOrdersByLocation} 
              loading={orderLoading || locationLoading}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder} 
              onAddOrder={handleAddWorkOrder}
              onDeleteOrder={handleDeleteOrder}
              downloadSinglePDF={downloadSinglePDF}
            />
          </div>
        </div>
          {/* Work Order Modal would be imported from your components */}
        {showOrderModal && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h3 className="text-xl font-bold">
                  {isView ? "View Work Order" : isEdit ? "Edit Work Order" : "Add Work Order"}
                </h3>
                <button 
                  onClick={handleOrderModalClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* This is where you would place your actual WorkOrderModal component */}
              <div className="mt-4 text-center text-gray-600">                {isView ? (
                  <div className="text-left">
                    <p className="mb-3"><strong>Name/ID:</strong> {currentOrder?.confinedSpaceNameOrId}</p>
                    <p className="mb-3"><strong>Date:</strong> {currentOrder?.dateOfSurvey?.slice(0, 10)}</p>
                    <p className="mb-3"><strong>Location:</strong> {currentOrder?.building}</p>
                    <p className="mb-3"><strong>Permit Required:</strong> {currentOrder?.permitRequired ? "Yes" : "No"}</p>
                    <p className="mb-3"><strong>Description:</strong> {currentOrder?.locationDescription || "N/A"}</p>
                    <p className="mb-3"><strong>Created By:</strong> {currentOrder?.surveyors?.join(", ") || currentOrder?.createdBy || "N/A"}</p>
                    {/* Add more fields as needed */}
                    
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={handleOrderModalClose} 
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>Import your WorkOrderModal form component here for creating/editing work orders.</p>
                )}
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  )
}