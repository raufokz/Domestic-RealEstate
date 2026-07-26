"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SignaturePadProps {
  width?: number;
  height?: number;
  onSign?: (dataUrl: string) => void;
  disabled?: boolean;
}

export default function SignaturePad({ width = 500, height = 200, onSign, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getDevicePixelRatio = () => {
    if (typeof window === "undefined") return 1;
    return Math.max(window.devicePixelRatio || 1, 2);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = getDevicePixelRatio();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0A2647";
  }, [width, height]);

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as PointerEvent).clientX - rect.left, y: (e as PointerEvent).clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pos = getPos(e);
    lastPoint.current = pos;
  }, [disabled, getPos]);

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    const last = lastPoint.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPoint.current = pos;
    setHasSignature(true);
  }, [isDrawing, disabled, getPos]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = getDevicePixelRatio();
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
  }, []);

  const sign = useCallback(() => {
    if (!hasSignature || !onSign) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSign(dataUrl);
  }, [hasSignature, onSign]);

  return (
    <div className="space-y-3">
      <div className={`relative rounded-xl border-2 ${disabled ? "border-slate-200 bg-slate-50" : "border-slate-300 hover:border-gold/50"} transition-colors overflow-hidden`}>
        <canvas
          ref={canvasRef}
          className={`block w-full touch-none ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
          style={{ width, height, maxWidth: "100%" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          onPointerCancel={stopDraw}
        />
        {!hasSignature && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-sm">Sign above</p>
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 text-sm font-medium">Locked — already signed</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Draw with mouse, finger, or stylus
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            disabled={disabled || !hasSignature}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          {onSign && (
            <button
              type="button"
              onClick={sign}
              disabled={disabled || !hasSignature}
              className="px-6 py-2 text-sm font-semibold text-navy-900 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg hover:shadow-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sign & Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
