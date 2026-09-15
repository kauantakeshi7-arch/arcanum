import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: CSSProperties;
  className?: string;
}

// Placeholder animado (shimmer) para substituir o "Carregando…" cru
// enquanto dados reais chegam do Supabase. Ver .skeleton em tokens.css.
export function Skeleton({ width = '100%', height = 16, radius, style, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

// Porte comum: uma "linha" de texto fake, usada em listas (feed, DMs, covens).
export function SkeletonText({ width = '100%', style }: { width?: string | number; style?: CSSProperties }) {
  return <Skeleton width={width} height={12} radius={4} style={style} />;
}

// Placeholder de um card de post/coven/conversa: avatar + duas linhas.
export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <Skeleton width={40} height={40} radius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SkeletonText width="55%" />
        <SkeletonText width="85%" />
      </div>
    </div>
  );
}
