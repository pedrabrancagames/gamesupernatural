'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { DeviceOrientationControls, PerspectiveCamera, Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Crosshair } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { MONSTERS, ITEMS } from '@/lib/constants';
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

function MonsterModel({ id, onHit, hp, maxHp }: { id: string | null, onHit: () => void, hp: number, maxHp: number }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Idle animation
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={[0, 0, -5]}>
            {/* HP Bar in 3D Space */}
            <Html position={[0, 1.5, 0]} center>
                <div className="w-32 h-2 bg-black/50 border border-white/20 rounded overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(hp / maxHp) * 100}%` }} />
                </div>
            </Html>

            <mesh
                ref={meshRef}
                onClick={onHit} // Simple click handler fallback
                userData={{ isMonster: true }}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={hp > 0 ? "red" : "gray"} />
            </mesh>
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
            const mat = (hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
            const oldColor = mat.color.getHex();
            mat.color.setHex(0xffffff);
            setTimeout(() => mat.color.setHex(oldColor), 100);

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
            <PerspectiveCamera makeDefault position={[0, 1.6, 0]} />
            <DeviceOrientationControls />
            <MonsterModel id={monsterId} onHit={() => { }} hp={monsterHp} maxHp={maxHp} />
        </>
    );
}

export default function ARView({ monsterId }: { monsterId: string | null }) {
    const [startAR, setStartAR] = useState(false);
    const { loadout, inventory } = useGame();
    const [selectedItem, setSelectedItem] = useState<string | null>(loadout[0] || null);
    const [message, setMessage] = useState("");
    const router = useRouter();

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

    const handleFire = () => {
        window.dispatchEvent(new Event('fire-weapon'));
    };

    if (!startAR) {
        return (
            <div className="flex flex-col items-center justify-center h-full z-50 relative bg-black/80 text-white p-8 text-center space-y-4">
                <h2 className="text-xl font-bold">Modo AR</h2>
                <p>Permita o acesso aos sensores.</p>
                <Button onClick={requestAccess} size="lg" className="bg-red-600">Iniciar</Button>
                <Link href="/home"><Button variant="outline" className="text-black">Voltar</Button></Link>
            </div>
        );
    }

    return (
        <>
            <CameraFeed />

            <div className="absolute inset-0 z-10 w-full h-full">
                <Canvas>
                    <CombatScene
                        monsterId={monsterId}
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
