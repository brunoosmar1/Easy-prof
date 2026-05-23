import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, GraduationCap } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export default async function AlunosPage() {
  const classes = await getClasses()

  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos de todas as suas turmas"
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma criada"
          description="Crie uma turma para começar a cadastrar alunos."
          action={{ label: 'Criar turma', onClick: () => {} }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cls.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cls.subject} · {cls.grade}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cls.student_count}
                  </Badge>
                </div>
                <Link href={`/turmas/${cls.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    Ver alunos
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
