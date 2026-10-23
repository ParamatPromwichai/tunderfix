"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// User Location Icon (Blue)
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Technician Location Icon (DivIcon with wrench)
const createTechIcon = () => {
  const wrenchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

  return new L.DivIcon({
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background-color: white;
        border: 3px solid #059669; /* emerald-600 */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-family: sans-serif;
        color: #059669;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        overflow: hidden;
      ">
        ${wrenchSvg}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #059669;
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%);
      "></div>
    `,
    className: "custom-tech-divicon",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={userIcon}>
      <Popup>ตำแหน่งของคุณ</Popup>
    </Marker>
  );
}

function GetCurrentLocationButton({
  setPosition,
}: {
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const handleGetLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        map.flyTo([latitude, longitude], 15);
        setLoading(false);
      },
      (err) => {
        alert("ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง");
        setLoading(false);
      },
    );
  };

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading}
      className="absolute top-4 right-4 z-[400] bg-white text-stone-700 p-2 rounded-lg shadow-md border border-stone-200 hover:bg-stone-50 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      title="ดึงตำแหน่งปัจจุบันของฉัน"
    >
      {loading ? (
        <svg
          className="w-5 h-5 animate-spin text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      )}
    </button>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom() || 13);
  }, [center[0], center[1], map]);
  return null;
}

export default function MapPickerImpl({
  initialLat,
  initialLng,
  technicians,
  onChange,
}: {
  initialLat: number;
  initialLng: number;
  technicians?: any[];
  onChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat,
    initialLng,
  ]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Report deliberate user selections only; the initial map centre is not a confirmed location.
  const choosePosition = (next: [number, number]) => {
    setPosition(next);
    onChangeRef.current(next[0], next[1]);
  };

  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  return (
    <div
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "0.5rem",
        overflow: "hidden",
        border: "1px solid #d6d3d1",
        zIndex: 10,
      }}
    >
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", position: "relative" }}
      >
        <MapUpdater center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={choosePosition} />
        {(() => {
          if (!technicians) return null;

          // Group by user id (or lat/lng) so we don't overlap markers for the same technician
          const groupedTechs = technicians.reduce(
            (acc, tech) => {
              if (!tech.latitude || !tech.longitude) return acc;

              if (!acc[tech.userId]) {
                acc[tech.userId] = {
                  ...tech,
                  services: [],
                };
              }
              if (tech.categoryName) {
                acc[tech.userId].services.push(tech.categoryName);
              }
              return acc;
            },
            {} as Record<string, any>,
          );

          return Object.values(groupedTechs).map((tech: any) => (
            <Marker
              key={tech.userId}
              position={[tech.latitude, tech.longitude]}
              icon={createTechIcon()}
            >
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <div className="font-bold text-stone-900">
                    {tech.fullName}
                  </div>
                  {tech.services.length > 0 && (
                    <div className="text-xs text-stone-600 mt-1">
                      <span className="font-semibold">บริการ:</span>
                      <ul className="list-disc list-inside mt-0.5">
                        {tech.services.map((svc: string, i: number) => (
                          <li key={i}>{svc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-emerald-600 mt-2 font-medium">
                    ห่างออกไป {tech.distanceKm?.toFixed(1)} กม.
                  </div>
                </div>
              </Popup>
            </Marker>
          ));
        })()}
        <GetCurrentLocationButton setPosition={choosePosition} />
      </MapContainer>
    </div>
  );
}
