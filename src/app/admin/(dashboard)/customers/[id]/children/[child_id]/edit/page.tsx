
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerDetails } from '../../../../../../data';
import { saveChild } from '../../../../../../customerActions';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditChildPage({ params }: { params: Promise<{ id: string, child_id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomerDetails(resolvedParams.id).then(data => {
      const c = data?.children?.find((x: any) => x.id === resolvedParams.child_id);
      setChild(c);
      setLoading(false);
    });
  }, [resolvedParams.id, resolvedParams.child_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append('id', resolvedParams.child_id);
    formData.append('customer_id', resolvedParams.id);
    const res = await saveChild(formData);
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Child Profile</h1>
        </div>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center text-sm shadow-sm">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
          <input required type="text" name="name" defaultValue={child?.name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input required type="date" name="date_of_birth" defaultValue={child?.date_of_birth} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select required name="gender" defaultValue={child?.gender} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>
    </form>
  );
}
