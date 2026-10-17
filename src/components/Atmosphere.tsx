import { useEffect, useRef } from "react";

type AtmosphereProps = {
  reducedMotion: boolean;
};

export function Atmosphere({ reducedMotion }: AtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    let frame = 0;
    let running = true;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const paint = (time: number) => {
      if (!running) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      const shade = context.createLinearGradient(0, height * 0.62, 0, height);
      shade.addColorStop(0, "rgba(2, 5, 4, 0)");
      shade.addColorStop(1, "rgba(2, 5, 4, 0.28)");
      context.fillStyle = shade;
      context.fillRect(0, 0, width, height);

      if (!reducedMotion) {
        const cycle = (time % 9000) / 9000;
        if (cycle < 0.08) {
          const y = cycle / 0.08 * height;
          context.strokeStyle = "rgba(166, 255, 209, 0.16)";
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }
      }

      frame = window.requestAnimationFrame(paint);
    };

    resize();
    frame = window.requestAnimationFrame(paint);
    window.addEventListener("resize", resize);
    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="atmosphere" />;
}
