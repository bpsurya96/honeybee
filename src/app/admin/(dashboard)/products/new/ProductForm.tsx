/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveProduct, deleteProduct, getAllSkills, getAllActivities } from '../../../productActions';
import { Loader2, ArrowLeft, Image as ImageIcon, Save, Trash2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newSkillName, setNewSkillName] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    setAddingSkill(true);
    const { createQuickSkill } = await import('../../../productActions');
    const res = await createQuickSkill(newSkillName);
    if (res.success) {
      setAllSkills(prev => [...prev, res.skill]);
      setSelectedSkills(prev => [...prev, res.skill.id]);
      setNewSkillName('');
    } else {
      alert(res.error);
    }
    setAddingSkill(false);
  };


  useEffect(() => {
    getAllSkills().then(setAllSkills);
    getAllActivities().then(setAllActivities);
    if (initialData?.product_skills) {
      setSelectedSkills(initialData.product_skills.map((ps: any) => ps.skill_id));
    }
    if (initialData?.activities) {
      setSelectedActivities(initialData.activities.map((a: any) => a.id));
    }
    if (initialData?.image_url) {
      setImageUrls(initialData.image_url.split(',').filter((u: string) => u.trim() !== ''));
    }
  }, [initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImage(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.urls) {
        setImageUrls(prev => [...prev, ...data.urls]);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('skills', JSON.stringify(selectedSkills));
    formData.append('activities', JSON.stringify(selectedActivities));
    formData.append('image_url', imageUrls.join(','));
    if (initialData?.id) formData.append('id', initialData.id);

    const res = await saveProduct(formData);
    setLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      router.push('/admin/products');
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to deactivate this product? This will remove it from the public catalog.')) {
      setLoading(true);
      await deleteProduct(initialData.id);
      router.push('/admin/products');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/products" className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Create Product'}</h1>
        </div>
        <div className="flex space-x-3">
          {initialData && (
            <button type="button" onClick={handleDelete} className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors flex items-center text-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Deactivate
            </button>
          )}
          <button type="submit" disabled={loading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center text-sm">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" name="name" defaultValue={initialData?.name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={4} name="description" defaultValue={initialData?.description} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" name="price" defaultValue={initialData?.price || 0} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age (months)</label>
                  <input required type="number" name="age_min_months" defaultValue={initialData?.age_min_months || 0} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age (months)</label>
                  <input required type="number" name="age_max_months" defaultValue={initialData?.age_max_months || 60} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input type="checkbox" name="active" id="active" defaultChecked={initialData ? initialData.active : true} className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded" />
                <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-900">Active (Visible to customers)</label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Target Skills</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
               {allSkills.map(skill => (
                 <label key={skill.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedSkills.includes(skill.id) ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                   <input type="checkbox" className="sr-only" checked={selectedSkills.includes(skill.id)} onChange={(e) => {
                     if (e.target.checked) setSelectedSkills([...selectedSkills, skill.id]);
                     else setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                   }} />
                   <div className={`flex-shrink-0 w-5 h-5 mr-3 border rounded flex items-center justify-center ${selectedSkills.includes(skill.id) ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                      {selectedSkills.includes(skill.id) && <CheckCircle className="w-4 h-4 text-white" />}
                   </div>
                   <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                 </label>
               ))}
             </div>

             {/* Quick Add Skill UI */}
             <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
               <input 
                 type="text" 
                 placeholder="Type a new skill name..." 
                 value={newSkillName}
                 onChange={(e) => setNewSkillName(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 text-sm"
               />
               <button 
                 type="button" 
                 onClick={handleAddSkill}
                 disabled={addingSkill || !newSkillName.trim()}
                 className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
               >
                 {addingSkill ? 'Adding...' : 'Add Skill'}
               </button>
             </div>

          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>
            <div className="space-y-4">
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-200 aspect-square group">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-center">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 mb-2 animate-spin text-amber-500" />
                ) : (
                  <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                )}
                <p className="text-sm font-medium text-gray-600">
                  {uploadingImage ? 'Uploading...' : 'Click or drag images to upload'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Upload from your computer (Multiple allowed)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Associated Activities</h2>
             <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
               {allActivities.map(act => (
                 <label key={act.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedActivities.includes(act.id) ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                   <input type="checkbox" className="sr-only" checked={selectedActivities.includes(act.id)} onChange={(e) => {
                     if (e.target.checked) setSelectedActivities([...selectedActivities, act.id]);
                     else setSelectedActivities(selectedActivities.filter(id => id !== act.id));
                   }} />
                   <div className={`flex-shrink-0 w-5 h-5 mr-3 border rounded flex items-center justify-center ${selectedActivities.includes(act.id) ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                      {selectedActivities.includes(act.id) && <CheckCircle className="w-4 h-4 text-white" />}
                   </div>
                   <div className="text-sm font-medium text-gray-900">{act.name}</div>
                 </label>
               ))}
             </div>
          </div>
    </form>
  );
}
