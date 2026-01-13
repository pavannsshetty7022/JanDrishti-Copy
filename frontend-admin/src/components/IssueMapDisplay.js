import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from 'react-bootstrap';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IssueMapDisplay = ({ lat, lng, address }) => {
    if (!lat || !lng) {
        return (
            <Card className="border-0 shadow-sm bg-light text-center py-5 rounded-4">
                <i className="bi bi-geo-alt text-muted mb-2 fs-2"></i>
                <p className="text-muted mb-0">No coordinates available for this issue.</p>
                <small>{address}</small>
            </Card>
        );
    }

    const position = [parseFloat(lat), parseFloat(lng)];

    return (
        <Card className="border-0 shadow-sm overflow-hidden rounded-4">
            <div style={{ height: '300px', width: '100%' }}>
                <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            <strong>Issue Location</strong> <br /> {address}
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
            <Card.Footer className="bg-white border-0 py-2 px-3 small text-muted">
                <div className="d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-geo-alt-fill text-primary me-1"></i> {address}</span>
                    <span className="badge bg-primary-light text-primary px-3">{parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}</span>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default IssueMapDisplay;
