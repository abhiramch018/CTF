import { useEffect, useRef } from "react";

type AtmosphereProps = {
  reducedMotion: boolean;
};

type Speck = {
  x: number;
  y: number;
  depth: number;
  size: number;
  speed: number;
  tone: number;
};

function lowPower() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return window.innerWidth < 760 || cores <= 4 || memory <= 4 || document.documentElement.classList.contains("perf-lite");
}

export function Atmosphere({ reducedMotion }: AtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const pointer = { x: 0.5, y: 0.35 };
    let frame = 0;
    let running = true;
    const specks: Speck[] = [];

    const seed = (count: number) => {
      specks.length = 0;
      for (let index = 0; index < count; index += 1) {
        specks.push({
          x: Math.random(),
          y: Math.random(),
          depth: 0.25 + Math.random() * 0.75,
          size: 0.8 + Math.random() * 1.4,
          speed: 0.006 + Math.random() * 0.016,
          tone: Math.random(),
        });
      }
    };

    const resize = () => {
      const lite = lowPower();
      const scale = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.25);
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      seed(lite ? 18 : 48);
    };

    const paint = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const lite = lowPower();
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - height);
      const depth = Math.min(1, window.scrollY / scrollMax);
      const life = Math.sin(depth * Math.PI);
      const presence = 0.16 + life * 0.7;
      const calm = reducedMotion || document.body.classList.contains("intro-lock");
      context.clearRect(0, 0, width, height);

      const fog = context.createLinearGradient(0, height * 0.3, 0, height);
      fog.addColorStop(0, `rgba(1, 6, 4, ${0.02 + presence * 0.04})`);
      fog.addColorStop(1, `rgba(5, 61, 36, ${0.06 + life * 0.1})`);
      context.fillStyle = fog;
      context.fillRect(0, 0, width, height);

      const drift = calm ? 0 : time * 0.00003 + window.scrollY * 0.00012;
      context.save();
      const ray = context.createLinearGradient(width * 0.5, height * 0.12, width * 0.5, height * 0.7);
      ray.addColorStop(0, "rgba(82, 255, 154, 0)");
      ray.addColorStop(0.4, `rgba(0, 240, 122, ${0.08 + presence * 0.08})`);
      ray.addColorStop(1, "rgba(1, 6, 4, 0)");
      context.fillStyle = ray;
      context.beginPath();
      context.moveTo(width * (0.44 + drift), height * 0.16);
      context.lineTo(width * (0.56 - drift), height * 0.16);
      context.lineTo(width * 0.7, height * 0.76);
      context.lineTo(width * 0.3, height * 0.76);
      context.closePath();
      context.fill();
      context.restore();

      context.save();
      context.globalAlpha = 0.045 + presence * 0.03;
      context.strokeStyle = "rgba(181, 255, 224, 0.8)";
      context.lineWidth = 1;
      const scan = calm ? 36 : (time * 0.018 + window.scrollY * 0.04) % 56;
      for (let row = 0; row < 4; row += 1) {
        const y = (row * 56 + scan) % height;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();

      if (!calm && !lite) {
        context.save();
        context.strokeStyle = "rgba(181, 255, 224, 0.45)";
        context.globalAlpha = 0.16 + life * 0.12;
        context.lineWidth = 1;
        for (let mark = 0; mark < 4; mark += 1) {
          const x = width * (0.08 + mark * 0.28) + Math.sin(time * 0.0002 + mark) * 8;
          const y = height * (0.22 + ((mark * 0.17 + depth) % 0.5));
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 10, y + 4);
          context.moveTo(x + 4, y - 6);
          context.lineTo(x + 4, y + 8);
          context.moveTo(x + 8, y);
          context.lineTo(x + 14, y - 5);
          context.stroke();
        }
        context.restore();
      }

      for (const speck of specks) {
        if (!calm) {
          speck.y -= speck.speed * speck.depth * 0.22;
          if (speck.y < -0.02) speck.y = 1.02;
        }
        const parallax = (window.scrollY * speck.depth * 0.3) % height;
        const x = speck.x * width + (pointer.x - 0.5) * 12 * speck.depth;
        const y = (speck.y * height + parallax) % height;
        const alpha = (0.18 + speck.depth * 0.35) * (0.3 + presence * 0.7);
        context.fillStyle = speck.tone > 0.8 ? `rgba(181, 255, 224, ${alpha})` : `rgba(0, 240, 122, ${alpha * 0.8})`;
        context.beginPath();
        context.arc(x, y, speck.size * 0.65, 0, Math.PI * 2);
        context.fill();
      }

      if (!calm && !lite && Math.floor(time / 8000) % 2 === 0) {
        const pulse = (time % 8000) / 8000;
        context.beginPath();
        context.strokeStyle = `rgba(82, 255, 154, ${(0.1 + life * 0.1) * (1 - pulse)})`;
        context.lineWidth = 1;
        context.arc(width * 0.5, height * 0.42, 28 + pulse * 110, 0, Math.PI * 2);
        context.stroke();
      }
    };

    const loop = (time: number) => {
      if (!running) return;
      if (!document.hidden) paint(time);
      frame = window.requestAnimationFrame(loop);
    };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / Math.max(1, window.innerWidth);
      pointer.y = event.clientY / Math.max(1, window.innerHeight);
    };
    const onVisibility = () => {
      if (!document.hidden && !reducedMotion && frame === 0) frame = window.requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    if (reducedMotion) paint(0);
    else frame = window.requestAnimationFrame(loop);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="atmosphere" aria-hidden="true" />;
}
