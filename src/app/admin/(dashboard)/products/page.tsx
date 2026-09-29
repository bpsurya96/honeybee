
'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '../../data';
import { Loader2, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
        <Link href="/admin/products/new" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center font-medium transition-colors text-sm shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Product
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Age Range</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Skills</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500 w-48 truncate">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      $${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.age_min_months} - {p.age_max_months} mos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.product_skills?.length || 0} skills
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/admin/products/${p.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
