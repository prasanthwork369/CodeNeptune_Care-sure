import React from "react";
import { PARTICLE_CONFIGS, SmokeParticle } from "./SmokeParticle";

interface SmokePuffProps {
  active: boolean;
  /** Half the host circle's size, so particles emit from its middle. */
  center?: number;
  firstColor?: string;
  secondColor?: string;
}

// Two staggered waves; the second drifts further up so the puff thins as it rises.
export const SmokePuff: React.FC<SmokePuffProps> = ({
  active,
  center = 18,
  firstColor = "#22C55E",
  secondColor = "#F1F5F9",
}) => {
  if (!active) return null;

  return (
    <>
      {PARTICLE_CONFIGS.map((p, idx) => (
        <SmokeParticle
          key={`first-${idx}`}
          dx={p.dx}
          dy={p.dy}
          size={p.size}
          color={firstColor}
          delay={p.delay}
          duration={320}
          startTrigger
          upwardDrift={12}
          zIndex={5}
          center={center}
        />
      ))}

      {PARTICLE_CONFIGS.map((p, idx) => (
        <SmokeParticle
          key={`second-${idx}`}
          dx={p.dx}
          dy={p.dy}
          size={p.size * 0.9}
          color={secondColor}
          delay={p.delay + 220}
          duration={300}
          startTrigger
          upwardDrift={55}
          zIndex={5}
          center={center}
        />
      ))}
    </>
  );
};
