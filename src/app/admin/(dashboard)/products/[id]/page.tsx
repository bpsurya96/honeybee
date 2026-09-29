
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import ProductForm from '../new/ProductForm';
import { getProductData } from '../../../productActions';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.id);
  if (!data) return notFound();
  
  return <ProductForm initialData={data} />;
}
