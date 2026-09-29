
'use client';

import { useState, useEffect } from 'react';
import { getActivities } from '../../data';
import { Loader2, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivities().then(data => {
      setActivities(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Digital Activities</h1>
        <Link href="/admin/activities/new" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center font-medium transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Activity
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product Assig.</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Age Range</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {activities.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{a.name}</div>
                      <div className="text-xs text-gray-500 w-48 truncate">{a.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {a.product?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {a.age_min_months} - {a.age_max_months} mos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {a.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/admin/activities/${a.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No activities found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
