'use client';

import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <GameProvider>
                {children}
            </GameProvider>
        </AuthProvider>
    );
}
