import { PageHeader } from '@/components/shared/page-header'
import { ExamGenerator } from '@/components/provas/exam-generator'

export default function ProvasPage() {
  return (
    <div>
      <PageHeader
        title="Gerador de Provas"
        description="Crie provas formatadas com gabarito e versão A/B usando Inteligência Artificial"
      />
      <ExamGenerator />
    </div>
  )
}
