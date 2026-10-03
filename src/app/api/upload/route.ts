import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // SECURITY: Authenticate the user before allowing upload
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files received' }, { status: 400 });
    }

    // MIME type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only images and PDFs allowed.' }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
      }
    }

    const adminSupabase = await createAdminClient();

    // Attempt to create bucket if it doesn't exist (silently fails if it does)
    await adminSupabase.storage.createBucket('public', { public: true });

    const urls: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { error } = await adminSupabase.storage
        .from('public')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
         console.error('Supabase upload error:', error);
         throw error;
      }
      
      const { data: publicUrlData } = adminSupabase.storage.from('public').getPublicUrl(filename);
      urls.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}