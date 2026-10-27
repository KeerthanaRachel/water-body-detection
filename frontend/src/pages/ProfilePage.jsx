import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut,
  KeyRound
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = { name: name.trim(), email: email.trim() };
      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required to set a new password.');
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await api.auth.updateProfile(payload);
      updateUser(res.user || { name, email });
      setMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Account & Security Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your researcher profile, email address, and authentication preferences.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Overview Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Session: HTTP-only Secure Cookie</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of AquaSat AI</span>
          </button>
        </div>

        {/* Right Column: Update Settings Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-base font-semibold text-white">Edit Profile Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5 text-brand-400" />
                <span>Change Password (Optional)</span>
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 flex items-center space-x-2 transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
