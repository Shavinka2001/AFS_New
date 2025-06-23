import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkOrderModal from '../../components/admin/confined/WorkOrderModel';
import WorkOrderTable from '../../components/admin/confined/WorkOrderTable';
import { createWorkOrder, updateWorkOrder, getWorkOrders, deleteWorkOrder, getWorkOrdersByUserId } from '../../services/workOrderService';
import { getAssignedLocations, detachTechnicianFromLocation } from '../../services/locationService';
import { toast } from 'react-toastify';
import ProfileHeader from '../../components/user/ProfileHeader';
import PersonalInformation from '../../components/user/PersonalInformation';
import UserForm from '../../components/user/UserForm';
import LocationMapView from '../../components/user/LocationMapView';
import { updateProfile } from '../../services/userService';

// Confirm Modal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
      return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex space-x-4 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// Clock component to display current time
const Clock = () => {
    const [time, setTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        
        return () => {
            clearInterval(timer);
        };
    }, []);
    
    return (
        <div className="font-semibold text-gray-900">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
    );
};

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
    const [assignedLocations, setAssignedLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    // Toggle mobile menu
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
      useEffect(() => {
        // Close mobile menu when changing tabs
        setMobileMenuOpen(false);
        
        const userData = localStorage.getItem("User") || sessionStorage.getItem("User");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                
                // Check if user is admin - redirect to admin dashboard
                if (parsedUser.isAdmin || parsedUser.userType === 'admin') {
                    toast.info('Admin users should use the admin dashboard');
                    navigate('/admin/dashboard');
                    return;
                }
                
                setUser(parsedUser);
                if (parsedUser.profileImage) {
                    setPreviewImage(parsedUser.profileImage);
                }
                // Fetch the user's assigned locations when the component mounts
                fetchAssignedLocations();
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate('/login');
            }
        } else {
            // If no user data, redirect to login
            navigate('/login');
        }
        
        // Verify auth status when component mounts
        import('../../services/userService').then(({ verifyAuth }) => {
            verifyAuth().catch(() => {
                navigate('/login');
            });
        });
    }, [navigate]);

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

    // New function to fetch assigned locations
    const fetchAssignedLocations = async () => {
        try {
            setLoadingLocations(true);
            const response = await getAssignedLocations();
            console.log('Assigned locations response:', response);
            if (response && response.data) {
                setAssignedLocations(response.data);
            } else if (response && response.locations) {
                setAssignedLocations(response.locations);
            } else {
                setAssignedLocations([]);
            }
        } catch (error) {
            console.error('Error fetching assigned locations:', error);
            toast.error('Failed to load your assigned locations');
            setAssignedLocations([]);
        } finally {
            setLoadingLocations(false);
        }    };    // State to track which location is being closed and confirm modal state
    const [closingLocationId, setClosingLocationId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        locationId: null
    });
    
    // Handle closing work (detaching technician from location)
    const handleCloseWork = (locationId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Close Work',
            message: 'Are you sure you want to close this work? This will remove your assignment from this location.',
            locationId
        });
    };
    
    // Handle confirm close work
    const handleConfirmCloseWork = async () => {
        const locationId = confirmModal.locationId;
        
        try {
            // Set the specific location as loading
            setClosingLocationId(locationId);
            // Close the modal
            setConfirmModal({ isOpen: false, title: '', message: '', locationId: null });
            
            await detachTechnicianFromLocation(locationId);
            toast.success("Work closed successfully. You have been unassigned from this location.");
            
            // Refresh assigned locations to reflect the change
            await fetchAssignedLocations();
        } catch (error) {
            console.error("Error closing work:", error);
            toast.error(error.message || "Failed to close work. Please try again.");
        } finally {
            // Clear the loading state
            setClosingLocationId(null);
        }
    };
    
    // Handle cancel close work
    const handleCancelCloseWork = () => {
        setConfirmModal({ isOpen: false, title: '', message: '', locationId: null });
    };

    const handleLogout = () => {
        // Use the centralized logout function from userService
        import('../../services/userService').then(({ logout }) => {
            logout(navigate);
        });
    };

    const handleEditWorkOrder = (order) => {
        setSelectedWorkOrder(order);
        setShowWorkOrderModal(true);
    };    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        orderId: null
    });
    
    // Handle initiating work order deletion
    const handleDeleteWorkOrder = (orderId) => {
        setDeleteConfirmModal({
            isOpen: true,
            title: 'Delete Work Order',
            message: 'Are you sure you want to delete this work order? This action cannot be undone.',
            orderId
        });
    };
    
    // Handle confirmed work order deletion
    const handleConfirmDeleteWorkOrder = async () => {
        const orderId = deleteConfirmModal.orderId;
        
        try {
            // Set the order as being deleted
            setDeletingOrderId(orderId);
            // Close the modal
            setDeleteConfirmModal({ isOpen: false, title: '', message: '', orderId: null });
            
            const response = await deleteWorkOrder(orderId);
            if (response) {
                toast.success('Work order deleted successfully');
                await fetchWorkOrders();
            }
        } catch (error) {
            console.error('Error deleting work order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete work order';
            toast.error(errorMessage);
        } finally {
            setDeletingOrderId(null);
        }
    };
    
    // Handle cancel delete work order
    const handleCancelDeleteWorkOrder = () => {
        setDeleteConfirmModal({ isOpen: false, title: '', message: '', orderId: null });
    };// State to prevent duplicate form submissions
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleWorkOrderSubmit = async (formData) => {
        // Check if already submitting
        if (isSubmitting) {
            toast.info("Your request is being processed, please wait...");
            return;
        }

        try {
            setIsSubmitting(true); // Prevent multiple submissions
            
            const user = JSON.parse(localStorage.getItem("User"));
            if (!user || !user.id) {
                toast.error('User information not found');
                setIsSubmitting(false);
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
                // Add a retry mechanism for 429 errors
                let retries = 0;
                const maxRetries = 3;
                const retryDelay = 1000; // 1 second delay between retries
                
                while (retries < maxRetries) {
                    try {
                        response = await createWorkOrder(formattedData);
                        if (response) {
                            toast.success('Work order created successfully');
                            setShowWorkOrderModal(false);
                            setSelectedWorkOrder(null);
                            await fetchWorkOrders();
                            break; // Success, exit the retry loop
                        }
                    } catch (retryError) {
                        if (retryError.response && retryError.response.status === 429 && retries < maxRetries - 1) {
                            // If we get a 429 error and have retries left, wait and try again
                            retries++;
                            toast.info(`Request rate limited. Retrying in ${retryDelay/1000} seconds... (${retries}/${maxRetries})`);
                            await new Promise(resolve => setTimeout(resolve, retryDelay));
                        } else {
                            // If it's not a 429 error or we're out of retries, throw the error to be caught by the outer catch
                            throw retryError;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error saving work order:', error);
            let errorMessage = error.message || 'Failed to save work order';
            
            // Better error handling for specific error codes
            if (error.response) {
                switch (error.response.status) {
                    case 429:
                        errorMessage = 'Too many requests. Please wait a moment and try again.';
                        break;
                    case 400:
                        errorMessage = error.response.data?.message || 'Invalid data. Please check your form.';
                        break;
                    case 401:
                        errorMessage = 'Your session has expired. Please login again.';
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to create work orders.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = error.response.data?.message || errorMessage;
                }
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false); // Reset submission state
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
    };    const navItems = [
        { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            description: 'Your workspace overview and assigned locations'
        },
        { 
            id: 'profile', 
            label: 'Profile', 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            description: 'Manage your personal information' 
        },
        { 
            id: 'tasks', 
            label: 'Tasks', 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            description: 'Manage your confined space work orders'
        },
    ];    return (
        <div className="min-h-screen bg-gray-50 flex">            {/* Mobile Menu Button - Visible on all screens except large desktops */}
            <button 
                className="fixed top-4 left-4 p-2 rounded-lg bg-gray-900 text-white shadow-lg xl:hidden z-50"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                )}
            </button>{/* Sidebar - Fixed position with modern styling - Only visible on large screens or when menu is opened */}
            <div className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl border-r border-gray-100 z-40 overflow-y-auto transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}>
                {/* Sidebar header with gradient background */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 lg:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30 flex-shrink-0">
                            <span className="text-white font-bold text-lg sm:text-xl">
                                {user.firstname?.[0] || "T"}
                                {user.lastname?.[0] || ""}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-white truncate">
                                {user.firstname} {user.lastname}
                            </p>
                            <div className="mt-1 flex items-center">
                                <span className="inline-flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                                <p className="text-xs font-medium text-gray-200">Technician</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Navigation section with hover effects */}                <div className="p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mx-2 mb-2">Main Menu</p>
                    <nav className="space-y-1">{navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    // Close mobile menu when a nav item is clicked
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                    activeTab === item.id
                                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className={`flex items-center ${activeTab === item.id ? 'text-white' : ''}`}>
                                    <div className={`mr-3 p-1.5 rounded-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-gray-200'}`}>
                                        <svg className={`h-5 w-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} 
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium">{item.label}</span>
                                        <p className={`text-xs mt-0.5 transition-colors ${activeTab === item.id ? 'text-gray-200' : 'text-gray-500'}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                                {activeTab === item.id && (
                                    <div className="absolute right-2">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}                            </button>
                        ))}
                    </nav>
                </div>                {/* Logout button at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3 sm:py-3.5 text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:from-gray-700 hover:to-gray-600 rounded-xl transition-all duration-200 shadow-md"
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>            </div>              {/* Overlay to close mobile menu when clicking outside */}            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 xl:hidden"
                    onClick={toggleMobileMenu}
                ></div>
            )}{/* Main Content - Responsive margin-left */}
            <div className="flex-1 ml-0 xl:ml-72 transition-all duration-300">
                {/* Modern Header with responsive styling */}                
                <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-2">
                        <div className="ml-12 pl-2 lg:ml-12 lg:pl-0 flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 truncate">
                                Technician Dashboard
                            </h1>
                        </div>
                        
                        <div className="flex flex-col items-end">
                            <div className="text-right">
                                <Clock />
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 text-right">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Content Area with responsive padding */}
                <main className="p-4 sm:p-6 lg:p-8 bg-gray-50">
                  {activeTab === 'dashboard' && (
                        <div className="space-y-6">                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Assigned Locations</h2>
                            </div>

                            {loadingLocations ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : assignedLocations.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                                    <svg className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className="mt-4 text-gray-700 text-sm sm:text-base">No locations have been assigned to you yet. Please contact an administrator to get access to locations.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {assignedLocations.map((location) => (
                                        <div key={location._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                            <div className="p-4 sm:p-6">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center justify-between flex-wrap gap-2">
                                                    <span className="truncate">{location.name}</span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        location.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {location.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </h3>
                                                
                                                {/* Map View */}
                                                <div className="mt-4">
                                                    <LocationMapView location={location} height="200px" />
                                                </div>
                                                
                                                <div className="mt-4 space-y-3">
                                                    <div className="flex items-center text-gray-700">
                                                        <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                        <span className="text-sm">{location.address || 'No address provided'}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center text-gray-700">
                                                        <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-sm">
                                                            {location.latitude 
                                                                ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
                                                                : 'No coordinates available'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {location.description && (
                                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                        <h4 className="text-sm font-medium text-gray-900">Description:</h4>
                                                        <p className="text-sm text-gray-700 mt-1">{location.description}</p>
                                                    </div>
                                                )}                                                  <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedWorkOrder(null);
                                                            setShowWorkOrderModal(true);
                                                        }}
                                                        className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                                                    >
                                                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span>Create Work Order</span>
                                                    </button>
                                                      <button
                                                        onClick={() => handleCloseWork(location._id)}
                                                        disabled={closingLocationId === location._id}
                                                        className={`w-full px-3 sm:px-4 py-2 border border-red-600 text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm sm:text-base ${
                                                            closingLocationId === location._id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        {closingLocationId === location._id ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                                                <span>Closing...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                <span>Close Work</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Confine Space Work Orders</h2>
                                <button
                                    onClick={() => {
                                        setSelectedWorkOrder(null);
                                        setShowWorkOrderModal(true);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2 shadow-lg"
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
                        <div className="space-y-4 sm:space-y-6">
                            <ProfileHeader 
                                user={user} 
                                onProfileUpdate={() => setShowUpdateForm(true)} 
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                    <PersonalInformation user={user} />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>            {/* Work Order Modal */}
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
                    assignedLocationData={assignedLocations.length === 1 ? assignedLocations[0] : null}
                />
            )}            {/* Update Profile Form */}
            {showUpdateForm && (
                <UserForm
                    user={user}
                    onSubmit={handleProfileUpdate}
                    onClose={() => setShowUpdateForm(false)}
                />
            )}
              {/* Work Close Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleConfirmCloseWork}
                onCancel={handleCancelCloseWork}
            />
            
            {/* Work Order Delete Confirm Modal */}
            <ConfirmModal
                isOpen={deleteConfirmModal.isOpen}
                title={deleteConfirmModal.title}
                message={deleteConfirmModal.message}
                onConfirm={handleConfirmDeleteWorkOrder}
                onCancel={handleCancelDeleteWorkOrder}
            />
        </div>
    );
}

export default TechnicianDashboard;