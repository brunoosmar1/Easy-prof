import { PageHeader } from '@/components/shared/page-header'
import { ActivityGenerator } from '@/components/atividades/activity-generator'

export default function AtividadesPage() {
  return (
    <div>
      <PageHeader
        title="Gerador de Atividades"
        description="Crie atividades pedagógicas completas com gabarito usando Inteligência Artificial"
      />
      <ActivityGenerator />
    </div>
  )
}
