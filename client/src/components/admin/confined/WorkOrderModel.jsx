import React, { useState, useEffect, useRef } from "react";
import { createWorkOrder, updateWorkOrder } from "../../../services/workOrderService";
import { toast } from "react-toastify";

const boolOptions = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" }
];

const WorkOrderModal = ({ show, onClose, onSubmit, order, onChange, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfSurvey: "",
    surveyors: [],
    confinedSpaceNameOrId: "",
    building: "",
    locationDescription: "",
    confinedSpaceDescription: "",
    confinedSpace: false,
    permitRequired: false,
    entryRequirements: "",
    atmosphericHazard: false,
    atmosphericHazardDescription: "",
    engulfmentHazard: false,
    engulfmentHazardDescription: "",
    configurationHazard: false,
    configurationHazardDescription: "",
    otherRecognizedHazards: false,
    otherHazardsDescription: "",
    ppeRequired: false,
    ppeList: "",
    forcedAirVentilationSufficient: false,
    dedicatedContinuousAirMonitor: false,
    warningSignPosted: false,
    otherPeopleWorkingNearSpace: false,
    canOthersSeeIntoSpace: false,
    contractorsEnterSpace: false,
    numberOfEntryPoints: "",    notes: "",
    pictures: []
  });  // State for user's assigned locations
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableBuildings, setAvailableBuildings] = useState([]);

  const [previewImages, setPreviewImages] = useState([]); // For new uploads (base64 preview)
  const [existingImages, setExistingImages] = useState([]); // For previously uploaded images (URLs/paths)
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Fetch assigned locations only once on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}');
    // Fetch full location details from the API
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/locations/assigned/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error("Failed to fetch assigned locations");
        const data = await response.json();
        let locationData = [];
        if (data.success && data.locations) {
          locationData = data.locations;
        } else if (data.data) {
          locationData = data.data;
        }
        setAssignedLocations(locationData);
        // If there's exactly one location, automatically set it in the form
        if (locationData.length === 1) {
          const location = locationData[0];
          setSelectedLocation(location);
          setAvailableBuildings(location.buildings || []);
          setFormData(prevData => ({
            ...prevData,
            confinedSpaceNameOrId: location.name || location,
            locationDescription: location.description || prevData.locationDescription
          }));
        }
      } catch (error) {
        console.error("Error fetching assigned locations:", error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();
    // eslint-disable-next-line
  }, []);

  // Update form state when order or assignedLocations changes
  useEffect(() => {
    if (order) {
      const user = JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}');
      const technicianName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
      // Ensure all boolean fields are properly initialized
      const booleanFields = [
        'confinedSpace',
        'permitRequired',
        'atmosphericHazard',
        'engulfmentHazard',
        'configurationHazard',
        'otherRecognizedHazards',
        'ppeRequired',
        'forcedAirVentilationSufficient',
        'dedicatedContinuousAirMonitor',
        'warningSignPosted',
        'otherPeopleWorkingNearSpace',
        'canOthersSeeIntoSpace',
        'contractorsEnterSpace'
      ];
      const processedOrder = {
        ...order,
        dateOfSurvey: order.dateOfSurvey?.slice(0, 10) || "",
        surveyors: Array.isArray(order.surveyors) ? order.surveyors : [],
        technician: technicianName,
        images: order.images || []
      };
      booleanFields.forEach(field => {
        processedOrder[field] = Boolean(processedOrder[field]);
      });
      setFormData(processedOrder);
      setPreviewImages(order.images || []);
      // Load existing images (from pictures or images field)
      const imgs = (order.pictures && Array.isArray(order.pictures) ? order.pictures : [])
        .concat(order.images && Array.isArray(order.images) ? order.images : [])
        .filter(Boolean)
        // Map to full URL if needed
        .map(img =>
          typeof img === "string" && img.startsWith("/uploads/")
            ? `${import.meta.env.VITE_FILE_SERVER_URL || "http://localhost:5002"}${img}`
            : img
        );
      setExistingImages(imgs);
      setPreviewImages([]); // Reset new uploads
      // If editing and we have assigned locations, find the location that matches the work order
      if (assignedLocations.length > 0 && order.confinedSpaceNameOrId) {
        const orderLocation = assignedLocations.find(loc => loc.name === order.confinedSpaceNameOrId);
        if (orderLocation) {
          setSelectedLocation(orderLocation);
          setAvailableBuildings(orderLocation.buildings || []);
        }
      }
    }
    // eslint-disable-next-line
  }, [order, assignedLocations]);
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "select-one" && (name.includes("Hazard") || name.includes("Required") || 
        name.includes("Sufficient") || name.includes("Posted") || name.includes("Space"))) {
      setFormData(prev => ({
        ...prev,
        [name]: value === "true"
      }));
    } else if (name === "surveyors" && !e.target.readOnly) {
      // Handle multi-select for surveyors
      const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
      setFormData(prev => ({
        ...prev,
        surveyors: selectedOptions
      }));    } else if (name === "confinedSpaceNameOrId") {
      // When a location is selected from the dropdown
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // If we have location data and a value was selected, populate related fields
      if (value && assignedLocations.length > 0) {
        const selectedLocationData = assignedLocations.find(loc => loc.name === value);
        if (selectedLocationData) {
          setSelectedLocation(selectedLocationData);
          setAvailableBuildings(selectedLocationData.buildings || []);
          // Populate additional fields from the selected location
          setFormData(prev => ({
            ...prev,
            building: '', // Reset building selection when location changes
            locationDescription: selectedLocationData.description || prev.locationDescription
          }));
        }
      }
    }else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };  // Image upload handler (for new images)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Only allow up to 3 total images (existing + new)
    if (existingImages.length + previewImages.length + files.length > 3) {
      toast.warning(`You can only upload up to 3 images. Currently ${existingImages.length + previewImages.length} image(s) are selected.`);
      return;
    }
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size > maxFileSize) {
          toast.error(`File ${file.name} exceeds the 5MB size limit`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, { file, preview: reader.result }]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload only image files (PNG, JPG or JPEG)');
      }
    });
  };

  const removeImage = (type, index) => {
    if (type === "existing") {
      setExistingImages(prev => {
        const updated = prev.filter((_, i) => i !== index);
        // Also update formData.pictures to match
        setFormData(f => ({
          ...f,
          pictures: [
            ...updated,
            ...previewImages.map(img => img.file)
          ]
        }));
        return updated;
      });
    } else {
      setPreviewImages(prev => {
        const updated = prev.filter((_, i) => i !== index);
        // Also update formData.pictures to match
        setFormData(f => ({
          ...f,
          pictures: [
            ...existingImages,
            ...updated.map(img => img.file)
          ]
        }));
        return updated;
      });
    }
    toast.info('Image removed');
  };

  // Camera functions
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera access is not supported in this browser or context.');
      console.error('navigator.mediaDevices.getUserMedia is not available.');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // 'environment' for back camera (if available)
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      // Once camera is opened
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      // Check if we've reached the 3 image limit
      if (existingImages.length + previewImages.length >= 3) {
        toast.warning('Maximum of 3 images allowed. Please remove an image before adding another.');
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      // Convert base64 to blob for form submission
      fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPreviewImages(prev => [...prev, { file, preview: imageDataUrl }]);
        });
      
      // Close camera after capture
      stopCamera();
      
      toast.success('Image captured successfully!');
    }
  };
  // Start camera when the camera modal opens
  useEffect(() => {
    if (showCamera && !stream) {
      startCamera();
    }
  }, [showCamera]);

  // Clean up camera stream when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("User"));
      const userId = user?._id || user?.id;
      
      // If surveyors field is empty or not properly set, use the logged-in user's name
      const technicianName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
      
      // Prepare pictures array: files for new, URLs for existing
      const pictures = [
        ...existingImages, // URLs/paths
        ...previewImages.map(img => img.file) // Files
      ].slice(0, 3); // Ensure max 3 images
      const dataToSubmit = {
        ...formData,
        userId,
        surveyors: [technicianName],
        dateOfSurvey: formData.dateOfSurvey ? new Date(formData.dateOfSurvey).toISOString() : new Date().toISOString(),
        pictures
      };
      // Process the form submission - handle direct API calls here
      let result;
      if (isEdit && order?._id) {
        // Update existing order
        result = await updateWorkOrder(order._id, dataToSubmit);
        toast.success("Work order updated successfully!");
      } else {
        // Create new order
        result = await createWorkOrder(dataToSubmit);
        toast.success("Work order created successfully!");
      }
        if (onSubmit) {
        onSubmit(result);
      }

      onClose();
    } catch (error) {
      toast.error(error.message || "An error occurred while saving the work order");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit" : "Add"} Work Order
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-700 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto pr-4">
          {/* Image Upload Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            <div className="space-y-4">              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-700">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-700">
                          <span className="font-semibold">Take a photo</span>
                        </p>
                        <p className="text-xs text-gray-500">Use your camera</p>
                      </div>
                    </button>
                  </div>
                </div>                {/* Camera Modal */}
                {showCamera && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-4 max-w-xl w-full relative">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h3 className="text-lg font-semibold mb-4">Take a Photo</h3>
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          style={{ display: stream ? 'block' : 'none' }}
                        ></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        {!stream && (
                          <div className="flex items-center justify-center h-72 bg-gray-900">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          onClick={captureImage}
                          className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow hover:from-gray-800 hover:to-gray-700 transition-all"
                          disabled={!stream}
                        >
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <circle cx="12" cy="13" r="3" />
                            </svg>
                            Capture Photo
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Preview Grid */}              {(existingImages.length > 0 || previewImages.length > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Preview</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${(existingImages.length + previewImages.length) >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {existingImages.length + previewImages.length}/3 images
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative group">
                        <img
                          src={img}
                          alt={`Existing ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("existing", idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {previewImages.map((img, idx) => (
                      <div key={`preview-${idx}`} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("preview", idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Survey Date *</label>
                <input 
                  type="date" 
                  name="dateOfSurvey" 
                  value={formData.dateOfSurvey} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Technician *</label>
                <input 
                  type="text" 
                  name="surveyors" 
                  value={formData.technician || `${JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}').firstname} ${JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}').lastname}`} 
                  readOnly
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all cursor-not-allowed" 
                />
              </div>              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Space Name/ID *</label>
                {isLoadingLocations ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    <span className="text-sm text-gray-700">Loading locations...</span>
                  </div>
                ) : assignedLocations.length > 1 ? (
                  <select 
                    name="confinedSpaceNameOrId" 
                    value={formData.confinedSpaceNameOrId || ""} 
                    onChange={handleChange}
                    required 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a location...</option>
                    {assignedLocations.map((location, index) => (
                      <option key={location._id || index} value={location.name || location}>
                        {location.name || location}
                      </option>
                    ))}
                  </select>
                ) : assignedLocations.length === 1 ? (
                  <input 
                    type="text" 
                    name="confinedSpaceNameOrId" 
                    value={formData.confinedSpaceNameOrId || (assignedLocations[0]?.name || assignedLocations[0] || "")} 
                    readOnly
                    required 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all cursor-not-allowed"
                  />
                ) : (
                  <input 
                    type="text" 
                    name="confinedSpaceNameOrId" 
                    value={formData.confinedSpaceNameOrId || ""} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                  />
                )}
              </div>              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Building *</label>
                {assignedLocations.length > 0 && selectedLocation ? (
                  <>
                    {availableBuildings.length > 0 ? (
                      <select 
                        name="building" 
                        value={formData.building || ""} 
                        onChange={handleChange}
                        required 
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                      >
                        <option value="">Select a building...</option>
                        {availableBuildings
                          .filter(building => building.isActive)
                          .map((building, index) => (
                            <option key={building._id || index} value={building.name}>
                              {building.name}
                            </option>
                          ))
                        }
                      </select>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          name="building" 
                          value={formData.building || ""} 
                          onChange={handleChange}
                          placeholder="Enter building name manually" 
                          required 
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                        />
                        <p className="text-sm text-amber-600 mt-1">
                          No buildings configured for this location. Please enter the building name manually or contact your administrator.
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <input 
                    type="text" 
                    name="building" 
                    value={formData.building || ""} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                  />
                )}
              </div><div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Location Description</label>
                {assignedLocations.length > 0 ? (
                  <input 
                    type="text" 
                    name="locationDescription" 
                    value={formData.locationDescription || ""} 
                    readOnly
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all cursor-not-allowed" 
                  />
                ) : (
                  <input 
                    type="text" 
                    name="locationDescription" 
                    value={formData.locationDescription || ""} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Confined Space Description</label>
                <input 
                  type="text" 
                  name="confinedSpaceDescription" 
                  value={formData.confinedSpaceDescription || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Space Classification */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Is this a Confined Space? *</label>
                <select 
                  name="confinedSpace" 
                  value={formData.confinedSpace ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Permit Required? *</label>
                <select 
                  name="permitRequired" 
                  value={formData.permitRequired ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Entry Requirements</label>
                <input 
                  type="text" 
                  name="entryRequirements" 
                  value={formData.entryRequirements || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hazards Assessment */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazards Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Atmospheric Hazard? *</label>
                <select 
                  name="atmosphericHazard" 
                  value={formData.atmosphericHazard ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Atmospheric Hazard Description</label>
                <input 
                  type="text" 
                  name="atmosphericHazardDescription" 
                  value={formData.atmosphericHazardDescription || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Engulfment Hazard? *</label>
                <select 
                  name="engulfmentHazard" 
                  value={formData.engulfmentHazard ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Engulfment Hazard Description</label>
                <input 
                  type="text" 
                  name="engulfmentHazardDescription" 
                  value={formData.engulfmentHazardDescription || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Configuration Hazard? *</label>
                <select 
                  name="configurationHazard" 
                  value={formData.configurationHazard ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Configuration Hazard Description</label>
                <input 
                  type="text" 
                  name="configurationHazardDescription" 
                  value={formData.configurationHazardDescription || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Other Recognized Hazards? *</label>
                <select 
                  name="otherRecognizedHazards" 
                  value={formData.otherRecognizedHazards ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Other Hazards Description</label>
                <input 
                  type="text" 
                  name="otherHazardsDescription" 
                  value={formData.otherHazardsDescription || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section 4: Safety Measures */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Measures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">PPE Required? *</label>
                <select 
                  name="ppeRequired" 
                  value={formData.ppeRequired ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">PPE List</label>
                <input 
                  type="text" 
                  name="ppeList" 
                  value={formData.ppeList || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Forced Air Ventilation Sufficient? *</label>
                <select 
                  name="forcedAirVentilationSufficient" 
                  value={formData.forcedAirVentilationSufficient ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Dedicated Air Monitor? *</label>
                <select 
                  name="dedicatedContinuousAirMonitor" 
                  value={formData.dedicatedContinuousAirMonitor ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Warning Sign Posted? *</label>
                <select 
                  name="warningSignPosted" 
                  value={formData.warningSignPosted ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Number of Entry Points</label>
                <input 
                  type="number" 
                  name="numberOfEntryPoints" 
                  value={formData.numberOfEntryPoints || ""} 
                  onChange={handleChange} 
                  min="0"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Other People Working Near Space? *</label>
                <select 
                  name="otherPeopleWorkingNearSpace" 
                  value={formData.otherPeopleWorkingNearSpace ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Can Others See into Space? *</label>
                <select 
                  name="canOthersSeeIntoSpace" 
                  value={formData.canOthersSeeIntoSpace ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Do Contractors Enter Space? *</label>
                <select 
                  name="contractorsEnterSpace" 
                  value={formData.contractorsEnterSpace ? "true" : "false"} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                >
                  {boolOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea 
                  name="notes" 
                  value={formData.notes || ""} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all min-h-[100px]" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? "Updating..." : "Creating..."}
                </span>
              ) : (
                isEdit ? "Update" : "Add"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkOrderModal;