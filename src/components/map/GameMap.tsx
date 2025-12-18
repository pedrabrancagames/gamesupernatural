'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import { MONSTERS, Poi } from '@/lib/constants';

// Fix Leaflet marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Icons for Monsters (using colored circles or custom images if available)
// Ideally we use a DivIcon with a class.
const MonsterIcon = L.divIcon({
    html: '<div class="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-md animate-pulse"></div>',
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Dark map tiles (CartoDB Dark Matter)
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function GameLogic({ onPositionChange }: { onPositionChange: (pos: L.LatLng) => void }) {
    const map = useMap();

    useEffect(() => {
        map.locate({ watch: true, enableHighAccuracy: true });

        map.on("locationfound", function (e) {
            onPositionChange(e.latlng);
            // map.flyTo(e.latlng, map.getZoom()); // Don't fly every update
        });
    }, [map, onPositionChange]);

    return null;
}

export default function GameMap() {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [pois, setPois] = useState<Poi[]>([]);

    // Simple spawning logic: spawn monsters nearby when position changes (mock)
    useEffect(() => {
        if (!position) return;

        // Check if we already have POIs spawned. If not, spawn some.
        if (pois.length === 0) {
            const newPois: Poi[] = [];
            for (let i = 0; i < 5; i++) {
                // Random offset 0.001 ~ 100m
                const latOffset = (Math.random() - 0.5) * 0.005;
                const lngOffset = (Math.random() - 0.5) * 0.005;
                const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];

                newPois.push({
                    id: `poi-${i}`,
                    lat: position.lat + latOffset,
                    lng: position.lng + lngOffset,
                    type: 'monster',
                    data: monster
                });
            }
            setPois(newPois);
        }
    }, [position, pois.length]);

    return (
        <MapContainer center={[38.9717, -95.2353]} zoom={15} scrollWheelZoom={true} className="w-full h-full min-h-[80vh] z-0 bg-stone-900">
            <TileLayer
                attribution={ATTRIBUTION}
                url={DARK_TILES}
            />

            <GameLogic onPositionChange={setPosition} />

            {/* User Marker */}
            {position && (
                <>
                    <Marker position={position} opacity={1}>
                        <Popup>Você está aqui</Popup>
                    </Marker>
                    <Circle center={position} radius={50} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
                </>
            )}

            {/* Points of Interest */}
            {pois.map(poi => (
                <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={MonsterIcon}>
                    <Popup>
                        <div className="text-stone-900 min-w-[150px] text-center">
                            <strong className="text-lg uppercase text-red-900 block mb-1">{poi.data.name}</strong>
                            <span className="text-xs font-bold text-stone-600">HP: {poi.data.hp}</span>
                            <div className="mt-3">
                                <Link href={`/ar?monsterId=${poi.data.id}`}>
                                    <Button size="sm" className="w-full bg-red-900 hover:bg-red-800 text-white font-bold uppercase h-8 text-xs">
                                        Caçar
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
