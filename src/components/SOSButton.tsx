import React, { useState } from 'react';
import { AlertTriangle, Phone, X, UserCog, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { caregivers, patients } from '../data/mockData';

const SOSButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertSent, setAlertSent] = useState<string | null>(null);
  const { user } = useAuth();

  const patient = patients.find(p => p.id === user?.id);
  const caregiver = caregivers.find(c => c.id === patient?.caregiverId);

  const handleAlertCaregiver = () => {
    setAlertSent('caregiver');
    setTimeout(() => {
      setAlertSent(null);
      setIsOpen(false);
    }, 2000);
  };

  const handleAlertDoctor = () => {
    setAlertSent('doctor');
    setTimeout(() => {
      setAlertSent(null);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Emergency SOS"
      >
        {/* Pulsing ring effect */}
        <span className="absolute inset-0 rounded-full bg-red-500 pulse-ring"></span>
        <span className="absolute inset-0 rounded-full bg-red-500 pulse-ring" style={{ animationDelay: '0.5s' }}></span>
        
        {/* Main button */}
        <span className="relative flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-all duration-200 group-hover:scale-110">
          <span className="text-white font-bold text-sm">🚨 SOS</span>
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Emergency Help</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              {alertSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">✓</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Alert Sent!
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Your {alertSent} has been notified and will respond shortly.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-center text-lg">
                    Are you experiencing an emergency?
                  </p>
                  
                  <div className="space-y-3">
                    {/* Call 911 */}
                    <a
                      href="tel:911"
                      className="flex items-center justify-center space-x-3 w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call 911</span>
                    </a>
                    
                    {/* Alert Caregiver */}
                    <button
                      onClick={handleAlertCaregiver}
                      className="flex items-center justify-center space-x-3 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <UserCog className="w-5 h-5" />
                      <span>Alert Caregiver ({caregiver?.name})</span>
                    </button>
                    
                    {/* Alert Doctor */}
                    <button
                      onClick={handleAlertDoctor}
                      className="flex items-center justify-center space-x-3 w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
                    >
                      <Stethoscope className="w-5 h-5" />
                      <span>Alert Doctor ({patient?.doctorName})</span>
                    </button>
                    
                    {/* Cancel */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                      Cancel - I'm OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
