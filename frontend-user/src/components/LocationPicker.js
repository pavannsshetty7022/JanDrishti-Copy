import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Form,
  ListGroup,
  Card,
  Spinner,
  InputGroup,
  Button,
} from "react-bootstrap";
import { debounce } from "lodash";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMarker = ({ position, setPosition, reverseGeocode }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const LocationPicker = ({ value, onChange, isEditing = false }) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null,
  );
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setPosition([value.lat, value.lng]);
      setMapCenter([value.lat, value.lng]);
      setZoom(15);
      setSearchQuery(value.address || "");
    } else if (!isEditing) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMapCenter([latitude, longitude]);
          setZoom(13);
        },
        (err) => console.log(err.message),
      );
    }
  }, [isEditing, value?.lat, value?.lng, value?.address]);
  const handleSearch = debounce(async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=in&limit=5&accept-language=en`,
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, 800);

  const selectLocation = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const pos = [lat, lon];
    setPosition(pos);
    setMapCenter(pos);
    setZoom(16);
    setSearchQuery(item.display_name);
    setSuggestions([]);
    onChange({
      lat,
      lng: lon,
      address: item.display_name,
    });
  };

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
        );
        const data = await response.json();
        const address = data.display_name;
        setSearchQuery(address);
        onChange({
          lat,
          lng,
          address,
        });
      } catch (error) {
        console.error(error);
      }
    },
    [onChange],
  );

  return (
    <Card className="location-picker-card mb-3 shadow-sm border-0 bg-transparent">
      <Card.Body className="p-0">
        <div className="mb-3">
          <Form.Label className="small fw-bold text-muted text-uppercase mb-2 d-flex align-items-center">
            <i className="bi bi-geo-alt-fill text-primary me-2"></i>
            Find Location
          </Form.Label>
          <InputGroup className="shadow-sm rounded-3 overflow-hidden">
            <InputGroup.Text className="bg-white border-0">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Enter area, landmark, or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="border-0 py-2 shadow-none"
            />
            {isSearching && (
              <InputGroup.Text className="bg-white border-0">
                <Spinner animation="border" size="sm" variant="primary" />
              </InputGroup.Text>
            )}
            {searchQuery && (
              <Button
                variant="white"
                className="border-0 text-muted"
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>

          {suggestions.length > 0 && (
            <ListGroup className="suggestion-list mt-1 shadow-lg border-0">
              {suggestions.map((item) => (
                <ListGroup.Item
                  key={item.place_id}
                  action
                  onClick={() => selectLocation(item)}
                  className="small border-0 border-bottom py-2 bg-white"
                >
                  <div className="d-flex">
                    <i className="bi bi-geo-alt mt-1 me-2 text-primary"></i>
                    <span className="text-truncate">{item.display_name}</span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        <div
          className="map-container-wrapper rounded-3 overflow-hidden shadow-sm"
          style={{
            height: "300px",
            width: "100%",
            border: "1px solid var(--primary-light)",
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              reverseGeocode={reverseGeocode}
            />
            <ChangeView center={mapCenter} zoom={zoom} />
          </MapContainer>
        </div>

        <div className="mt-2 text-end">
          <small className="text-muted fst-italic">
            <i className="bi bi-info-circle me-1"></i>
            Click on the map to manually adjust location
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LocationPicker;
