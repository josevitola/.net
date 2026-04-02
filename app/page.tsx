'use client';

import { useMemo } from "react";
import { Eye } from "./classes";
import { Button } from "./components";
import { EyesCanvas } from "./components/EyesCanvas";
import { useViewport } from "./hooks/client";

export default function Home() {
  const { width, height } = useViewport();

  const eyes = useMemo(() => {
    const eye1 = new Eye(100, 100, 30, { lineWidth: 2, id: '1' });
    const eye2 = new Eye(200, 100, 30, { lineWidth: 2, id: '2' });
    const eye3 = new Eye(300, 100, 30, { lineWidth: 2, id: '3' });

    return new Map<string, Eye>([
      ['1', eye1],
      ['2', eye2],
      ['3', eye3],
    ]);
  }, []);

  return (
    <div className="-z-10 flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="font-serif max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">Camaleones</h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">Nuevo disco. Julio de 2026.</p>
        </div>
        <EyesCanvas className="absolute -z-10 top-0 left-0" eyesById={eyes} width={width} height={height} />
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button href="/projects/camaleones">Saber más</Button>
        </div>
      </main>
    </div>
  );
}
