import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { AttendanceManager } from '@/components/frequencia/attendance-manager'

export default async function FrequenciaPage() {
  const classes = await getClasses()

  return (
    <div>
      <PageHeader
        title="Diário de Frequência"
        description="Registre e acompanhe a frequência dos alunos"
      />
      <AttendanceManager classes={classes} />
    </div>
  )
}
