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
    numberOfEntryPoints: "",
    notes: "",
    images: []
  });
    // State for user's assigned locations
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const [previewImages, setPreviewImages] = useState([]);
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(() => {
    // Get the current user data and their assigned locations
    const user = JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}');
    const technicianName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
    
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
        
        if (!response.ok) {
          throw new Error("Failed to fetch assigned locations");
        }
        
        const data = await response.json();
        let locationData = [];
        if (data.success && data.locations) {
          locationData = data.locations;
          setAssignedLocations(data.locations);
        } else if (data.data) {
          // Alternative response format
          locationData = data.data;
          setAssignedLocations(data.data);
        }

        // If there's exactly one location, automatically set it in the form
        if (locationData.length === 1) {
          const location = locationData[0];
          setFormData(prevData => ({
            ...prevData,
            confinedSpaceNameOrId: location.name || location,
            building: location.address || prevData.building,
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
    
    if (order) {
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
        technician: technicianName, // Add the technician name
        images: order.images || []
      };

      // Ensure boolean fields are properly set
      booleanFields.forEach(field => {
        processedOrder[field] = Boolean(processedOrder[field]);
      });

      setFormData(processedOrder);
      setPreviewImages(order.images || []);
    }
  }, [order]);
  
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
      }));
    } else if (name === "confinedSpaceNameOrId") {
      // When a location is selected from the dropdown
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // If we have location data and a value was selected, populate related fields
      if (value && assignedLocations.length > 0) {
        const selectedLocation = assignedLocations.find(loc => loc.name === value);
        if (selectedLocation) {
          // Populate additional fields from the selected location
          setFormData(prev => ({
            ...prev,
            building: selectedLocation.address || prev.building,
            locationDescription: selectedLocation.description || prev.locationDescription
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handles compressing and resizing images before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // Maximum width and height for the compressed image
      const maxWidth = 1600;
      const maxHeight = 1200;
      const quality = 0.8; // Image quality (0.0 to 1.0)
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Create a canvas to draw the resized image
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get the compressed image as data URL
          const dataUrl = canvas.toDataURL(file.type, quality);
          resolve(dataUrl);
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  const handleImageUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      
      if (files.length === 0) return;
      
      // Show loading toast for large uploads
      let loadingToast = null;
      if (files.length > 2) {
        loadingToast = toast.info(`Processing ${files.length} images...`, { autoClose: false });
      }
      
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        toast.error('Please upload only image files');
        return;
      }
      
      // Check file sizes (warn if any file is larger than 5MB)
      const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (largeFiles.length > 0) {
        toast.warning(`${largeFiles.length} images are large and will be compressed for better performance.`);
      }
      
      // Process all files with compression
      const processedImages = await Promise.all(
        files.map(async (file) => {
          try {
            // Compress if file is larger than 1MB
            if (file.size > 1024 * 1024) {
              return await compressImage(file);
            } else {
              // For smaller files, just read as data URL
              return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
              });
            }
          } catch (err) {
            console.error("Error processing image:", err);
            return null;
          }
        })
      );
      
      // Filter out any failed images
      const validImages = processedImages.filter(img => img !== null);
      
      if (validImages.length === 0) {
        toast.error('Failed to process images. Please try again.');
        return;
      }
      
      // Update state with all valid images
      setPreviewImages(prev => [...prev, ...validImages]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }));
      
      // Close loading toast if it was shown
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      // Success message
      toast.success(`${validImages.length} image${validImages.length !== 1 ? 's' : ''} added successfully`);
      
    } catch (error) {
      console.error("Error in image upload:", error);
      toast.error('Failed to upload images. Please try again.');
    }
  };
  
  const removeImage = (index) => {
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    setPreviewImages(newPreviewImages);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };
  
  // Camera functions
  const startCamera = async () => {
    try {
      // Check if the browser supports mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support camera access. Please try uploading images instead.");
        return;
      }
      
      // Check if a camera is already active - if yes, stop it first to avoid conflicts
      if (stream) {
        stopCamera();
      }

      // Reset video element to avoid cached issues
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onloadeddata = null;
      }
      
      // Display status message to indicate camera is being accessed
      const loadingToast = toast.info("Accessing camera...", { autoClose: false });
      
      try {
        // Simple camera constraints to start with
        const constraints = {
          video: {
            // Lower resolution initially to avoid performance issues
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        // Check if we're on mobile to use different constraints
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          console.log('Mobile device detected, using mobile optimized constraints');
          constraints.video = {
            facingMode: 'environment',  // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          };
        }
        
        console.log('Requesting camera with constraints:', constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted with stream:', mediaStream);
        
        // If on a mobile device with multiple cameras, we've already tried for the back camera
        // If on desktop or we only have one camera, we'll just use what we got
        
        // Close the loading toast
        toast.dismiss(loadingToast);
        
        // Set the stream and display camera
        setStream(mediaStream);
        setShowCamera(true);
        
        // Set up video element
        if (videoRef.current) {
          console.log('Setting up video element');
          
          videoRef.current.oncanplay = () => {
            console.log('Video can play event fired');
          };
          
          videoRef.current.onloadeddata = () => {
            console.log('Video loaded data event fired - dimensions:', 
              videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          };
          
          videoRef.current.onloadedmetadata = async () => {
            console.log('Video metadata loaded');
            try {
              await videoRef.current.play();
              console.log('Video playback started');
              
              // Add a timeout to verify video is playing correctly
              setTimeout(() => {
                if (videoRef.current && videoRef.current.paused) {
                  console.warn('Video paused after metadata loaded');
                  videoRef.current.play().catch(err => {
                    console.error('Error playing video after timeout:', err);
                  });
                }
              }, 1000);
            } catch (playError) {
              console.error('Error starting video after metadata loaded:', playError);
              
              // Add a play button for user-initiated play
              const videoContainer = videoRef.current.parentElement;
              if (videoContainer) {
                const playButton = document.createElement('button');
                playButton.innerText = 'Tap to Start Camera';
                playButton.className = 'absolute inset-0 bg-black/50 text-white text-xl font-bold flex items-center justify-center z-20';
                playButton.onclick = async () => {
                  try {
                    await videoRef.current.play();
                    videoContainer.removeChild(playButton);
                  } catch (err) {
                    console.error('Error in manual play:', err);
                    toast.error('Unable to start camera. Please try again or use image upload instead.');
                  }
                };
                videoContainer.appendChild(playButton);
              }
            }
          };
          
          // Set the stream to the video element
          videoRef.current.srcObject = mediaStream;
        }
      } catch (cameraError) {
        toast.dismiss(loadingToast);
        console.error('Camera access error:', cameraError);
        
        // Provide clear error messages based on error type
        if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
          toast.error('Camera access was denied. Please check your browser permissions and try again.');
        } else if (cameraError.name === 'NotFoundError') {
          toast.error('No camera found on your device. Please try uploading images instead.');
        } else if (cameraError.name === 'NotReadableError' || cameraError.name === 'AbortError') {
          toast.error('Your camera is currently in use by another application or has encountered an error. Please close other apps using your camera and try again.');
        } else {
          toast.error(`Camera error: ${cameraError.message || 'Unknown error'}. Please try uploading images instead.`);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong when trying to access the camera. Please try again or use image upload instead.');
    }
  };
  
  const stopCamera = () => {
    // Properly clean up all resources
    if (stream) {
      try {
        // Stop all tracks
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (err) {
            console.error('Error stopping track:', err);
          }
        });
        
        // Clear video source
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        setStream(null);
      } catch (error) {
        console.error('Error cleaning up camera:', error);
      }
    }
    
    // Reset UI state
    setShowCamera(false);
  };
  
  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      console.log('Video state at capture:', {
        currentTime: video.currentTime,
        readyState: video.readyState,
        paused: video.paused,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      
      // Check if video is actually playing and ready
      if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
        // Try to remedy potential black screen issues before giving error
        if (stream && stream.active && video.readyState >= 1) {
          toast.info('Preparing camera for capture...');
          
          // Try refreshing the stream connection
          video.srcObject = null;
          setTimeout(() => {
            if (videoRef.current && stream.active) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(err => {
                console.log('Error replaying video:', err);
                toast.error('Camera is not ready yet. Please wait a moment and try again.');
              });
            }
          }, 500);
          return;
        }
        
        toast.error('Camera is not ready yet. Please wait a moment and try again.');
        return;
      }
      
      // Show loading toast for capture process
      const loadingToast = toast.info('Capturing image...', { autoClose: false });
      
      try {
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Clear the canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame to canvas with retries if needed
        let drawSuccess = false;
        let retryCount = 0;
        
        // Try up to 3 times to capture an image - helps with some devices
        while (!drawSuccess && retryCount < 3) {
          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Check the canvas to see if it has content (simplified check)
            const pixelData = context.getImageData(canvas.width/2, canvas.height/2, 1, 1).data;
            const isBlack = pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0;
            
            // If image is completely black, it might be a black screen issue
            if (isBlack && retryCount < 2) {
              console.log('Captured image appears black, retrying...');
              retryCount++;
              // Small delay before retry
              await new Promise(resolve => setTimeout(resolve, 300));
            } else {
              drawSuccess = true;
            }
          } catch (drawError) {
            retryCount++;
            console.error(`Draw attempt ${retryCount} failed:`, drawError);
            
            if (retryCount >= 3) {
              throw new Error(`Failed to capture frame after multiple attempts: ${drawError.message}`);
            }
            
            // Wait briefly before trying again
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        // Convert canvas to data URL with good quality (0.9)
        let imageDataUrl;
        try {
          imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        } catch (dataUrlError) {
          // This can happen with CORS issues or tainted canvas
          throw new Error(`Failed to convert image: ${dataUrlError.message}`);
        }
        
        // Check if image was successfully captured
        if (!imageDataUrl || imageDataUrl === 'data:,') {
          throw new Error('Failed to generate image data');
        }
        
        // Check image data size to ensure it's valid
        const estimatedSize = Math.round((imageDataUrl.length - 22) * 0.75 / 1024);
        if (estimatedSize < 1) {
          throw new Error('Image capture failed: empty or invalid image');
        }
        
        // Add to preview and form data
        setPreviewImages(prev => [...prev, imageDataUrl]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageDataUrl]
        }));
        
        // Close camera after successful capture
        stopCamera();
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Image captured successfully!');
      } catch (error) {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        
        console.error('Error capturing image:', error);
        toast.error(`Failed to capture image. Please try again or use the image upload option instead.`);
        
        // Don't close camera on error so user can try again
      }
    } else {
      toast.error('Camera is not initialized properly. Please try again or use image upload instead.');
    }
  };

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [stream]);
  
  // Close camera if modal is closed
  useEffect(() => {
    if (!show && stream) {
      stopCamera();
    }
  }, [show]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("User"));
      const userId = user?._id || user?.id;
      
      // If surveyors field is empty or not properly set, use the logged-in user's name
      const technicianName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();
      
      const dataToSubmit = {
        ...formData,
        userId,
        surveyors: [technicianName], // Set surveyors as an array with technician name
        dateOfSurvey: formData.dateOfSurvey ? new Date(formData.dateOfSurvey).toISOString() : new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(dataToSubmit);
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
            <div className="space-y-4">
              {showCamera ? (
                <div className="relative">
                  {/* Hidden canvas for image capture */}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  
                  {/* Camera container with improved UI */}
                  <div className="relative rounded-xl overflow-hidden bg-black shadow-lg border border-gray-300">
                    {/* Camera status and orientation indicators */}
                    <div className="absolute z-10 top-0 inset-x-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/70 to-transparent">
                      <span className="flex items-center px-3 py-1 bg-black/50 text-white rounded-full text-sm backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Camera Active
                      </span>
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                        {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Tap screen to focus' : 'Ready to capture'}
                      </span>
                    </div>
                    
                    {/* Black screen troubleshooting overlay */}
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
                      id="camera-troubleshoot"
                    >
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (videoRef.current && stream && stream.active) {
                            // Try to reset the video element
                            videoRef.current.srcObject = null;
                            setTimeout(() => {
                              if (videoRef.current && stream.active) {
                                videoRef.current.srcObject = stream;
                                videoRef.current.play().catch(console.error);
                              }
                            }, 300);
                          }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-300"
                      >
                        Try to Fix Camera
                      </button>
                    </div>
                    
                    {/* Video element with enhanced error handling */}
                    <video 
                      ref={videoRef} 
                      className="w-full h-80 md:h-96 object-cover mx-auto touch-none" 
                      autoPlay 
                      playsInline
                      muted
                      style={{ backgroundColor: '#111' }} // Dark background to help see loading state
                      onError={(e) => {
                        console.error('Video element error:', e.target.error);
                        toast.error('Video error occurred. Please try again.');
                      }}
                      onPlay={() => console.log('Video play event triggered')}
                      onClick={(e) => {
                        // Try to focus on tap (works on some mobile browsers)
                        if (videoRef.current && videoRef.current.srcObject) {
                          const tracks = videoRef.current.srcObject.getVideoTracks();
                          if (tracks.length > 0 && typeof tracks[0].focus === 'function') {
                            try {
                              tracks[0].focus();
                            } catch (err) {
                              console.log('Manual focus not supported');
                            }
                          }
                          
                          // Try restarting the video - sometimes helps with black screens
                          if (videoRef.current.paused) {
                            videoRef.current.play().catch(err => {
                              console.log('Could not play on tap:', err);
                            });
                          }
                        }
                      }}
                    ></video>
                    
                    {/* Capture button - large circular button for easy access */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <button
                        type="button"
                        onClick={captureImage}
                        className="w-16 h-16 rounded-full bg-white border-4 border-blue-600 shadow-xl flex items-center justify-center hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
                        aria-label="Take Photo"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                    
                    {/* Cancel button - positioned in corner */}
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="absolute top-14 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      aria-label="Cancel camera"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Camera instructions - improved for mobile */}
                  <div className="mt-4 bg-gray-100 rounded-xl p-3 shadow-sm">
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Tips for better photos:</h4>
                    <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
                      <li>Ensure adequate lighting in the confined space</li>
                      <li>Hold your device steady when capturing</li>
                      <li>Capture wide shots to show the entire space</li>
                      <li>Take close-ups of important details and hazards</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-2 text-sm font-medium text-gray-800">
                          <span className="font-semibold">Upload Images</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                        <p className="text-xs text-gray-500 mt-1">Tap to select files</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                        aria-label="Upload images"
                      />
                    </label>
                  </div>
                  
                  {/* Camera Capture */}
                  <div className="flex items-center justify-center w-full">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors shadow-sm"
                      aria-label="Take photos with camera"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mb-2 text-sm font-medium text-gray-800">
                          <span className="font-semibold">Take Photos</span>
                        </p>
                        <p className="text-xs text-gray-500">Use your device camera</p>
                        <p className="text-xs text-gray-500 mt-1">Tap to activate</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image Preview Grid */}
              {previewImages.length > 0 && (
                <div className="mt-6 bg-gray-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Uploaded Images ({previewImages.length})</h4>
                    {previewImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if(confirm('Are you sure you want to remove all images?')) {
                            setPreviewImages([]);
                            setFormData(prev => ({ ...prev, images: [] }));
                            toast.success('All images removed');
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                        <div className="aspect-square overflow-hidden rounded-md">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          {index + 1}
                        </span>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Technician *</label>
                <input 
                  type="text" 
                  name="surveyors" 
                  value={formData.technician || `${JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}').firstname} ${JSON.parse(localStorage.getItem("User") || '{"firstname":"", "lastname":""}').lastname}`} 
                  readOnly
                  required 
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Space Name/ID *</label>
                {isLoadingLocations ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    <span className="text-sm text-gray-700">Loading locations...</span>
                  </div>
                ) : assignedLocations.length > 0 ? (
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Building *</label>
                {assignedLocations.length > 0 ? (
                  <input 
                    type="text" 
                    name="building" 
                    value={formData.building || ""} 
                    readOnly
                    required 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent transition-all cursor-not-allowed" 
                  />
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
              </div>
              <div className="md:col-span-2">
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

          {/* More sections for other form fields would go here */}

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
