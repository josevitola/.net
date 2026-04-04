'use client';

import { useMemo } from "react";
import { EyesCanvas, LinkButton } from "../components";
import { useViewport } from "../hooks/client";
import { generateEyeList } from "@/utils/eyes";
import { useEyeControlledImages } from "./hooks/useEyeAssets";
import { ImageEye } from "@/classes";

export default function Home() {
  const { width, height } = useViewport();
  const { assets, ready } = useEyeControlledImages();

  const eyeList = useMemo<ImageEye[]>(() => {
    if (!ready) return [];

    return generateEyeList({
      count: 30,
      assets,
      canvasWidth: width,
      canvasHeight: height,
      mode: 'random'
    });
  }, [width, height, ready, assets]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="absolute left-0 top-2/3 w-full flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="font-serif text-7xl mx-auto font-semibold leading-10 tracking-widest text-primary-active">camaleones</h1>
          <p className="max-w-md text-lg leading-8 mx-auto text-primary"><strong>Nuevo disco. Julio de 2026.</strong></p>
          <LinkButton href="/projects/camaleones" className="mx-auto">Saber más</LinkButton>
        </div>
      </main>
      <EyesCanvas className="absolute -z-10 top-0 left-0" eyeList={eyeList} width={width} height={height} />
    </div>
  );
}
