'use client';

import { createContext, useContext, useState } from 'react';
import { ITEMS, MONSTERS } from '@/lib/constants';

interface GameContextType {
    inventory: typeof ITEMS; // User's owned items
    loadout: string[]; // IDs of selected items for AR
    equipItem: (itemId: string) => void;
    unequipItem: (itemId: string) => void;
}

const GameContext = createContext<GameContextType>({
    inventory: [],
    loadout: [],
    equipItem: () => { },
    unequipItem: () => { },
});

export function GameProvider({ children }: { children: React.ReactNode }) {
    // Mock: User owns all items for now
    const [inventory] = useState(ITEMS);
    const [loadout, setLoadout] = useState<string[]>([]);

    const equipItem = (itemId: string) => {
        if (loadout.length >= 3) return; // Limit 3 items
        if (!loadout.includes(itemId)) {
            setLoadout([...loadout, itemId]);
        }
    };

    const unequipItem = (itemId: string) => {
        setLoadout(loadout.filter(id => id !== itemId));
    };

    return (
        <GameContext.Provider value={{ inventory, loadout, equipItem, unequipItem }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
