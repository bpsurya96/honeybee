
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerDetails } from '../../../../data';
import { saveCustomer } from '../../../../customerActions';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomerDetails(resolvedParams.id).then(data => {
      setCustomer(data);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append('id', resolvedParams.id);
    const res = await saveCustomer(formData);
    setSaving(false);
    if (res.error) alert(res.error);
    else {
      router.push(`/admin/customers/${resolvedParams.id}`);
      router.refresh();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/admin/customers/${resolvedParams.id}`} className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center text-sm shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input required type="text" name="full_name" defaultValue={customer?.full_name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only via Auth)</label>
          <input type="text" disabled defaultValue={customer?.email} className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AI Credits Balance</label>
          <input required type="number" step="0.01" name="ai_credits" defaultValue={customer?.ai_credits} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
          <p className="text-xs text-gray-500 mt-1.5">Adjusting this balance directly affects the user's available credits.</p>
        </div>
      </div>
    </form>
  );
}
