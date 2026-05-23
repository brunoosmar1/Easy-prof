import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { PlansPage } from '@/components/planos/plans-page'

export default async function PlanosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  return (
    <div>
      <PageHeader
        title="Planos"
        description="Escolha o plano ideal para você"
      />
      <PlansPage
        currentPlan={profile?.plan ?? 'free'}
        subscription={subscription}
      />
    </div>
  )
}
