import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RideRoute } from '../../types';

interface RideMapProps {
  rides: RideRoute[];
  selectedRideId?: string;
  onSelectRide?: (rideId: string) => void;
}

export const RideMap: React.FC<RideMapProps> = ({ rides, selectedRideId, onSelectRide }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-7.2575, 110.0000],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Dark theme OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing polylines/markers
    polylinesRef.current.forEach(p => p.remove());
    polylinesRef.current = [];

    // Custom Icon for Start/End Markers
    const startIcon = L.divIcon({
      className: 'custom-map-pin-start',
      html: `<div style="background-color: #2563EB; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px #2563EB;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const endIcon = L.divIcon({
      className: 'custom-map-pin-end',
      html: `<div style="background-color: #EF4444; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px #EF4444;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const bounds = L.latLngBounds([]);

    rides.forEach(ride => {
      const isSelected = selectedRideId === ride.id;
      const polyline = L.polyline(ride.coordinates, {
        color: isSelected ? '#38BDF8' : '#2563EB',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.6,
        dashArray: isSelected ? undefined : '5, 10'
      }).addTo(map);

      polyline.on('click', () => {
        if (onSelectRide) onSelectRide(ride.id);
      });

      polylinesRef.current.push(polyline);

      // Add Start & End Markers
      if (ride.coordinates.length > 0) {
        const startCoord = ride.coordinates[0];
        const endCoord = ride.coordinates[ride.coordinates.length - 1];

        L.marker(startCoord, { icon: startIcon }).addTo(map).bindPopup(`<b>Mulai:</b> ${ride.startPoint}`);
        L.marker(endCoord, { icon: endIcon }).addTo(map).bindPopup(`<b>Tujuan:</b> ${ride.endPoint}`);

        ride.coordinates.forEach(c => bounds.extend(c));
      }
    });

    if (rides.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [rides, selectedRideId, onSelectRide]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
