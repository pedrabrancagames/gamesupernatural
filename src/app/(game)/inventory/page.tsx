'use client';

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Shield, Sword, Hammer, Zap } from "lucide-react";

export default function InventoryPage() {
    const { inventory, loadout, equipItem, unequipItem } = useGame();

    const handleToggle = (id: string) => {
        if (loadout.includes(id)) {
            unequipItem(id);
        } else {
            equipItem(id);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'weapon': return Sword;
            case 'ammo': return Zap; // Or Bullet icon
            case 'material': return Hammer;
            default: return Shield;
        }
    }

    return (
        <div className="p-6 pb-24 space-y-6">
            <header>
                <h1 className="text-2xl font-bold uppercase tracking-wider text-amber-500">Mochila</h1>
                <p className="text-muted-foreground text-sm">Selecione até 3 itens para a caçada.</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {inventory.map((item) => {
                    const Icon = getTypeIcon(item.type);
                    const isSelected = loadout.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleToggle(item.id)}
                            className={cn(
                                "relative p-4 rounded-xl border bg-card transition-all cursor-pointer hover:border-primary/50",
                                isSelected ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(220,20,60,0.2)]" : "border-border"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                                    <Check className="w-3 h-3" />
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center border border-white/10">
                                    <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                                </div>
                                <div>
                                    <h3 className={cn("font-bold text-sm", isSelected ? "text-white" : "text-foreground")}>{item.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.type}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-20 left-6 right-6">
                <div className="bg-stone-900/90 backdrop-blur border border-stone-700 p-4 rounded-lg flex justify-between items-center shadow-2xl">
                    <span className="text-sm font-medium text-stone-300">Equipados:</span>
                    <div className="flex gap-2">
                        {/* Slots */}
                        {[0, 1, 2].map(i => (
                            <div key={i} className={cn("w-8 h-8 rounded border flex items-center justify-center bg-black/50", loadout[i] ? "border-primary" : "border-stone-600")}>
                                {loadout[i] && <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
