import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    ClipboardDocumentListIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({ firstname: "", lastname: "" });
    const { user: authUser, isAuthenticated, logout: authLogout, isAdmin, isLoading } = useAuth();

    useEffect(() => {
        // Wait for loading to finish before checking privileges
        if (isLoading) return;

        if (authUser) {
            if (!isAdmin) {
                navigate('/user/dashboard', { replace: true });
                return;
            }
            setUser(authUser);
        } else {
            const userData = localStorage.getItem("User") || sessionStorage.getItem("User");
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    if (!(parsedUser.isAdmin || parsedUser.userType === 'admin')) {
                        navigate('/user/dashboard', { replace: true });
                        return;
                    }
                    setUser(parsedUser);
                } catch (error) {
                    console.error("Error parsing user data:", error);
                    navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        }
    }, [authUser, isAdmin, isLoading, navigate]);

    // Show loading spinner while loading
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900"></div>
            </div>
        );
    }

    const stats = {
        totalWorkOrders: 150,
        totalTechnician: 20,
    };

    const navigation = [
        { name: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
        { name: 'User Management', to: '/admin/users', icon: UsersIcon },
        { name: 'Confine Space Work Orders', to: '/admin/workorders', icon: ClipboardDocumentListIcon },
        { name: 'Location Management', to: '/admin/locations', icon: MapPinIcon },
    ];
    
    const handleLogout = () => {
        // Use the logout function from AuthContext
        authLogout();
    };

    const SidebarNavLink = ({ item }) => (
        <NavLink
            to={item.to}
            className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                        ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
            }
        >
            <item.icon className="h-5 w-5" />
            {item.name}
        </NavLink>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white border-r shadow-xl">
                <div className="h-16 flex items-center justify-center border-b border-gray-200">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                    {navigation.map((item) => (
                        <SidebarNavLink key={item.name} item={item} />
                    ))}
                </nav>
                <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                                {user.firstname?.[0] || ""}{user.lastname?.[0] || ""}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 shadow-sm"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Navbar */}
            <header className="lg:hidden fixed top-0 w-full bg-white shadow-lg z-50 flex justify-between items-center px-4 py-3">
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
                <button onClick={() => setSidebarOpen(true)}>
                    <Bars3Icon className="h-6 w-6 text-gray-700" />
                </button>
            </header>
            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex pointer-events-none">
                    <div
                        className="relative z-50 w-72 bg-white shadow-xl flex flex-col h-full pointer-events-auto"
                        style={{ transition: 'transform 0.3s', transform: 'translateX(0)' }}
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">Menu</h2>
                                <button onClick={() => setSidebarOpen(false)}>
                                    <XMarkIcon className="h-5 w-5 text-gray-700" />
                                </button>
                            </div>
                        </div>
                        <nav className="flex-1 p-6 space-y-2">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold shadow-lg'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">
                                        {user.firstname?.[0] || ""}{user.lastname?.[0] || ""}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 shadow-sm"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">                <div className="p-6 mt-16 lg:mt-0">
                    {location.pathname === '/admin' || location.pathname === '/admin/' ? (
                        <div className="space-y-8">
                            {/* Welcome Card */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold">
                                            Welcome back, {user?.firstname || ""} {user?.lastname || ""}!
                                        </h2>
                                        <p className="text-sm mt-1 text-gray-300">
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-300">Role</p>
                                            <p className="text-lg font-semibold">Administrator</p>
                                        </div>
                                        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                                            <span className="text-gray-900 font-bold">
                                                {user?.firstname?.[0] || ""}{user?.lastname?.[0] || ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <p className="text-gray-600 text-sm font-medium">Total Work Orders</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorkOrders}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <p className="text-gray-600 text-sm font-medium">Total Technicians</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTechnician}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
