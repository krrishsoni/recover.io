import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'URGENT' | 'MONITOR' | 'NORMAL' | 'urgent' | 'monitor' | 'normal';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  showLabel?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showPulse = true,
  showLabel = true
}) => {
  const normalizedStatus = status.toLowerCase() as 'urgent' | 'monitor' | 'normal';
  
  const config = {
    urgent: {
      bg: 'bg-gradient-to-r from-red-500 to-orange-500',
      text: 'text-red-700',
      bgLight: 'bg-red-50',
      border: 'border-red-200',
      label: 'Urgent',
      emoji: '🔴'
    },
    monitor: {
      bg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      text: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Monitor',
      emoji: '🟡'
    },
    normal: {
      bg: 'bg-gradient-to-r from-green-400 to-emerald-500',
      text: 'text-green-700',
      bgLight: 'bg-green-50',
      border: 'border-green-200',
      label: 'Stable',
      emoji: '🟢'
    }
  };

  const sizes = {
    sm: {
      dot: 'w-2 h-2',
      container: 'px-2 py-1 text-xs',
      gap: 'gap-1'
    },
    md: {
      dot: 'w-3 h-3',
      container: 'px-3 py-1.5 text-sm',
      gap: 'gap-2'
    },
    lg: {
      dot: 'w-4 h-4',
      container: 'px-4 py-2 text-base',
      gap: 'gap-2'
    }
  };

  const currentConfig = config[normalizedStatus];
  const currentSize = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center ${currentSize.gap}
        ${currentSize.container}
        ${currentConfig.bgLight}
        ${currentConfig.text}
        border ${currentConfig.border}
        rounded-full font-semibold
      `}
    >
      <span className="relative flex">
        <span className={`
          ${currentSize.dot} rounded-full ${currentConfig.bg}
        `} />
        {showPulse && normalizedStatus === 'urgent' && (
          <span className={`
            absolute inset-0 ${currentSize.dot} rounded-full ${currentConfig.bg}
            animate-ping opacity-75
          `} />
        )}
      </span>
      {showLabel && <span>{currentConfig.label}</span>}
    </motion.div>
  );
};

export default StatusBadge;
