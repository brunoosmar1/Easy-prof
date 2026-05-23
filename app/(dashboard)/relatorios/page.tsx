import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { ReportGenerator } from '@/components/relatorios/report-generator'

export default async function RelatoriosPage() {
  const classes = await getClasses()

  return (
    <div>
      <PageHeader
        title="Relatórios com IA"
        description="Gere relatórios individuais personalizados para cada aluno"
      />
      <ReportGenerator classes={classes} />
    </div>
  )
}
