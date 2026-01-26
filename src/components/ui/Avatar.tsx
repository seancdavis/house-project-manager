import type { ReactNode } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  initials?: string;
  color?: string;
  size?: AvatarSize;
  src?: string;
  alt?: string;
}

const sizeConfig: Record<AvatarSize, { size: string; fontSize: string }> = {
  xs: { size: '24px', fontSize: '0.625rem' },
  sm: { size: '32px', fontSize: '0.75rem' },
  md: { size: '40px', fontSize: '0.875rem' },
  lg: { size: '48px', fontSize: '1rem' },
  xl: { size: '64px', fontSize: '1.25rem' },
};

export function Avatar({
  initials,
  color = 'var(--color-primary-500)',
  size = 'md',
  src,
  alt,
}: AvatarProps) {
  const { size: avatarSize, fontSize } = sizeConfig[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
}

export function AvatarGroup({ children, max = 4 }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = childArray.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((child, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? '-8px' : 0,
            position: 'relative',
            zIndex: visible.length - index,
          }}
        >
          <div style={{
            borderRadius: '50%',
            border: '2px solid var(--bg-card)',
          }}>
            {child}
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: '-8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-stone-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-stone-600)',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '2px solid var(--bg-card)',
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
