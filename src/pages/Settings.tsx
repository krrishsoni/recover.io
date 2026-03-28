import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Moon,
  Download,
  Shield,
  Phone,
  Mail,
  Clock,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSettings, saveSettings, UserSettings } from '../utils/storage';
import { patients, caregivers } from '../data/mockData';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [saved, setSaved] = useState(false);
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        const patient = patients.find(p => p.id === user.id);
        if (patient) setPhone(patient.phone);
      } else {
        const caregiver = caregivers.find(c => c.id === user.id);
        if (caregiver) setPhone(caregiver.phone);
      }
    }
  }, [user]);

  const handleSaveSettings = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile Section */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Manage your personal information</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {user?.avatar}
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Change Avatar
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="input-field bg-gray-50 capitalize"
              />
            </div>
          </div>

          <button className="btn-secondary">
            Change Password
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Manage how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive alerts via email</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'left-7' : 'left-1'
              }`}></span>
            </button>
          </div>

          {/* SMS alerts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">SMS Alerts</p>
                <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('smsAlerts', !settings.smsAlerts)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.smsAlerts ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.smsAlerts ? 'left-7' : 'left-1'
              }`}></span>
            </button>
          </div>

          {/* Quiet hours */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Moon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Quiet Hours</p>
                <p className="text-sm text-gray-500">No alerts during these hours</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                  className="input-field py-2"
                />
              </div>
              <span className="text-gray-400 mt-4">to</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                  className="input-field py-2"
                />
              </div>
            </div>
          </div>

          {/* Alert threshold */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900">Alert Threshold</p>
                <p className="text-sm text-gray-500">When should you be notified?</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => updateSetting('alertThreshold', level)}
                  className={`flex-1 py-2 rounded-lg font-medium capitalize transition-colors ${
                    settings.alertThreshold === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {settings.alertThreshold === 'low' && 'You will be notified for all patient updates'}
              {settings.alertThreshold === 'medium' && 'You will be notified for monitor and urgent alerts'}
              {settings.alertThreshold === 'high' && 'You will only be notified for urgent alerts'}
            </p>
          </div>
        </div>
      </div>

      {/* Patient-specific settings */}
      {user?.role === 'patient' && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recovery Settings</h2>
              <p className="text-sm text-gray-500">Customize your recovery plan</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Medication Schedule</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Emergency Contacts</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-blue-700">
              <Download className="w-5 h-5" />
              <span className="font-medium">Download Recovery Plan (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* Caregiver-specific settings */}
      {user?.role === 'caregiver' && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Caregiver Settings</h2>
              <p className="text-sm text-gray-500">Manage patient care settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Manage Patient Assignments</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Set Alert Priorities</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Configure Auto-Escalation</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
