import { getDashboardStats } from '@/lib/actions/ai'
import { getClasses } from '@/lib/actions/classes'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Trophy,
  BookOpen,
  FileText,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { formatPercentage, formatGrade, getBimesterLabel } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const [stats, classes] = await Promise.all([
    getDashboardStats(),
    getClasses(),
  ])

  const recentClasses = classes.slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da sua atividade pedagógica"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Turmas"
          value={stats?.total_classes ?? 0}
          icon={Users}
          color="blue"
          description="Turmas ativas"
        />
        <StatCard
          title="Alunos"
          value={stats?.total_students ?? 0}
          icon={GraduationCap}
          color="green"
          description="Total matriculados"
        />
        <StatCard
          title="Frequência Média"
          value={formatPercentage(stats?.average_attendance ?? 0)}
          icon={ClipboardCheck}
          color="yellow"
          description="Média geral"
        />
        <StatCard
          title="Média de Notas"
          value={formatGrade(stats?.average_grade ?? 0)}
          icon={Trophy}
          color="purple"
          description="Média geral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Planejamentos"
          value={stats?.total_lesson_plans ?? 0}
          icon={BookOpen}
          color="blue"
          description="Criados com IA"
        />
        <StatCard
          title="Avaliações"
          value={stats?.total_assessments ?? 0}
          icon={FileText}
          color="green"
          description="Cadastradas"
        />
        <StatCard
          title="Relatórios Pendentes"
          value={stats?.pending_reports ?? 0}
          icon={BarChart3}
          color="red"
          description="Aguardando geração"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Turmas Recentes</CardTitle>
            <Link href="/turmas">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentClasses.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma turma cadastrada</p>
                <Link href="/turmas">
                  <Button variant="outline" size="sm" className="mt-3">
                    Criar turma
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentClasses.map((cls) => (
                  <li key={cls.id}>
                    <Link
                      href={`/turmas/${cls.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600">
                          {cls.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cls.grade} · {cls.subject} · {getBimesterLabel(cls.bimester)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {cls.student_count} alunos
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ações Rápidas com IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  href: '/planejamento',
                  icon: BookOpen,
                  title: 'Criar Planejamento',
                  desc: 'Gere um plano de aula alinhado à BNCC',
                  color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
                },
                {
                  href: '/atividades',
                  icon: FileText,
                  title: 'Gerar Atividade',
                  desc: 'Crie questões e atividades pedagógicas',
                  color: 'text-green-600 bg-green-50 dark:bg-green-950',
                },
                {
                  href: '/relatorios',
                  icon: BarChart3,
                  title: 'Gerar Relatório',
                  desc: 'Relatório individual com análise da IA',
                  color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
                },
                {
                  href: '/assistente',
                  icon: Sparkles,
                  title: 'Assistente IA',
                  desc: 'Converse com o assistente pedagógico',
                  color: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
                },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.desc}
                      </p>
                    </div>
                    <Sparkles className="w-3 h-3 text-brand-400 flex-shrink-0 ml-auto" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
