import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { ProfileForm } from '@/components/perfil/profile-form'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profileData, subscriptionData, aiUsage] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
    supabase.from('ai_generations').select('id', { count: 'exact' }).eq('user_id', user!.id),
  ])

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e preferências"
      />
      <ProfileForm
        profile={profileData.data}
        subscription={subscriptionData.data}
        aiUsageCount={aiUsage.count ?? 0}
      />
    </div>
  )
}
