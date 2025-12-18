'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const ARView = dynamic(() => import('@/components/ar/ARView'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen bg-black text-white">Iniciando Sensores...</div>
});

export default function ARPage() {
    const searchParams = useSearchParams();
    const monsterId = searchParams.get('monsterId');

    return (
        <div className="h-screen w-screen overflow-hidden bg-black relative">
            <ARView monsterId={monsterId} />
        </div>
    );
}
