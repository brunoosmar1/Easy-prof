'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Star, Zap } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PlansPageProps {
  currentPlan: string
  subscription: any
}

const FREE_FEATURES = [
  '1 turma ativa',
  'Até 30 alunos por turma',
  '5 gerações de IA por mês',
  'Diário de frequência',
  'Lançamento de notas',
  'Avaliações básicas',
]

const PREMIUM_FEATURES = [
  'Turmas ilimitadas',
  'Alunos ilimitados',
  'IA ilimitada para tudo',
  'Planejamento de aulas com IA',
  'Gerador de atividades completo',
  'Gerador de provas + Versão A/B',
  'Relatórios individuais com IA',
  'Assistente pedagógico ilimitado',
  'Exportação PDF/DOCX',
  'Suporte prioritário',
]

export function PlansPage({ currentPlan, subscription }: PlansPageProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast({ title: 'Erro', description: 'Não foi possível iniciar o pagamento.', variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {currentPlan === 'premium' && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Você é Premium!</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Aproveite todos os recursos sem limitações.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" loading={loading} onClick={handleManageSubscription}>
            Gerenciar assinatura
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <Card className={`${currentPlan === 'free' ? 'border-brand-300 dark:border-brand-700' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Gratuito</CardTitle>
              {currentPlan === 'free' && <Badge variant="secondary">Plano atual</Badge>}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ 0</span>
              <span className="text-gray-400 text-sm mb-1">/ para sempre</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            {currentPlan === 'free' ? (
              <Button variant="outline" className="w-full" disabled>
                Plano atual
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={handleManageSubscription} loading={loading}>
                Fazer downgrade
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Premium */}
        <Card className="border-brand-300 dark:border-brand-700 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950 dark:to-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                Premium
                <Sparkles className="w-4 h-4 text-brand-600" />
              </CardTitle>
              {currentPlan === 'premium' && <Badge variant="premium">Plano atual</Badge>}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">R$ 29,90</span>
              <span className="text-gray-400 text-sm mb-1">/ mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200">{f}</span>
                </li>
              ))}
            </ul>
            {currentPlan === 'premium' ? (
              <Button variant="outline" className="w-full" disabled>
                Plano atual
              </Button>
            ) : (
              <Button
                variant="brand"
                className="w-full gap-2"
                loading={loading}
                onClick={handleUpgrade}
              >
                <Zap className="w-4 h-4" />
                Assinar Premium
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Perguntas frequentes</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p><strong className="text-gray-900 dark:text-white">Posso cancelar a qualquer momento?</strong> Sim! Você pode cancelar sua assinatura a qualquer momento e continuará tendo acesso até o fim do período pago.</p>
          <p><strong className="text-gray-900 dark:text-white">Meus dados ficam salvos após o downgrade?</strong> Sim, todos os dados são mantidos. No plano gratuito, você poderá acessar apenas 1 turma.</p>
          <p><strong className="text-gray-900 dark:text-white">O pagamento é seguro?</strong> Sim, utilizamos o Stripe, plataforma líder em pagamentos online, com criptografia de ponta a ponta.</p>
        </div>
      </div>
    </div>
  )
}
