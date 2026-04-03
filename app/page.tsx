'use client';

import { useMemo } from "react";
import { Eye } from "../classes";
import { LinkButton } from "../components";
import { EyesCanvas } from "../components/EyesCanvas";
import { useViewport } from "../hooks/client";
import { getDefaultEyes } from "../utils/canvas";

export default function Home() {
  const { width, height } = useViewport();

  const eyes = useMemo(() => {
    return new Map<string, Eye>(getDefaultEyes({ width, height }).map((eye) => [eye.id, eye]));
  }, [width, height]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="absolute left-0 top-2/3 w-full flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="font-serif text-7xl mx-auto font-semibold leading-10 tracking-widest text-black dark:text-zinc-50">camaleones</h1>
          <p className="max-w-md text-lg leading-8 mx-auto text-zinc-600 dark:text-zinc-400">Nuevo disco. Julio de 2026.</p>
          <LinkButton href="/projects/camaleones" className="mx-auto">Saber más</LinkButton>
        </div>
      </main>
      <EyesCanvas className="absolute -z-10 top-0 left-0" eyesById={eyes} width={width} height={height} />
    </div>
  );
}
