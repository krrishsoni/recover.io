import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  gradient?: 'purple' | 'green' | 'red' | 'blue' | 'pink' | 'none';
  padding?: 'sm' | 'md' | 'lg';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
  gradient = 'none',
  padding = 'md'
}) => {
  const gradientClasses = {
    purple: 'from-purple-500/5 to-pink-500/5',
    green: 'from-green-500/5 to-emerald-500/5',
    red: 'from-red-500/5 to-orange-500/5',
    blue: 'from-blue-500/5 to-cyan-500/5',
    pink: 'from-pink-500/5 to-rose-500/5',
    none: ''
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        backdrop-blur-xl bg-white/70
        border border-white/30
        rounded-3xl
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
        ${hover ? 'hover:shadow-[0_16px_48px_0_rgba(31,38,135,0.15)] transition-all duration-500' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      {gradient !== 'none' && (
        <div className={`
          absolute inset-0 bg-gradient-to-br ${gradientClasses[gradient]}
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none
        `} />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
