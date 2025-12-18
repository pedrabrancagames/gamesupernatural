'use client';

import { LucideIcon, Map, Crosshair, BookOpen, Skull, User, ScrollText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomePage() {
    const menuItems = [
        { label: "Iniciar Caçada", href: "/ar", icon: Crosshair, color: "bg-red-900/40 text-red-500", border: "border-red-900" },
        { label: "Mapa Global", href: "/map", icon: Map, color: "bg-blue-900/40 text-blue-400", border: "border-blue-900" },
        { label: "Inventário", href: "/inventory", icon: BookOpen, color: "bg-amber-900/40 text-amber-500", border: "border-amber-900" },
        { label: "Bestiário", href: "/cases", icon: Skull, color: "bg-stone-800/60 text-stone-400", border: "border-stone-700" },
        { label: "Diário", href: "/journal", icon: ScrollText, color: "bg-stone-800/60 text-stone-400", border: "border-stone-700" },
        { label: "Perfil", href: "/profile", icon: User, color: "bg-stone-800/60 text-stone-400", border: "border-stone-700" },
    ];

    return (
        <div className="p-6 space-y-8">
            <header className="flex flex-col gap-2 pt-8">
                <h1 className="text-3xl font-bold tracking-tighter uppercase text-primary">Base de Operações</h1>
                <p className="text-muted-foreground">Bem-vindo, Caçador.</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                    <MenuCard key={item.label} {...item} index={index} />
                ))}
            </div>
        </div>
    );
}

function MenuCard({ label, href, icon: Icon, color, border, index }: { label: string; href: string; icon: LucideIcon; color: string; border: string; index: number }) {
    const isLarge = index === 0; // First item full width? No, grid-cols-2.
    // Maybe first item spans 2 cols?

    return (
        <Link href={href} className={cn(
            "group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-95",
            color,
            border,
            (label === "Iniciar Caçada") && "col-span-2 py-10" // Make main action bigger
        )}>
            <Icon className={cn("w-8 h-8", label === "Iniciar Caçada" ? "w-12 h-12" : "")} />
            <span className="font-bold tracking-wide uppercase text-sm">{label}</span>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50"></div>
        </Link>
    );
}
