import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React
// This is needed because of how webpack handles assets
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  latitude: string;
  longitude: string;
  onCoordinateChange: (lat: string, lng: string) => void;
  resetMap?: boolean; // New prop to indicate when to reset the map
}

// Component to handle map click events
const MapClickHandler: React.FC<{
  onCoordinateChange: (lat: string, lng: string) => void;
}> = ({ onCoordinateChange }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Format to 6 decimal places and convert to string
      onCoordinateChange(lat.toFixed(6), lng.toFixed(6));
    },
  });

  return null;
};

// Component to configure the map to only zoom with shift key
const ShiftKeyZoom: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Disable the default scroll wheel zoom
    map.scrollWheelZoom.disable();

    // Add a custom event handler for wheel events
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        // If shift key is pressed, enable zoom temporarily
        map.scrollWheelZoom.enable();
        // After a short delay, disable it again
        setTimeout(() => {
          map.scrollWheelZoom.disable();
        }, 1000);
      }
    };

    // Add the event listener to the map container
    map.getContainer().addEventListener("wheel", handleWheel);

    // Clean up the event listener when the component unmounts
    return () => {
      map.getContainer().removeEventListener("wheel", handleWheel);
    };
  }, [map]);

  return null;
};

// Component to handle map reference and configuration
const MapConfigHandler: React.FC<{
  setMapRef: (map: L.Map) => void;
}> = ({ setMapRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Store map reference
    setMapRef(map);
  }, [map, setMapRef]);

  return null;
};

// Component to handle zooming to coordinates
const ZoomToCoordinates: React.FC<{
  position: [number, number];
  shouldZoom: boolean;
  onZoomComplete: () => void;
  resetMap?: boolean;
  defaultCenter: [number, number];
}> = ({ position, shouldZoom, onZoomComplete, resetMap, defaultCenter }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !shouldZoom) return;
    
    // Zoom to the position with animation
    map.setView(position, 17, {
      animate: true,
      duration: 1
    });
    
    // Notify parent that zoom is complete
    onZoomComplete();
  }, [map, position, shouldZoom, onZoomComplete]);
  
  // Handle map reset when resetMap prop changes
  useEffect(() => {
    if (!map || !resetMap) return;
    
    // Reset the map view to default center and zoom
    map.setView(defaultCenter, 4.5, {
      animate: true,
      duration: 1
    });
  }, [map, resetMap, defaultCenter]);
  
  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({
  latitude,
  longitude,
  onCoordinateChange,
  resetMap = false,
}) => {
  // Default center if no coordinates are provided - wrapped in useMemo to prevent re-creation on each render
  const defaultCenter = useMemo<[number, number]>(() => [50.8, 4.3], []);

  // Parse current coordinates or use defaults
  const [position, setPosition] = useState<[number, number]>(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }

    return defaultCenter;
  });

  // Track whether coordinates were explicitly provided or selected
  const [hasCoordinates, setHasCoordinates] = useState<boolean>(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Only set to true if valid coordinates were provided in props
    return !isNaN(lat) && !isNaN(lng) && latitude !== "" && longitude !== "";
  });
  
  // Track if we should zoom to coordinates (when manually entered)
  const [shouldZoom, setShouldZoom] = useState(false);
  
  // Track the previous coordinates to detect manual changes
  const prevCoordinatesRef = useRef({ latitude, longitude });

  // Reference to the map instance
  const mapRef = useRef<L.Map | null>(null);

  // Function to store the map reference
  const setMapRef = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);
  
  // Function to handle zoom completion
  const handleZoomComplete = useCallback(() => {
    setShouldZoom(false);
  }, []);

  // Update position when props change
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const prevLat = parseFloat(prevCoordinatesRef.current.latitude);
    const prevLng = parseFloat(prevCoordinatesRef.current.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition([lat, lng]);
      
      // Only set hasCoordinates to true if valid coordinates were provided in props
      if (latitude !== "" && longitude !== "") {
        setHasCoordinates(true);
        
        // Check if coordinates were changed manually (not via map click)
        // We detect this by checking if the coordinates changed but are different from the previous values
        if ((lat !== prevLat || lng !== prevLng) && 
            (prevCoordinatesRef.current.latitude !== "" || prevCoordinatesRef.current.longitude !== "")) {
          // Trigger zoom to the new coordinates
          setShouldZoom(true);
        }
      }
    }
    
    // Update previous coordinates reference
    prevCoordinatesRef.current = { latitude, longitude };
  }, [latitude, longitude]);
  
  // Handle form reset
  useEffect(() => {
    if (resetMap) {
      // Clear the marker by setting hasCoordinates to false
      setHasCoordinates(false);
      // Reset position to default
      setPosition(defaultCenter);
    }
  }, [resetMap, defaultCenter]);

  // Handle coordinate selection
  const handleCoordinateChange = (lat: string, lng: string) => {
    setPosition([parseFloat(lat), parseFloat(lng)]);
    setHasCoordinates(true); // User has now selected coordinates
    onCoordinateChange(lat, lng);
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative h-full w-full overflow-hidden rounded-md border border-gray-300"
        style={{ background: "transparent" }}
      >
        <MapContainer
          center={position}
          zoom={4.5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={true}
        >
          {/* Layer control for Map/Satellite toggle */}
          <LayersControl position="bottomleft">
            <LayersControl.BaseLayer checked name="Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Only show marker if coordinates have been explicitly provided or selected */}
          {hasCoordinates && <Marker position={position} />}

          {/* Component to handle map clicks */}
          <MapClickHandler onCoordinateChange={handleCoordinateChange} />

          {/* Component to configure shift-key zooming */}
          <ShiftKeyZoom />

          {/* Component to handle map reference and configuration */}
          <MapConfigHandler setMapRef={setMapRef} />
          
          {/* Component to handle zooming to coordinates */}
          <ZoomToCoordinates 
            position={position} 
            shouldZoom={shouldZoom} 
            onZoomComplete={handleZoomComplete}
            resetMap={resetMap}
            defaultCenter={defaultCenter}
          />
        </MapContainer>
      </div>
      <p className="mt-2 text-xs italic text-gray-500">
        To zoom: Use the +/- buttons or hold Shift key while scrolling
      </p>
    </div>
  );
};

export default MapSelector;
