/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

'use client';

import { Settings, Shield, Server, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-900">
            <Shield className="w-5 h-5 mr-3 text-amber-500" />
            <h3 className="text-lg font-bold">Admin Profile</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Username</label>
              <div className="mt-1 text-sm font-medium">honeybee (Environment config)</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Role</label>
              <div className="mt-1 text-sm font-medium"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg">Super Admin</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-900">
            <Database className="w-5 h-5 mr-3 text-blue-500" />
            <h3 className="text-lg font-bold">System Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">AI Service (Gemini)</span>
              <span className="text-sm font-semibold text-green-600">Operational</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
