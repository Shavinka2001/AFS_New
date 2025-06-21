"use client"

import { useEffect, useState } from "react"

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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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

// Main Dashboard Component
export default function Dashboard() {
  const [stats, setStats] = useState([
    {
      name: "Total Users",
      value: 0,
      icon: <UsersIcon className="text-white w-6 h-6" />,
      trend: "+12% from last month",
    },
    {
      name: "Confined Orders",
      value: 0,
      icon: <ClipboardIcon className="text-white w-6 h-6" />,
      trend: "+8% from last month",
    },
  ])

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState({
    firstname: "Admin",
    lastname: "",
    userType: "admin",
  })

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

    const fetchData = async () => {
      setLoading(true)
      const token = localStorage.getItem("token")
      try {
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
        setStats((prev) => [
          { ...prev[0], value: Array.isArray(data) ? data.length : 0 },
          { ...prev[1], value: 0 }, // Set confined orders value here if you have it
        ])
      } catch (error) {
        console.error("Error fetching data:", error)
        setUsers([])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {admin.firstname} {admin.lastname}!
              </h1>
              <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex items-center space-x-2">
                  <CalendarIcon />
                  <span className="text-sm">{currentDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon />
                  <span className="text-sm">{currentTime}</span>
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
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.name} {...stat} />
          ))}

          {/* Additional stat cards */}
          <StatCard
            name="Active Sessions"
            value={24}
            icon={<UsersIcon className="text-white w-6 h-6" />}
            trend="+5% from yesterday"
          />
          <StatCard
            name="System Health"
            value={99}
            icon={<ClipboardIcon className="text-white w-6 h-6" />}
            trend="All systems operational"
          />
        </div>

        {/* User Management Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <UsersIcon className="h-5 w-5" />
              <span>User Management</span>
            </h2>
          </div>
          <div className="p-6">
            <UserTable users={users} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}