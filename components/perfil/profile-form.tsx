'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateProfile } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { User, Sparkles, Crown, BarChart3 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

interface ProfileFormProps {
  profile: any
  subscription: any
  aiUsageCount: number
}

export function ProfileForm({ profile, subscription, aiUsageCount }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: profile?.full_name || '',
      schoolName: profile?.school_name || '',
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    const result = await updateProfile({
      fullName: data.fullName,
      schoolName: data.schoolName,
    })
    setLoading(false)

    if (result?.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Perfil atualizado com sucesso!' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(profile?.full_name || 'U')}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {profile?.full_name}
              </p>
              <p className="text-gray-500 text-sm">{profile?.email}</p>
              {profile?.plan === 'premium' ? (
                <Badge variant="premium" className="mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">Gratuito</Badge>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input {...register('fullName')} placeholder="Seu nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Nome da escola</Label>
              <Input {...register('schoolName')} placeholder="Ex: EMEF João Paulo II" />
            </div>
            <Button type="submit" loading={loading} variant="brand">
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Plano {profile?.plan === 'premium' ? 'Premium' : 'Gratuito'}
              </p>
              {subscription?.current_period_end && profile?.plan === 'premium' && (
                <p className="text-sm text-gray-500">
                  Válido até{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <Link href="/planos">
              <Button variant={profile?.plan === 'premium' ? 'outline' : 'brand'} size="sm">
                {profile?.plan === 'premium' ? 'Gerenciar' : 'Fazer upgrade'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Uso da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Gerações de IA este mês
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.plan === 'premium' ? 'Ilimitado no plano Premium' : `${profile?.ai_generations_count ?? 0} de 5 utilizados`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {aiUsageCount} total
                </span>
              </div>
            </div>
            {profile?.plan === 'free' && (
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-brand-600 transition-all"
                  style={{ width: `${Math.min(((profile?.ai_generations_count ?? 0) / 5) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
