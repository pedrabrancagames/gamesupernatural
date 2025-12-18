'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const ARView = dynamic(() => import('@/components/ar/ARView'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen bg-black text-white">Iniciando Sensores...</div>
});

function ARContent() {
    const searchParams = useSearchParams();
    const monsterId = searchParams.get('monsterId');

    return <ARView monsterId={monsterId} />;
}

export default function ARPage() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-black relative">
            <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-white">Carregando Caçada...</div>}>
                <ARContent />
            </Suspense>
        </div>
    );
}
