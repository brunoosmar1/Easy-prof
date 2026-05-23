import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { ClassList } from '@/components/turmas/class-list'
import { CreateClassButton } from '@/components/turmas/create-class-button'
import { createClient } from '@/lib/supabase/server'

export default async function TurmasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [classes, profileData] = await Promise.all([
    getClasses(),
    supabase.from('profiles').select('plan').eq('id', user!.id).single(),
  ])

  return (
    <div>
      <PageHeader
        title="Turmas"
        description="Gerencie suas turmas e alunos"
        action={<CreateClassButton plan={profileData.data?.plan ?? 'free'} currentCount={classes.length} />}
      />
      <ClassList classes={classes} />
    </div>
  )
}
