'use client';

import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    return (
        <div className="p-6 space-y-8 pb-20">
            <header className="flex flex-col items-center gap-4 pt-8">
                <div className="w-24 h-24 rounded-full bg-stone-800 flex items-center justify-center border-4 border-stone-700 shadow-xl">
                    <User className="w-12 h-12 text-stone-400" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-wider text-primary">Caçador Desconhecido</h1>
                    <p className="text-sm text-muted-foreground">Nível 1 • Novato</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Settings className="w-4 h-4" /> Configurações</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Sons</span>
                            <span className="text-xs text-muted-foreground">Ligado</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Sensibilidade AR</span>
                            <span className="text-xs text-muted-foreground">Média</span>
                        </div>
                    </div>
                </div>

                <Button variant="destructive" className="w-full gap-2">
                    <LogOut className="w-4 h-4" /> Sair da Conta
                </Button>
            </div>
        </div>
    );
}
