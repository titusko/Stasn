interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <h1 className="font-display text-4xl tracking-wider bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" style={{ textShadow: '2px 2px 4px rgba(236, 72, 153, 0.3)' }}>
        MONNIVERSE
      </h1>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 blur-xl -z-10" />
    </div>
  );
} 