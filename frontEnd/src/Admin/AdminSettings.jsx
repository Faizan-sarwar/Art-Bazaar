import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Settings, CreditCard, Bell, Shield, Users, Save } from 'lucide-react';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'sellers', label: 'Sellers', icon: Users },
];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-red-500' : 'bg-gray-200'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const SettingRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({ maintenance: false, registration: true, emailVerification: true, twoFactor: false, darkMode: false });
  const [payments, setPayments] = useState({ jazzCash: true, easyPaisa: true, bankTransfer: true, card: false, autoPayouts: true });
  const [notifications, setNotifications] = useState({ newUser: true, newOrder: true, reportFiled: true, payoutRequest: true, systemAlert: true, emailDigest: false });
  const [security, setSecurity] = useState({ adminMFA: true, sessionTimeout: true, ipWhitelist: false, auditLog: true, rateLimit: true });
  const [sellers, setSellers] = useState({ autoApprove: false, requireVerification: true, requirePortfolio: true, commissionAutoCalculate: true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderSettings = () => {
    const configs = {
      general: [
        { key: 'maintenance', label: 'Maintenance Mode', description: 'Take the site offline for maintenance', state: general, setState: setGeneral },
        { key: 'registration', label: 'Open Registration', description: 'Allow new users to sign up', state: general, setState: setGeneral },
        { key: 'emailVerification', label: 'Email Verification', description: 'Require email verification on signup', state: general, setState: setGeneral },
        { key: 'twoFactor', label: 'Two-Factor Auth', description: 'Require 2FA for admin accounts', state: general, setState: setGeneral },
        { key: 'darkMode', label: 'Dark Mode (Admin)', description: 'Enable dark theme for admin panel', state: general, setState: setGeneral },
      ],
      payments: [
        { key: 'jazzCash', label: 'JazzCash', description: 'Enable JazzCash payments', state: payments, setState: setPayments },
        { key: 'easyPaisa', label: 'EasyPaisa', description: 'Enable EasyPaisa payments', state: payments, setState: setPayments },
        { key: 'bankTransfer', label: 'Bank Transfer', description: 'Enable direct bank transfer', state: payments, setState: setPayments },
        { key: 'card', label: 'Credit/Debit Card', description: 'Enable card payments', state: payments, setState: setPayments },
        { key: 'autoPayouts', label: 'Auto Payouts', description: 'Automatically process pending payouts', state: payments, setState: setPayments },
      ],
      notifications: [
        { key: 'newUser', label: 'New User Alerts', description: 'Notify on new registrations', state: notifications, setState: setNotifications },
        { key: 'newOrder', label: 'New Order Alerts', description: 'Notify on new transactions', state: notifications, setState: setNotifications },
        { key: 'reportFiled', label: 'Report Filed', description: 'Alert when a user files a report', state: notifications, setState: setNotifications },
        { key: 'payoutRequest', label: 'Payout Requests', description: 'Alert on seller payout requests', state: notifications, setState: setNotifications },
        { key: 'systemAlert', label: 'System Alerts', description: 'Critical system notifications', state: notifications, setState: setNotifications },
        { key: 'emailDigest', label: 'Daily Email Digest', description: 'Receive a daily summary email', state: notifications, setState: setNotifications },
      ],
      security: [
        { key: 'adminMFA', label: 'Admin MFA', description: 'Require MFA for all admin logins', state: security, setState: setSecurity },
        { key: 'sessionTimeout', label: 'Session Timeout', description: 'Auto logout after inactivity', state: security, setState: setSecurity },
        { key: 'ipWhitelist', label: 'IP Whitelist', description: 'Restrict admin access to specific IPs', state: security, setState: setSecurity },
        { key: 'auditLog', label: 'Audit Logging', description: 'Log all admin actions', state: security, setState: setSecurity },
        { key: 'rateLimit', label: 'Rate Limiting', description: 'Prevent brute force attacks', state: security, setState: setSecurity },
      ],
      sellers: [
        { key: 'autoApprove', label: 'Auto-Approve Sellers', description: 'Skip manual seller verification', state: sellers, setState: setSellers },
        { key: 'requireVerification', label: 'ID Verification Required', description: 'Sellers must verify identity', state: sellers, setState: setSellers },
        { key: 'requirePortfolio', label: 'Portfolio Required', description: 'Sellers must upload portfolio', state: sellers, setState: setSellers },
        { key: 'commissionAutoCalculate', label: 'Auto Commission', description: 'Automatically calculate commission', state: sellers, setState: setSellers },
      ],
    };

    return (configs[activeTab] || []).map(({ key, label, description, state, setState }) => (
      <SettingRow
        key={key}
        label={label}
        description={description}
        checked={state[key]}
        onChange={val => setState(prev => ({ ...prev, [key]: val }))}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title="Settings" subtitle="Platform configuration" />
        <main className="p-4 md:p-6">
          <div className="max-w-2xl">

            {/* Tab Bar */}
            <div className="flex gap-1.5 flex-wrap mb-5">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${activeTab === t.id ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <t.icon size={14} />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <h3 className="font-bold text-gray-900 mb-4 capitalize">{activeTab} Settings</h3>
              <div>{renderSettings()}</div>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${saved ? 'bg-green-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                  <Save size={16} />
                  {saved ? 'Saved!' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}