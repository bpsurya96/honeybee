
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import ActivityForm from '../new/ActivityForm';
import { getActivityData } from '../../../activityActions';
import { notFound } from 'next/navigation';

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getActivityData(resolvedParams.id);
  if (!data) return notFound();
  
  return <ActivityForm initialData={data} />;
}
