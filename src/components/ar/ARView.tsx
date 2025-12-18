'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DeviceOrientationControls, PerspectiveCamera, Html, useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Crosshair } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { MONSTERS } from '@/lib/constants';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

function CameraFeed() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startCamera();
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100"
        />
    );
}

function AsyncMonster({ path }: { path: string }) {
    const { scene } = useGLTF(path);
    return <primitive object={scene} scale={2} />;
}

function MonsterModel({ id, onHit, hp, maxHp }: { id: string | null, onHit: () => void, hp: number, maxHp: number }) {
    const meshRef = useRef<THREE.Group>(null);
    const monsterData = MONSTERS.find(m => m.id === id);
    const modelPath = monsterData?.modelPath;

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1 - 1.5;
        }
    });

    return (
        <group position={[0, 0, -4]}>
            <Html position={[0, 2.5, 0]} center>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-32 h-2 bg-black/50 border border-white/20 rounded overflow-hidden">
                        <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(hp / maxHp) * 100}%` }} />
                    </div>
                </div>
            </Html>

            {/* Debug Info in World Space (Optional, better in HUD) */}

            <group ref={meshRef} onClick={onHit} userData={{ isMonster: true }}>
                {modelPath ? (
                    <Suspense fallback={
                        <mesh>
                            <boxGeometry args={[0.5, 0.5, 0.5]} />
                            <meshStandardMaterial color="yellow" />
                        </mesh>
                    }>
                        <AsyncMonster path={modelPath} />
                    </Suspense>
                ) : (
                    <mesh userData={{ isMonster: true }}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={hp > 0 ? "red" : "gray"} />
                    </mesh>
                )}
            </group>
        </group>
    );
}

function CombatScene({ monsterId, weaponId, onAttackResult }: { monsterId: string | null, weaponId: string | null, onAttackResult: (msg: string) => void }) {
    const [monsterHp, setMonsterHp] = useState(100);
    const maxHp = 100;
    const { camera, scene } = useThree();
    const raycaster = new THREE.Raycaster();

    const handleAttack = () => {
        if (!weaponId) {
            onAttackResult("Selecione uma arma!");
            return;
        }

        // Raycast from camera center
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        const hit = intersects.find(i => i.object.userData.isMonster);

        if (hit) {
            // Logic for damage calculation
            const dmg = 20; // Mock damage
            setMonsterHp(prev => Math.max(0, prev - dmg));
            onAttackResult(`Acertou! -${dmg} HP`);

            // Visual feedback
            // Note: primitives might be complex objects. Getting material color might fail if not mesh.
            // Simplified feedback for now.
        } else {
            onAttackResult("Errou!");
        }
    };

    // Global event listener for fire button (dispatched from HUD)
    useEffect(() => {
        const fireHandler = () => handleAttack();
        window.addEventListener('fire-weapon', fireHandler);
        return () => window.removeEventListener('fire-weapon', fireHandler);
    }, [weaponId]); // Re-bind when weapon changes

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {/* Monster fixed in world space relative to origin */}
            <group position={[0, 0, -5]}>
                <MonsterModel id={monsterId} onHit={() => handleAttack()} hp={monsterHp} maxHp={maxHp} />
            </group>
        </>
    );
}

// Utility to convert GPS delta to Meters (Approximate for small distances)
function latLonToMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6378.137; // Radius of earth in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 1000; // Meters
}

function calculateOffset(startLat: number, startLng: number, currentLat: number, currentLng: number) {
    // Simple flat earth projection for small areas
    // X = Longitude (East-West), Z = Latitude (North-South, inverted in 3D usually)

    const xDist = latLonToMeters(startLat, startLng, startLat, currentLng);
    const zDist = latLonToMeters(startLat, startLng, currentLat, startLng);

    // Determine direction
    const x = currentLng > startLng ? xDist : -xDist;
    const z = currentLat > startLat ? -zDist : zDist; // In 3D engine: -Z is Forward (North) typically

    return { x, z };
}

export default function ARView({ monsterId }: { monsterId: string | null }) {
    // Fallback: Se não houver ID (acesso direto ou link quebrado), usa o primeiro monstro para demonstração
    const activeMonsterId = monsterId || MONSTERS[0].id;
    const [startAR, setStartAR] = useState(false);
    const { loadout, inventory } = useGame();
    const [selectedItem, setSelectedItem] = useState<string | null>(loadout[0] || null);
    const [message, setMessage] = useState("");
    const router = useRouter();

    // GPS State
    const [startPos, setStartPos] = useState<{ lat: number, lng: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ lat: number, lng: number } | null>(null);
    const [gpsError, setGpsError] = useState<string>("");

    const loadedItems = inventory.filter(i => loadout.includes(i.id));

    const requestAccess = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') setStartAR(true);
            } catch (e) {
                console.error(e);
            }
        } else {
            setStartAR(true);
        }
    };

    // Start GPS Tracking when AR starts
    useEffect(() => {
        if (!startAR) return;

        if (!navigator.geolocation) {
            setGpsError("Geolocalização não suportada.");
            return;
        }

        const success = (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords;
            const newPos = { lat: latitude, lng: longitude };

            // Set initial position once
            setStartPos(prev => {
                if (!prev) return newPos;
                return prev;
            });

            // Update current
            setCurrentPos(newPos);
        };

        const error = (err: GeolocationPositionError) => {
            console.warn('GPS Error', err);
            setGpsError("Sinal GPS fraco ou não autorizado.");
        };

        const id = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });

        return () => navigator.geolocation.clearWatch(id);
    }, [startAR]);

    const handleFire = () => {
        window.dispatchEvent(new Event('fire-weapon'));
    };

    // Calculate Camera Position based on GPS
    const cameraPosition = useMemo(() => {
        if (!startPos || !currentPos) return [0, 1.6, 0] as [number, number, number];

        const offset = calculateOffset(startPos.lat, startPos.lng, currentPos.lat, currentPos.lng);
        // Note: We move the CAMERA, so if user walks NORTH (-Z in world), camera goes NORTH.
        // The monster is at (0,0,-4). 

        return [offset.x, 1.6, offset.z] as [number, number, number];
    }, [startPos, currentPos]);

    if (!startAR) {
        return (
            <div className="flex flex-col items-center justify-center h-full z-50 relative bg-black/80 text-white p-8 text-center space-y-4">
                <h2 className="text-xl font-bold">Modo AR</h2>
                <p>Permita o acesso aos sensores e GPS.</p>
                <Button onClick={requestAccess} size="lg" className="bg-red-600">Iniciar</Button>
                <Link href="/map"><Button variant="outline" className="text-black">Voltar</Button></Link>
            </div>
        );
    }

    return (
        <>
            <CameraFeed />

            <div className="absolute inset-0 z-10 w-full h-full">
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    {/* Camera is moved by GPS, rotated by DeviceOrientation */}
                    <group position={cameraPosition}>
                        <PerspectiveCamera makeDefault />
                        <DeviceOrientationControls />
                    </group>

                    {/* Monster starts 5 meters "North" relative to start point - Rendered inside CombatScene for Logic */}

                    <CombatScene
                        monsterId={activeMonsterId}
                        weaponId={selectedItem}
                        onAttackResult={(msg) => {
                            setMessage(msg);
                            setTimeout(() => setMessage(""), 2000);
                        }}
                    />
                </Canvas>
            </div>

            {/* HUD */}
            <div className="absolute top-4 left-4 z-20">
                <Button variant="ghost" size="icon" className="bg-black/50 text-white rounded-full" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
            </div>

            {/* ERROR / STATUS */}
            {gpsError && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-900/80 text-white px-2 py-1 rounded text-xs">
                    {gpsError}
                </div>
            )}

            {/* DEBUG PANEL - ATUALIZADO */}
            <div className="absolute top-4 right-4 z-50 bg-black/80 text-white p-2 text-xs font-mono rounded pointer-events-none text-right">
                <p>ID: {activeMonsterId}</p>
                <p>GPS: {currentPos ? `${currentPos.lat.toFixed(6)}, ${currentPos.lng.toFixed(6)}` : 'Waiting...'}</p>
                <p>CamX: {cameraPosition[0].toFixed(2)}m</p>
                <p>CamZ: {cameraPosition[2].toFixed(2)}m</p>
            </div>

            {/* Combat Log */}
            {message && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-black/70 text-white px-4 py-2 rounded text-sm font-bold animate-pulse">
                    {message}
                </div>
            )}

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-50">
                <Crosshair className="w-8 h-8 text-white" />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center gap-4 px-4">

                {/* Weapon Selector */}
                <div className="flex gap-2 mb-2">
                    {loadedItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={cn(
                                "w-12 h-12 rounded-full border-2 bg-black/60 flex items-center justify-center cursor-pointer transition-all",
                                selectedItem === item.id ? "border-primary scale-110 bg-primary/20" : "border-white/20"
                            )}
                        >
                            {/* Placeholder Icon */}
                            <span className="text-[10px] text-white font-bold">{item.name.substring(0, 2)}</span>
                        </div>
                    ))}
                    {loadedItems.length === 0 && <span className="text-xs text-white/50 bg-black/50 px-2 py-1 rounded">Sem itens equipados</span>}
                </div>

                {/* Fire Button */}
                <Button
                    className="rounded-full w-20 h-20 bg-red-600 border-4 border-white/50 shadow-xl active:scale-95 transition-transform"
                    onClick={handleFire}
                    disabled={!selectedItem}
                >
                    USAR
                </Button>
            </div>
        </>
    );
}
