import { notFound } from 'next/navigation'
import { getClass } from '@/lib/actions/classes'
import { getStudents } from '@/lib/actions/students'
import { PageHeader } from '@/components/shared/page-header'
import { StudentManager } from '@/components/alunos/student-manager'
import { Badge } from '@/components/ui/badge'
import { getBimesterLabel } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function ClassDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [cls, students] = await Promise.all([
    getClass(params.id),
    getStudents(params.id),
  ])

  if (!cls) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/turmas">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Turmas
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cls.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary">{cls.grade}</Badge>
              <Badge variant="secondary">{cls.subject}</Badge>
              <Badge variant="secondary">{getBimesterLabel(cls.bimester)}</Badge>
              <Badge variant="secondary">{cls.shift}</Badge>
              <span className="text-sm text-gray-500">{cls.school}</span>
            </div>
          </div>
        </div>
      </div>

      <StudentManager classId={params.id} initialStudents={students} />
    </div>
  )
}
