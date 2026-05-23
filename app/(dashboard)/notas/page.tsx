import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { GradesManager } from '@/components/notas/grades-manager'

export default async function NotasPage() {
  const classes = await getClasses()

  return (
    <div>
      <PageHeader
        title="Lançamento de Notas"
        description="Gerencie avaliações e notas dos alunos com cálculo automático"
      />
      <GradesManager classes={classes} />
    </div>
  )
}
