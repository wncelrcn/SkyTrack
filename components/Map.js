import React, { useEffect } from "react";
import dynamic from "next/dynamic";

// Create a client-side only Map component
const MapComponent = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import(
      "react-leaflet"
    );
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");

    // Fix for default marker icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // New component to handle center changes
    function ChangeMapView({ center }) {
      const map = useMap();

      useEffect(() => {
        map.setView(center, map.getZoom(), {
          animate: true,
        });
      }, [center, map]);

      return null;
    }

    const Map = ({ center, zoom, city, weather }) => {
      return (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%", borderRadius: "16px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>
              {city}
              <br />
              {weather.temp}°C - {weather.description}
            </Popup>
          </Marker>
          <ChangeMapView center={center} />
        </MapContainer>
      );
    };

    return Map;
  },
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading map...
      </div>
    ),
  }
);

export default MapComponent;
