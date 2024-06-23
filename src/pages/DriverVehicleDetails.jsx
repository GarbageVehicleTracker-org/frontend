import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/DriverVehicleDetails.css";
import withAuth from "../utils/withAuth";

const DriverVehicleDetails = () => {
  const [areaData, setAreaData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (url, setState) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setState(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  const getQueryParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedParam = urlParams.get(name);
    return encodedParam ? atob(encodedParam) : null;
  };

  useEffect(() => {
    const areaData = getQueryParameter("areaId");
    setAreaData(areaData);
    const driverId = getQueryParameter("driverId");
    const vehicleId = getQueryParameter("vehicleId");
    if (!areaData || !driverId || !vehicleId) {
      setError("Invalid URL parameters");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      await Promise.all([
        fetchData(
          `https://garbage-tracking-backend.onrender.com/drivers/get-all-drivers/${driverId}`,
          setDriverData
        ),
        fetchData(
          `https://garbage-tracking-backend.onrender.com/vehicles/get-vehicles/${vehicleId}`,
          setVehicleData
        ),
      ]);
      setLoading(false);
    };

    fetchDetails();
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const handleTracking = (areaData, vehicleId, driverId) => {
    const encodedAreaId = btoa(areaData);
    const encodedDriverId = btoa(driverId);
    const encodedVehicleId = btoa(vehicleId);
    const url = `/tracking?areaId=${encodedAreaId}&driverId=${encodedDriverId}&vehicleId=${encodedVehicleId}`;
    console.log(driverId)
    console.log(vehicleId)

    // Using navigate to programmatically navigate
    navigate(url);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Driver Details</h2>
              {driverData && (
                <>
                  <img
                    src={driverData.image}
                    alt="Driver Image"
                    className="driver-image mb-3"
                  />
                  <p className="driver-info">Name: {driverData.name}</p>
                  <p className="driver-info">Age: {driverData.age}</p>
                  <p className="driver-info">Gender: {driverData.gender}</p>
                  <p className="driver-info">
                    Driver ID: {driverData.driverId}
                  </p>
                  <p className="driver-info">
                    Phone: {driverData.phoneNumbers}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Vehicle Details</h2>
              {vehicleData && (
                <>
                  <p className="vehicle-info">
                    Vehicle ID: {vehicleData.vehicleId}
                  </p>
                  <p className="vehicle-info">
                    Registration No: {vehicleData.registrationNo}
                  </p>
                  <p className="vehicle-info">Type: {vehicleData.type}</p>
                  <p className="vehicle-info">
                    Capacity: {vehicleData.capacity}
                  </p>
                </>
              )}
              <div className="btn mt-3 d-flex justify-content-end gap-5">
                <button
                  className="btn mr-2 btn-custom"
                  onClick={() => {
                    handleTracking(
                      areaData,
                      vehicleData.vehicleId,
                      driverData._id
                    );
                  }}
                >
                  Track
                </button>
                <button className="btn btn-custom-secondary" onClick={goBack}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DriverVehicleDetailsWithAuth = withAuth(DriverVehicleDetails);

export default DriverVehicleDetailsWithAuth;
