import { BottomNav } from "@/components/layout/BottomNav";

export default function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen pb-16">
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
