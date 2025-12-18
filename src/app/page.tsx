'use client';

import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black overflow-hidden relative">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center gap-8 max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center justify-center p-6 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-[0_0_30px_rgba(220,20,60,0.3)]">
            <Skull className="w-16 h-16 text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-[family-name:var(--font-sans)] uppercase drop-shadow-sm">
            Hunters
            <span className="block text-xl font-normal text-primary tracking-widest mt-1">Web AR</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-sm max-w-[80%] mx-auto">
            Junte-se à caçada. Rastreie monstros no mundo real usando realidade aumentada.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="w-full"
        >
          <div className="flex flex-col gap-4 w-full px-8">
            <Link href="/home" className="w-full">
              <Button size="lg" className="w-full text-lg font-bold shadow-lg shadow-primary/20 border border-primary/50 hover:shadow-primary/40 h-14">
                ENTRAR NA CAÇADA
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground">
              Projeto Winchester • v0.1.0
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
