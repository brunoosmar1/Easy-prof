import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { PedagogicalChat } from '@/components/assistente/pedagogical-chat'

export default async function AssistentePage() {
  const classes = await getClasses()

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Assistente Pedagógico IA"
        description="Converse com seu assistente especializado em educação básica brasileira"
      />
      <div className="flex-1 min-h-0">
        <PedagogicalChat classes={classes} />
      </div>
    </div>
  )
}
