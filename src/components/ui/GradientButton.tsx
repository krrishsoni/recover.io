import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  icon?: ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  icon
}) => {
  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600
      bg-[length:200%_100%] bg-[position:0%_0%]
      hover:bg-[position:100%_0%]
      text-white
      shadow-xl shadow-purple-500/30
      hover:shadow-2xl hover:shadow-purple-500/40
    `,
    success: `
      bg-gradient-to-r from-green-500 via-emerald-500 to-green-500
      bg-[length:200%_100%] bg-[position:0%_0%]
      hover:bg-[position:100%_0%]
      text-white
      shadow-xl shadow-green-500/30
      hover:shadow-2xl hover:shadow-green-500/40
    `,
    danger: `
      bg-gradient-to-r from-red-500 via-orange-500 to-red-500
      bg-[length:200%_100%] bg-[position:0%_0%]
      hover:bg-[position:100%_0%]
      text-white
      shadow-xl shadow-red-500/30
      hover:shadow-2xl hover:shadow-red-500/40
    `,
    outline: `
      bg-white/50 backdrop-blur-sm
      border-2 border-purple-300
      text-purple-600
      hover:bg-purple-50 hover:border-purple-400
    `,
    ghost: `
      bg-transparent
      text-gray-600
      hover:bg-gray-100/50
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        font-semibold
        transition-all duration-500
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon}
      {children}
    </motion.button>
  );
};

export default GradientButton;
