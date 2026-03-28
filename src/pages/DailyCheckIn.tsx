import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Thermometer,
  Heart,
  Camera,
  Smile,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth, CheckIn } from '../context/AuthContext';
import Header from '../components/layout/Header';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import toast from 'react-hot-toast';

const DailyCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { user, addCheckIn } = useAuth();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [pain, setPain] = useState(3);
  const [temperature, setTemperature] = useState('98.6');
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [fever, setFever] = useState(false);
  const [woundStatus, setWoundStatus] = useState<CheckIn['woundStatus']>('healing');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [mood, setMood] = useState<CheckIn['mood']>('good');
  const [notes, setNotes] = useState('');

  const totalSteps = 6;

  const emojiMap: { [key: number]: { emoji: string; color: string; label: string } } = {
    0: { emoji: '😊', color: 'from-green-400 to-emerald-500', label: 'No pain' },
    1: { emoji: '🙂', color: 'from-green-400 to-emerald-500', label: 'Minimal' },
    2: { emoji: '😌', color: 'from-green-400 to-lime-500', label: 'Mild' },
    3: { emoji: '😐', color: 'from-yellow-400 to-orange-400', label: 'Moderate' },
    4: { emoji: '😕', color: 'from-yellow-400 to-orange-400', label: 'Moderate' },
    5: { emoji: '😟', color: 'from-orange-400 to-red-400', label: 'Uncomfortable' },
    6: { emoji: '😣', color: 'from-orange-400 to-red-500', label: 'Distressing' },
    7: { emoji: '😖', color: 'from-red-400 to-red-600', label: 'Severe' },
    8: { emoji: '😫', color: 'from-red-500 to-red-700', label: 'Very severe' },
    9: { emoji: '😭', color: 'from-red-600 to-red-800', label: 'Extreme' },
    10: { emoji: '😱', color: 'from-red-700 to-red-900', label: 'Worst possible' }
  };

  const moodOptions = [
    { value: 'great', emoji: '😊', label: 'Great', color: 'from-green-400 to-emerald-500' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'from-green-400 to-lime-500' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-orange-400' },
    { value: 'down', emoji: '😔', label: 'Down', color: 'from-orange-400 to-red-400' },
    { value: 'struggling', emoji: '😰', label: 'Struggling', color: 'from-red-400 to-red-600' }
  ];

  const symptomsList = [
    { id: 'nausea', label: 'Nausea', emoji: '🤢' },
    { id: 'dizziness', label: 'Dizziness', emoji: '💫' },
    { id: 'shortness of breath', label: 'Shortness of breath', emoji: '😮‍💨' },
    { id: 'fatigue', label: 'Unusual fatigue', emoji: '😴' },
    { id: 'insomnia', label: 'Difficulty sleeping', emoji: '🌙' },
    { id: 'headache', label: 'Headache', emoji: '🤕' }
  ];

  const woundOptions = [
    { value: 'healing', label: 'Healing well', color: 'green', emoji: '✅' },
    { value: 'redness', label: 'Some redness', color: 'yellow', emoji: '🟡' },
    { value: 'swelling', label: 'Increased swelling', color: 'orange', emoji: '🟠' },
    { value: 'concerning', label: 'Concerning changes', color: 'red', emoji: '🔴' }
  ];

  const calculateAlertLevel = (): CheckIn['alertLevel'] => {
    if (pain > 7 || fever || woundStatus === 'concerning') return 'URGENT';
    if (pain > 5 || symptoms.length > 2 || woundStatus === 'swelling') return 'MONITOR';
    return 'NORMAL';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const alertLevel = calculateAlertLevel();
    
    const checkInData: Omit<CheckIn, 'id'> = {
      patientId: user?.id || 1,
      date: new Date().toISOString(),
      pain,
      temperature: parseFloat(temperature),
      temperatureUnit: tempUnit,
      fever,
      woundStatus,
      symptoms,
      otherSymptoms,
      mood,
      notes,
      alertLevel
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addCheckIn(checkInData);
    setShowConfetti(true);

    if (alertLevel === 'URGENT') {
      toast.error('Your caregiver has been notified about urgent symptoms.', {
        duration: 5000,
        icon: '🚨'
      });
    } else if (alertLevel === 'MONITOR') {
      toast.success('Your caregiver will monitor your progress.', {
        duration: 4000,
        icon: '👀'
      });
    } else {
      toast.success('Check-in complete! Keep up the great recovery!', {
        duration: 4000,
        icon: '🎉'
      });
    }

    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const nextStep = () => setStep(Math.min(totalSteps, step + 1));
  const prevStep = () => setStep(Math.max(1, step - 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">How's your pain today?</h2>
              <p className="text-gray-500 mt-2">Slide to rate your current pain level</p>
            </div>

            {/* Emoji display */}
            <motion.div
              key={pain}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className={`
                inline-flex items-center justify-center w-32 h-32 rounded-full
                bg-gradient-to-br ${emojiMap[pain].color}
                shadow-2xl mb-4
              `}>
                <span className="text-6xl">{emojiMap[pain].emoji}</span>
              </div>
              <p className="text-4xl font-bold text-gray-800">{pain}/10</p>
              <p className="text-gray-600 font-medium mt-1">{emojiMap[pain].label}</p>
            </motion.div>

            {/* Slider */}
            <div className="px-4">
              <input
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={(e) => setPain(Number(e.target.value))}
                className="pain-slider w-full"
              />
              <div className="flex justify-between mt-3 text-sm text-gray-500 font-medium">
                <span>No pain</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* High pain warning */}
            {pain > 7 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800">High pain detected</p>
                    <p className="text-sm text-red-700">Your caregiver will be notified</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Thermometer className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Vital Signs</h2>
              <p className="text-gray-500 mt-2">Let's check your temperature</p>
            </div>

            {/* Temperature input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temperature
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="flex-1 px-4 py-4 bg-white/60 border-2 border-gray-200 rounded-2xl text-lg font-semibold text-gray-800 focus:border-purple-500 focus:bg-white transition-all"
                />
                <div className="flex bg-gray-100 rounded-xl p-1">
                  {(['F', 'C'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTempUnit(unit)}
                      className={`
                        px-4 py-2 rounded-lg font-semibold transition-all
                        ${tempUnit === unit
                          ? 'bg-white text-purple-600 shadow-md'
                          : 'text-gray-600'
                        }
                      `}
                    >
                      °{unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fever toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Do you have a fever?
              </label>
              <div className="flex gap-3">
                {[
                  { value: false, label: 'No', emoji: '😊' },
                  { value: true, label: 'Yes', emoji: '🤒' }
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setFever(option.value)}
                    className={`
                      flex-1 py-4 rounded-2xl font-semibold text-lg transition-all border-2
                      ${fever === option.value
                        ? option.value
                          ? 'bg-red-50 border-red-400 text-red-700'
                          : 'bg-green-50 border-green-400 text-green-700'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:border-purple-300'
                      }
                    `}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {fever && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <p className="text-orange-800">Fever reported - we'll alert your care team</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <span className="text-5xl mb-4 block">🩹</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Wound Assessment</h2>
              <p className="text-gray-500 mt-2">How is your surgical site healing?</p>
            </div>

            <div className="space-y-3">
              {woundOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setWoundStatus(option.value as CheckIn['woundStatus'])}
                  className={`
                    w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4
                    ${woundStatus === option.value
                      ? option.color === 'green'
                        ? 'bg-green-50 border-green-400'
                        : option.color === 'yellow'
                        ? 'bg-yellow-50 border-yellow-400'
                        : option.color === 'orange'
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-red-50 border-red-400'
                      : 'bg-white/60 border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-semibold text-gray-800">{option.label}</span>
                  {woundStatus === option.value && (
                    <CheckCircle2 className="w-5 h-5 ml-auto text-green-600" />
                  )}
                </motion.button>
              ))}
            </div>

            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 font-medium hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              Upload photo (optional)
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <span className="text-5xl mb-4 block">📋</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Symptoms Check</h2>
              <p className="text-gray-500 mt-2">Select any symptoms you're experiencing</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {symptomsList.map((symptom) => (
                <motion.button
                  key={symptom.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`
                    p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-3
                    ${symptoms.includes(symptom.id)
                      ? 'bg-purple-50 border-purple-400'
                      : 'bg-white/60 border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <span className="text-xl">{symptom.emoji}</span>
                  <span className={`text-sm font-semibold ${symptoms.includes(symptom.id) ? 'text-purple-700' : 'text-gray-700'}`}>
                    {symptom.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Other symptoms (optional)
              </label>
              <textarea
                value={otherSymptoms}
                onChange={(e) => setOtherSymptoms(e.target.value.slice(0, 500))}
                placeholder="Describe any other symptoms..."
                rows={3}
                className="w-full px-4 py-3 bg-white/60 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-purple-500 focus:bg-white transition-all resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">{otherSymptoms.length}/500</p>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Smile className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Mental Wellness</h2>
              <p className="text-gray-500 mt-2">How are you feeling emotionally today?</p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-4">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMood(option.value as CheckIn['mood'])}
                  className="relative group"
                >
                  <div className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${mood === option.value
                      ? `bg-gradient-to-br ${option.color} shadow-lg scale-110`
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                  `}>
                    <span className="text-2xl sm:text-3xl">{option.emoji}</span>
                  </div>
                  <span className={`
                    block text-xs font-medium mt-2 transition-colors
                    ${mood === option.value ? 'text-purple-600' : 'text-gray-500'}
                  `}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Anything else you'd like to share? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling about your recovery?"
                rows={3}
                className="w-full px-4 py-3 bg-white/60 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-purple-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Review & Submit</h2>
              <p className="text-gray-500 mt-2">Please confirm your check-in details</p>
            </div>

            {/* Summary cards */}
            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pain Level</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emojiMap[pain].emoji}</span>
                    <span className="font-bold text-gray-800">{pain}/10</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Temperature</span>
                  <span className="font-bold text-gray-800">{temperature}°{tempUnit}</span>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wound Status</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {woundOptions.find(w => w.value === woundStatus)?.label}
                  </span>
                </div>
              </div>

              {symptoms.length > 0 && (
                <div className="p-4 bg-white/60 rounded-2xl border border-gray-200">
                  <span className="text-gray-600 block mb-2">Symptoms</span>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map(s => (
                      <span key={s} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full capitalize">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-white/60 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mood</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{moodOptions.find(m => m.value === mood)?.emoji}</span>
                    <span className="font-bold text-gray-800 capitalize">{mood}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert level preview */}
            {calculateAlertLevel() !== 'NORMAL' && (
              <div className={`
                p-4 rounded-xl border-l-4
                ${calculateAlertLevel() === 'URGENT'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
                }
              `}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-6 h-6 ${calculateAlertLevel() === 'URGENT' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div>
                    <p className={`font-semibold ${calculateAlertLevel() === 'URGENT' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {calculateAlertLevel() === 'URGENT' ? 'Urgent Alert' : 'Monitoring Alert'}
                    </p>
                    <p className={`text-sm ${calculateAlertLevel() === 'URGENT' ? 'text-red-700' : 'text-yellow-700'}`}>
                      Your caregiver will be notified
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <AnimatedBackground variant="mesh" />
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium text-purple-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <GlassCard padding="lg">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <GradientButton
                variant="outline"
                onClick={prevStep}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </GradientButton>
            )}
            
            {step < totalSteps ? (
              <GradientButton
                fullWidth
                onClick={nextStep}
                icon={<ArrowRight className="w-5 h-5" />}
                className="flex-1"
              >
                Continue
              </GradientButton>
            ) : (
              <GradientButton
                fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
                icon={isSubmitting ? undefined : <Send className="w-5 h-5" />}
                className="flex-1"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Submit Check-in'
                )}
              </GradientButton>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default DailyCheckIn;
