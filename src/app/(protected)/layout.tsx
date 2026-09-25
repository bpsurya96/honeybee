import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/layout/AppHeader'
import MobileNav from '@/components/layout/MobileNav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <AppHeader user={user} />
      <main className="pb-20 md:pb-6 pt-16">{children}</main>
      <MobileNav />
    </div>
  )
}
