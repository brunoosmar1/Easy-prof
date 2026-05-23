import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: BookOpen,
    title: 'Planejamento com IA',
    description: 'Gere planejamentos completos alinhados à BNCC em segundos.',
  },
  {
    icon: ClipboardCheck,
    title: 'Diário Digital',
    description: 'Controle frequência e notas com facilidade em qualquer dispositivo.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Automáticos',
    description: 'Relatórios individuais personalizados gerados por IA para cada aluno.',
  },
  {
    icon: Sparkles,
    title: 'Gerador de Atividades',
    description: 'Crie provas, atividades e questões em minutos com inteligência artificial.',
  },
  {
    icon: Zap,
    title: 'Assistente Pedagógico',
    description: 'Chat especializado em educação para tirar dúvidas e criar conteúdos.',
  },
  {
    icon: Shield,
    title: 'Seguro e Confiável',
    description: 'Dados protegidos e disponíveis a qualquer momento, de qualquer lugar.',
  },
]

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Para começar sem compromisso.',
    features: [
      '1 turma',
      'Até 30 alunos',
      '5 gerações de IA/mês',
      'Diário de frequência',
      'Lançamento de notas',
    ],
    cta: 'Começar grátis',
    href: '/register',
    popular: false,
  },
  {
    name: 'Premium',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Para professores que querem o máximo.',
    features: [
      'Turmas ilimitadas',
      'Alunos ilimitados',
      'IA ilimitada',
      'Relatórios completos',
      'Exportação PDF/DOCX',
      'Gerador de provas',
      'Assistente pedagógico',
      'Suporte prioritário',
    ],
    cta: 'Assinar Premium',
    href: '/register?plan=premium',
    popular: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">EasyProf</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button variant="brand">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="info" className="mb-6 text-sm px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Plataforma pedagógica com Inteligência Artificial
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Menos burocracia,{' '}
            <span className="text-brand-600">mais ensino</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            EasyProf automatiza planejamentos, avaliações, frequência, notas e relatórios
            pedagógicos. Economize horas por semana com a ajuda da Inteligência Artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="brand" size="xl" className="w-full sm:w-auto">
                Começar grátis agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            <Clock className="w-3.5 h-3.5 inline mr-1" />
            Cadastro em menos de 1 minuto · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que um professor precisa
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Do planejamento ao relatório final, o EasyProf cobre todo o trabalho pedagógico e administrativo.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Comece gratuitamente e faça upgrade quando precisar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.popular
                    ? 'border-brand-300 bg-brand-600 text-white shadow-xl shadow-brand-600/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                {plan.popular && (
                  <Badge className="bg-white/20 text-white mb-4 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Mais popular
                  </Badge>
                )}
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.popular ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.popular ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 ${
                          plan.popular ? 'text-blue-200' : 'text-brand-600'
                        }`}
                      />
                      <span className={plan.popular ? 'text-blue-50' : 'text-gray-600 dark:text-gray-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'secondary' : 'brand'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">EasyProf</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 EasyProf. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
