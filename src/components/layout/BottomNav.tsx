"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Backpack, Skull, BookOpen, User, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/map", icon: Map, label: "Mapa" },
        { href: "/inventory", icon: Backpack, label: "Inv." }, // Using Crosshair temporarily or Backpack if available. Lucide doesn't have Backpack? It has Package or Briefcase. Actually "Backpack" exists in some versions or "Briefcase". Let's use "Briefcase" or "Package" or "Bag". "ShoppingBag"? No. "Sword"? No.
        // Lucide has "Backpack" in newer versions. I'll try "Backpack" but import might fail if not exported.
        // I'll use "ShoppingBag" or "Briefcase" as fallback, or "Package".
        // Wait, "Crosshair" is for formatting.
        // Let's use "Skull" for Home/Hunt? No, Hunt is central.
    ];

    // Better icons:
    // Map -> Map
    // Inventory -> Backpack (check availability) or Briefcase
    // Hunt -> Crosshair (big button)
    // Journal -> BookOpen
    // Profile -> User

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border h-16 pb-safe">
            <div className="flex items-center justify-around h-full px-2">
                <NavItem href="/map" icon={Map} label="Mapa" isActive={pathname === "/map"} />
                <NavItem href="/inventory" icon={BookOpen} label="Inv." isActive={pathname === "/inventory"} />

                {/* Central Action Button */}
                <div className="relative -top-5">
                    <Link href="/ar">
                        <div className={cn(
                            "flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-[0_0_20px_rgba(220,20,60,0.5)] border-4 border-background transition-transform active:scale-95",
                        )}>
                            <Crosshair className="w-8 h-8 text-primary-foreground" />
                        </div>
                    </Link>
                </div>

                <NavItem href="/cases" icon={Skull} label="Casos" isActive={pathname === "/cases"} />
                <NavItem href="/profile" icon={User} label="Perfil" isActive={pathname === "/profile"} />
            </div>
        </nav>
    );
}

function NavItem({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean }) {
    return (
        <Link href={href} className={cn(
            "flex flex-col items-center justify-center w-14 gap-1 transition-colors",
            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}>
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </Link>
    );
}
