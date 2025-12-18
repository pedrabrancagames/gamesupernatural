'use client';

import dynamic from 'next/dynamic';

const GameMap = dynamic(() => import('@/components/map/GameMap'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full min-h-[80vh] bg-stone-900 text-stone-500">Caregando Mapa...</div>
});

export default function MapPage() {
    return (
        <div className="flex-1 h-full w-full absolute inset-0 pb-16">
            <GameMap />
        </div>
    );
}
