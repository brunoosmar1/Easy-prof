import { getLessonPlans } from '@/lib/actions/ai'
import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { LessonPlanGenerator } from '@/components/planejamento/lesson-plan-generator'
import { LessonPlanList } from '@/components/planejamento/lesson-plan-list'

export default async function PlanejamentoPage() {
  const [plans, classes] = await Promise.all([
    getLessonPlans(),
    getClasses(),
  ])

  return (
    <div>
      <PageHeader
        title="Planejamento de Aulas"
        description="Gere planejamentos completos alinhados à BNCC com Inteligência Artificial"
      />
      <div className="space-y-8">
        <LessonPlanGenerator classes={classes} />
        <LessonPlanList plans={plans} />
      </div>
    </div>
  )
}
