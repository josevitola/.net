'use client';

import { useCallback, useMemo, useState } from 'react';
import { Canvas } from '@/components';
import { DEFAULT_BLINK_PROB, Colors } from './EyesCanvas.constants';
import { Eye, Point } from '@/classes';
import { useMousePos } from '@/hooks/client';
import useGlobalContext from '@/hooks/client/useGlobalContext/useGlobalContext';

interface EyesCanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  eyeList: Eye[];
  width: number;
  height: number;
}

const { selectEye, selectedEye } = {
  selectedEye: null as Eye | null,
  selectEye: (eye: Eye | null) => { },
}

const EyesCanvas = ({ eyeList, height, width, ...rest }: EyesCanvasProps) => {
  const [mouseDown, setMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const mousePos = useMousePos();
  const { isEditing } = useGlobalContext();

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = Colors.BACKGROUND;
      ctx.fillRect(0, 0, width, height);
    },
    [width, height],
  );

  const mouseInfo = useMemo(() => ({
    position: mousePos,
    windowHeight: height,
    windowWidth: width,
  }), [mousePos, height, width]);

  const shouldApplyMouseEventsToEye = useCallback(
    (ctx: CanvasRenderingContext2D, eye: Eye): boolean => {
      if (!isEditing) {
        return false;
      }

      let isHovered = eye.isHovered(ctx, mousePos);

      if (mouseDown) {
        if (isHovered && !isDragging) {
          eye.onDragStart(ctx, mousePos);
          setIsDragging(true);
        }

        if (eye.dragMode) {
          eye.onDrag(mousePos);
        }
      } else if (eye.dragMode) {
        setIsDragging(false);
        eye.onDragEnd();
      }

      return isHovered;
    },
    [isEditing, mouseDown, mousePos],
  );

  const drawEyes = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      let hovered = false;

      eyeList.forEach((eye) => {
        if (frame > 50) {
          if (Math.random() < DEFAULT_BLINK_PROB) {
            eye.startBlinking();
          }

          eye.updateBlink();
        }

        eye.update(ctx, { mouseInfo, debug: isEditing });

        if (eye.id === selectedEye?.id) {
          eye.drawInternalBox(ctx);
        }

        hovered = shouldApplyMouseEventsToEye(ctx, eye) || hovered;
      });

      if (!hovered) {
        ctx.canvas.style.cursor = '';
      }
    },
    [eyeList, mouseInfo, isEditing],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      drawBackground(ctx);
      drawEyes(ctx, frame);
    },
    [drawBackground, drawEyes],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setMouseDown(true);
      const canvas = e.target as HTMLCanvasElement;

      if (!isEditing) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const p = new Point(e.clientX - rect.left, e.clientY - rect.top);

      let selectedEye = null;

      eyeList.forEach((eye) => {
        if (eye.isHovered(canvas.getContext('2d')!, p)) {
          selectedEye = eye;
        }
      });

      selectEye(selectedEye);
    },
    [eyeList, selectEye],
  );

  const onMouseUp = useCallback(() => {
    setMouseDown(false);
  }, []);

  return (
    <Canvas
      animation={true}
      {...rest}
      width={width}
      height={height}
      draw={draw}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    ></Canvas>
  );
};

export default EyesCanvas;
