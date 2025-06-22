// Google Maps API configuration
export const GOOGLE_MAPS_API_KEY = "AIzaSyBMOWbnNTU5eqQkhlWD8lrVUyDdQNR6iLE";

// Google Maps loader options - Complete configuration to ensure consistency
export const mapsLoaderOptions = {
  id: 'google-map-script',
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['maps', 'places'], // Added places library for location search
  language: 'en',
  region: 'US',
  authReferrerPolicy: 'origin'
};

// Default map center (Sri Lanka)
export const defaultMapCenter = { lat: 7.8731, lng: 80.7718 };

// Default map zoom level
export const defaultZoom = 7;
