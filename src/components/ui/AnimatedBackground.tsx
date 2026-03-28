import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'blobs' | 'mesh' | 'aurora' | 'gradient';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ variant = 'blobs' }) => {
  if (variant === 'blobs') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/50 to-pink-50/50" />
        
        {/* Animated blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    );
  }

  if (variant === 'mesh') {
    return (
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(at 40% 20%, hsla(280, 100%, 74%, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.15) 0px, transparent 50%),
              radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 50%, hsla(240, 100%, 70%, 0.1) 0px, transparent 50%),
              radial-gradient(at 0% 100%, hsla(22, 100%, 77%, 0.15) 0px, transparent 50%),
              linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)
            `
          }}
        />
      </div>
    );
  }

  if (variant === 'aurora') {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-cyan-50" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(180deg, transparent 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%),
              linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.1) 50%, transparent 100%)
            `,
            animation: 'gradient-shift 8s ease infinite'
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPgo8L3N2Zz4=')] opacity-50" />
    </div>
  );
};

export default AnimatedBackground;
