'use client';

import { useMemo } from "react";
import { Eye } from "./classes";
import { Button } from "./components";
import { EyesCanvas } from "./components/EyesCanvas";
import { useViewport } from "./hooks/client";
import { getDefaultEyes } from "./utils/canvas";

export default function Home() {
  const { width, height } = useViewport();

  const eyes = useMemo(() => {
    return new Map<string, Eye>(getDefaultEyes({ width, height }).map((eye) => [eye.id, eye]));
  }, [width, height]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="font-serif max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">Camaleones</h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">Nuevo disco. Julio de 2026.</p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button href="/projects/camaleones">Saber más</Button>
        </div>
      </main>
      <EyesCanvas className="absolute -z-10 top-0 left-0" eyesById={eyes} width={width} height={height} />
    </div>
  );
}
