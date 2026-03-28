import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, UserPlus, Stethoscope, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EmergencySOS: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only show for patients
  if (user?.role !== 'patient') return null;

  const handleCall911 = () => {
    window.location.href = 'tel:911';
    toast.success('Calling 911...', {
      icon: '🚨',
      style: {
        background: '#ef4444',
        color: '#fff'
      }
    });
  };

  const handleAlertCaregiver = () => {
    toast.success('Your caregiver has been notified!', {
      icon: '📱',
      duration: 4000
    });
    setIsOpen(false);
  };

  const handleAlertDoctor = () => {
    toast.success('Your doctor has been notified!', {
      icon: '👨‍⚕️',
      duration: 4000
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* SOS Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-2xl shadow-red-500/50 flex items-center justify-center animate-pulse-glow"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="w-7 h-7 text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-4 right-4 bottom-4 sm:left-1/2 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Emergency Help</h3>
                      <p className="text-sm text-gray-500">Are you experiencing an emergency?</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Call 911 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCall911}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-red-500/30"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Call 911</p>
                      <p className="text-red-100 text-sm">For life-threatening emergencies</p>
                    </div>
                  </motion.button>

                  {/* Alert Caregiver */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAlertCaregiver}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg shadow-purple-500/30"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Alert Caregiver</p>
                      <p className="text-purple-100 text-sm">Send high-priority notification</p>
                    </div>
                  </motion.button>

                  {/* Alert Doctor */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAlertDoctor}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg shadow-blue-500/30"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">Alert Doctor</p>
                      <p className="text-blue-100 text-sm">Contact Dr. Emily Chen</p>
                    </div>
                  </motion.button>
                </div>

                {/* Cancel button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-4 py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                >
                  Cancel - I'm okay
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencySOS;
