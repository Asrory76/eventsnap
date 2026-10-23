"use client";

import { useEffect, useRef } from "react";

/**
 * 3D Hero Object as described in DESIGN.md:
 * "A rendered 3D cube or geometric form floating in the center of the viewport,
 * with a reflective wet-floor effect beneath. This is the only source of color and
 * light in the system — it can glow blue, cyan, violet, or warm white.
 * The object occupies the visual center while text wraps around or overlays it."
 */
export default function Hero3DObject() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Cube vertices (-1 to 1)
    const vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];

    // Edges connecting vertices
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back
      [4, 5], [5, 6], [6, 7], [7, 4], // front
      [0, 4], [1, 5], [2, 6], [3, 7], // cross
    ];

    // Faces for translucent shading
    const faces = [
      [0, 1, 2, 3], // back
      [4, 5, 6, 7], // front
      [0, 1, 5, 4], // bottom
      [2, 3, 7, 6], // top
      [0, 3, 7, 4], // left
      [1, 2, 6, 5], // right
    ];

    let angleX = 0.4;
    let angleY = 0.6;
    let angleZ = 0.2;
    let mouseX = 0;
    let mouseY = 0;
    let targetAngleX = 0.4;
    let targetAngleY = 0.6;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x / rect.width;
      mouseY = y / rect.height;
      targetAngleY = mouseX * 1.5;
      targetAngleX = mouseY * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 3D rotation projection helper
    function project(
      x: number,
      y: number,
      z: number,
      rotX: number,
      rotY: number,
      rotZ: number,
      scale: number,
      cx: number,
      cy: number
    ) {
      // Rotation Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      let x1 = x * cosY + z * sinY;
      let y1 = y;
      let z1 = -x * sinY + z * cosY;

      // Rotation X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Rotation Z
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      // Perspective divide
      const fov = 3.2;
      const pz = z3 + fov;
      const px = (x3 / pz) * scale + cx;
      const py = (y3 / pz) * scale + cy;

      return { x: px, y: py, z: z3 };
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      angleY += (targetAngleY + time * 0.4 - angleY) * 0.05;
      angleX += (targetAngleX + 0.3 - angleX) * 0.05;
      angleZ = Math.sin(time * 0.5) * 0.15;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      // Float cube slightly above center
      const floatY = Math.sin(time * 1.8) * 12;
      const cy = height * 0.42 + floatY;
      const cubeScale = Math.min(width, height) * 0.52;

      // Floor level
      const floorY = height * 0.72;

      // 1. Draw wet floor ambient specular reflection & perspective lines
      const floorGrad = ctx.createLinearGradient(0, floorY - 30, 0, height);
      floorGrad.addColorStop(0, "rgba(0, 242, 254, 0.06)");
      floorGrad.addColorStop(0.3, "rgba(112, 0, 255, 0.04)");
      floorGrad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY - 20, width, height - (floorY - 20));

      // Perspective grid floor lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      for (let i = -6; i <= 6; i++) {
        const xStart = cx + i * 28;
        const xEnd = cx + i * 160;
        ctx.beginPath();
        ctx.moveTo(xStart, floorY);
        ctx.lineTo(xEnd, height);
        ctx.stroke();
      }
      for (let j = 0; j < 4; j++) {
        const py = floorY + (height - floorY) * Math.pow((j + 1) / 4, 1.8);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }

      // 2. Wet floor reflection of the floating cube (inverted & blurred/faded)
      const refCy = floorY + (floorY - cy) * 0.7;
      const refProj = vertices.map(([vx, vy, vz]) =>
        project(vx, -vy, vz, -angleX, angleY, angleZ, cubeScale * 0.7, cx, refCy)
      );

      ctx.save();
      // Mask to only floor area
      ctx.beginPath();
      ctx.rect(0, floorY, width, height - floorY);
      ctx.clip();

      // Render inverted reflected faces
      faces.forEach((f) => {
        ctx.beginPath();
        ctx.moveTo(refProj[f[0]].x, refProj[f[0]].y);
        for (let i = 1; i < f.length; i++) {
          ctx.lineTo(refProj[f[i]].x, refProj[f[i]].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 242, 254, 0.04)";
        ctx.fill();
      });

      // Render inverted reflected edges
      ctx.strokeStyle = "rgba(0, 242, 254, 0.16)";
      ctx.lineWidth = 1;
      edges.forEach(([i1, i2]) => {
        ctx.beginPath();
        ctx.moveTo(refProj[i1].x, refProj[i1].y);
        ctx.lineTo(refProj[i2].x, refProj[i2].y);
        ctx.stroke();
      });
      ctx.restore();

      // 3. Central glowing aura in void (the only chromatic moment)
      const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, cubeScale * 1.2);
      glowGrad.addColorStop(0, "rgba(0, 242, 254, 0.22)");
      glowGrad.addColorStop(0.35, "rgba(138, 43, 226, 0.18)");
      glowGrad.addColorStop(0.7, "rgba(30, 0, 70, 0.08)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cubeScale * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Primary Floating 3D Cube
      const projected = vertices.map(([vx, vy, vz]) =>
        project(vx, vy, vz, angleX, angleY, angleZ, cubeScale, cx, cy)
      );

      // Sort faces by depth
      const faceDepths = faces.map((faceIndices) => {
        const avgZ =
          faceIndices.reduce((sum, idx) => sum + projected[idx].z, 0) /
          faceIndices.length;
        return { faceIndices, avgZ };
      });
      faceDepths.sort((a, b) => b.avgZ - a.avgZ);

      // Draw cube faces (holographic translucent crystal glass)
      faceDepths.forEach(({ faceIndices }, i) => {
        ctx.beginPath();
        ctx.moveTo(projected[faceIndices[0]].x, projected[faceIndices[0]].y);
        for (let j = 1; j < faceIndices.length; j++) {
          ctx.lineTo(projected[faceIndices[j]].x, projected[faceIndices[j]].y);
        }
        ctx.closePath();

        // Facet color shimmer (cyan to violet)
        const alpha = 0.06 + (i / faces.length) * 0.08;
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(0, 242, 254, ${alpha})`
            : `rgba(180, 70, 255, ${alpha * 1.2})`;
        ctx.fill();
      });

      // Draw wireframe sharp edges (White + cyan chromatic glow)
      ctx.lineWidth = 1.2;
      edges.forEach(([i1, i2]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i1].x, projected[i1].y);
        ctx.lineTo(projected[i2].x, projected[i2].y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.stroke();
      });

      // Inner glowing core geometry (holographic inner prism)
      const innerScale = cubeScale * 0.45;
      const innerProjected = vertices.map(([vx, vy, vz]) =>
        project(vx, vy, vz, -angleX * 1.5, angleY * 1.5, angleZ, innerScale, cx, cy)
      );

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 242, 254, 0.7)";
      edges.forEach(([i1, i2]) => {
        ctx.beginPath();
        ctx.moveTo(innerProjected[i1].x, innerProjected[i1].y);
        ctx.lineTo(innerProjected[i2].x, innerProjected[i2].y);
        ctx.stroke();
      });

      // Vertex corner pins (sharp technical markers)
      projected.forEach((p) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] flex items-center justify-center overflow-hidden pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
