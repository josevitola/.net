'use client';

import { Point } from "@/classes";
import { useEffect, useState } from "react";

export function useMousePos(): Point {
  const [mousePos, setMousePos] = useState(new Point(0, 0));

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos(new Point(event.clientX, event.clientY));
    };

    globalThis.addEventListener('mousemove', handleMouseMove);

    return () => {
      globalThis.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return mousePos;
}