import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { AssessmentsList } from '@/components/avaliacoes/assessments-list'

export default async function AvaliacoesPage() {
  const classes = await getClasses()

  return (
    <div>
      <PageHeader
        title="Avaliações"
        description="Gerencie todas as avaliações das suas turmas"
      />
      <AssessmentsList classes={classes} />
    </div>
  )
}
