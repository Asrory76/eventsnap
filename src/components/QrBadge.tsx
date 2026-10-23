"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  size?: number;
};

export default function QrBadge({ value, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (err) => {
        if (err) console.error("QR render gagal:", err);
      }
    );
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
}
