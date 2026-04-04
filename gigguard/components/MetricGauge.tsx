"use client";
import { useEffect, useRef } from "react";

export default function MetricGauge({
  value,
  max = 100,
  label,
  color = "#10b981",
  size = 120,
}: {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const pct = value / max;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 0.25;
    const totalArc = (2 * Math.PI - (startAngle - endAngle));

    ctx.clearRect(0, 0, size, size);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + totalArc);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();

    // Value arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + totalArc * pct);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center value
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${size * 0.2}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value.toString(), cx, cy - 8);

    // Label
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `${size * 0.1}px Inter, sans-serif`;
    ctx.fillText(label, cx, cy + size * 0.12);
  }, [value, max, label, color, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}
