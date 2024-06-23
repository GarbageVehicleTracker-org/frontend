import { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";
import PropTypes from "prop-types";
import withAuth from "../utils/withAuth";
import io from "socket.io-client";

const containerStyle = {
  width: "100%",
  height: "90vh",
};

const MapComponent = ({ areaData, driverData, vehicleId }) => {
  console.log(vehicleId);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC8rsCM1PxiuuyL7FdtvXimGMSR-0dtkB0",
  });
  console.log(areaData)

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState({
    lat: 23.0654247,
    lng: 87.3026587,
  });
  const [coordinates, setCoordinates] = useState([]);
  const [polylinePath, setPolylinePath] = useState([]);
  console.log(coordinates);
  console.log(polylinePath);

  // console.log("areaId is :",areaData._id)

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          // eslint-disable-next-line react/prop-types
          `https://garbage-tracking-backend.onrender.com/dustbins/get-middleCoordinates/${areaData._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch predefined points");
        }

        const data = await response.json();
        console.log("Fetched Data:", data); // Debug: Log the fetched data

        const markersData = data.map((point) => ({
          lat: point.middleCoordinates.latitude,
          lng: point.middleCoordinates.longitude,
        }));
        console.log("Markers Data:", markersData); // Debug: Log the markers data

        setMarkers(markersData);

        // Set center dynamically
        if (data.length > 0) {
          const firstMarker = data[0].middleCoordinates;
          setCenter({ lat: firstMarker.latitude, lng: firstMarker.longitude });
        }
      } catch (error) {
        console.error("Error fetching predefined points:", error);
      }
    };

    fetchCoordinates();
  }, [areaData]);

  useEffect(() => {
    // Connect to the server's socket.io instance
    const socket = io("https://production-backend-3olq.onrender.com");

    // Listen for 'connect' event
    socket.on("connect", () => {
      console.log("Socket connected successfully!");
    });

    // Listen for 'coordinatesUpdated' event
    socket.on("coordinatesUpdated", (updatedCoordinates) => {
      if (updatedCoordinates.vehicleId === vehicleId) {
        // Update the state with the new coordinates only if the vehicleId matches
        setCoordinates((prevCoordinates) => [
          ...prevCoordinates,
          updatedCoordinates,
        ]);
      }
    });

    // Listen for 'dustbinVisited' event
    socket.on("dustbinVisited", (data) => {
      console.log(`Dustbin visited: ${data.id}`);
      // Optionally, you could update the UI to indicate the visited dustbin
    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [vehicleId]);

  useEffect(() => {
    // Update polyline path when coordinates change
    setPolylinePath(
      coordinates.map((coord) => ({ lat: coord.latitude, lng: coord.longitude }))
    );
  }, [coordinates]);

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={18}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map((position, index) => (
        <Marker
          key={index}
          position={position}
          onClick={() => handleMarkerClick(position)}
        />
      ))}
      {selectedMarker && (
        <InfoWindow
          position={selectedMarker}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h1>Marker Info</h1>
            <p>Area Name: {areaData.name}</p>
            <p>Driver Name: {driverData.name}</p>
            <p>This is the info window text for the marker.</p>
          </div>
        </InfoWindow>
      )}
      <Polyline path={polylinePath} options={{ strokeColor: "#FF0000" }} />
    </GoogleMap>
  ) : null;
};

MapComponent.propTypes = {
  areaData: PropTypes.shape({
    areaId: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(
      PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      })
    ),
    name: PropTypes.string.isRequired,
  }).isRequired,
  driverData: PropTypes.shape({
    driverId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  vehicleId: PropTypes.string.isRequired,
};

const MapComponentWithAuth = withAuth(MapComponent);
export default MapComponentWithAuth;
