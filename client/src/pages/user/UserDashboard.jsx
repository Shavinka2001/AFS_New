import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkOrderModal from '../../components/admin/confined/WorkOrderModel';
import WorkOrderTable from '../../components/admin/confined/WorkOrderTable';
import { createWorkOrder, updateWorkOrder, getWorkOrders, deleteWorkOrder, getWorkOrdersByUserId } from '../../services/workOrderService';
import { toast } from 'react-toastify';
import ProfileHeader from '../../components/user/ProfileHeader';
import PersonalInformation from '../../components/user/PersonalInformation';
import UserForm from '../../components/user/UserForm';
import { updateProfile } from '../../services/userService';

function TechnicianDashboard() {
    const [user, setUser] = useState({ firstname: "", lastname: "", profileImage: "" });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("User") || sessionStorage.getItem("User");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                if (parsedUser.profileImage) {
                    setPreviewImage(parsedUser.profileImage);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // Fetch work orders when tasks tab is active
    useEffect(() => {
        if (activeTab === 'tasks') {
            fetchWorkOrders();
        }
    }, [activeTab]);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("User"));
            console.log('Fetching work orders for user:', user); // Debug log
            
            const response = await getWorkOrdersByUserId(user.id);
            console.log('Work orders API response:', response); // Debug log
            
            if (response && (Array.isArray(response) || Array.isArray(response.data))) {
                const orders = Array.isArray(response) ? response : response.data;
                console.log('Setting work orders:', orders); // Debug log
                setWorkOrders(orders);
            } else {
                console.warn('Unexpected response format:', response);
                setWorkOrders([]);
                toast.warning('No work orders available');
            }
        } catch (error) {
            console.error('Error fetching work orders:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch work orders';
            toast.error(errorMessage);
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('User');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('User');
        navigate('/login');
    };

    const handleEditWorkOrder = (order) => {
        setSelectedWorkOrder(order);
        setShowWorkOrderModal(true);
    };

    const handleDeleteWorkOrder = async (orderId) => {
        try {
            const response = await deleteWorkOrder(orderId);
            if (response) {
                toast.success('Work order deleted successfully');
                await fetchWorkOrders();
            }
        } catch (error) {
            console.error('Error deleting work order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete work order';
            toast.error(errorMessage);
        }
    };

    const handleWorkOrderSubmit = async (formData) => {

        try {
            const user = JSON.parse(localStorage.getItem("User"));
            if (!user || !user.id) {
                toast.error('User information not found');
                return;
            }

            const formattedData = {
                userId: user.id,
                dateOfSurvey: formData.dateOfSurvey ? new Date(formData.dateOfSurvey).toISOString() : new Date().toISOString(),
                surveyors: formData.surveyors ? (
                    Array.isArray(formData.surveyors) 
                        ? formData.surveyors 
                        : formData.surveyors.split(',').map(s => s.trim())
                ) : [],
                confinedSpaceNameOrId: formData.confinedSpaceNameOrId || '',
                building: formData.building || '',
                locationDescription: formData.locationDescription || '',
                confinedSpaceDescription: formData.confinedSpaceDescription || '',
                confinedSpace: Boolean(formData.confinedSpace),
                permitRequired: Boolean(formData.permitRequired),
                entryRequirements: formData.entryRequirements || '',
                atmosphericHazard: Boolean(formData.atmosphericHazard),
                atmosphericHazardDescription: formData.atmosphericHazardDescription || '',
                engulfmentHazard: Boolean(formData.engulfmentHazard),
                engulfmentHazardDescription: formData.engulfmentHazardDescription || '',
                configurationHazard: Boolean(formData.configurationHazard),
                configurationHazardDescription: formData.configurationHazardDescription || '',
                otherRecognizedHazards: Boolean(formData.otherRecognizedHazards),
                otherHazardsDescription: formData.otherHazardsDescription || '',
                ppeRequired: Boolean(formData.ppeRequired),
                ppeList: formData.ppeList || '',
                forcedAirVentilationSufficient: Boolean(formData.forcedAirVentilationSufficient),
                dedicatedContinuousAirMonitor: Boolean(formData.dedicatedContinuousAirMonitor),
                warningSignPosted: Boolean(formData.warningSignPosted),
                otherPeopleWorkingNearSpace: Boolean(formData.otherPeopleWorkingNearSpace),
                canOthersSeeIntoSpace: Boolean(formData.canOthersSeeIntoSpace),
                contractorsEnterSpace: Boolean(formData.contractorsEnterSpace),
                numberOfEntryPoints: formData.numberOfEntryPoints ? Number(formData.numberOfEntryPoints) : 0,
                notes: formData.notes || '',
                images: Array.isArray(formData.images) ? formData.images : []
            };

            let response;
            if (selectedWorkOrder) {
                response = await updateWorkOrder(selectedWorkOrder._id, formattedData);
                if (response) {
                    toast.success('Work order updated successfully');
                    setShowWorkOrderModal(false);
                    setSelectedWorkOrder(null);
                    await fetchWorkOrders();
                }
            } else {
                response = await createWorkOrder(formattedData);
                if (response) {
                    toast.success('Work order created successfully');
                    setShowWorkOrderModal(false);
                    setSelectedWorkOrder(null);
                    await fetchWorkOrders();
                }
            }
        } catch (error) {
            console.error('Error saving work order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save work order';
            toast.error(errorMessage);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (formData) => {
        try {
            setLoading(true);
            const response = await updateProfile(formData);
            if (response) {
                // Update local storage with new user data
                const userData = JSON.parse(localStorage.getItem("User") || sessionStorage.getItem("User"));
                const updatedUser = { ...userData, ...response };
                localStorage.setItem("User", JSON.stringify(updatedUser));
                sessionStorage.setItem("User", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setShowUpdateForm(false);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-xl border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                                {user.firstname?.[0] || "T"}
                                {user.lastname?.[0] || ""}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {user.firstname} {user.lastname}
                            </p>
                            <p className="text-xs text-gray-700">Technician</p>
                        </div>
                    </div>
                </div>
                <nav className="mt-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                                activeTab === item.id
                                    ? 'bg-gray-50 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Technician Dashboard</h1>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-6">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Stats Cards */}
                            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Maintenance Check</p>
                                            <p className="text-xs text-gray-700">9:00 AM - 11:00 AM</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium text-gray-900 bg-gray-100 rounded-full">In Progress</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">System Update</p>
                                            <p className="text-xs text-gray-700">1:00 PM - 3:00 PM</p>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-medium text-gray-900 bg-gray-100 rounded-full">Upcoming</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">Confine Space Work Orders</h2>
                                <button
                                    onClick={() => {
                                        setSelectedWorkOrder(null);
                                        setShowWorkOrderModal(true);
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>New Confine Space Work Order</span>
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : workOrders.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                    <p className="text-gray-700">No confine space work orders found. Create a new confine space work order to get started.</p>
                                </div>
                            ) : (
                                <WorkOrderTable
                                    orders={workOrders}
                                    onEdit={handleEditWorkOrder}
                                    onDelete={handleDeleteWorkOrder}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <ProfileHeader 
                                user={user} 
                                onProfileUpdate={() => setShowUpdateForm(true)} 
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <PersonalInformation user={user} />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Work Order Modal */}
            {showWorkOrderModal && (
                <WorkOrderModal
                    show={showWorkOrderModal}
                    onClose={() => {
                        setShowWorkOrderModal(false);
                        setSelectedWorkOrder(null);
                    }}
                    onSubmit={handleWorkOrderSubmit}
                    order={selectedWorkOrder}
                    isEdit={!!selectedWorkOrder}
                />
            )}

            {/* Update Profile Form */}
            {showUpdateForm && (
                <UserForm
                    user={user}
                    onSubmit={handleProfileUpdate}
                    onClose={() => setShowUpdateForm(false)}
                />
            )}
        </div>
    );
}

export default TechnicianDashboard; 