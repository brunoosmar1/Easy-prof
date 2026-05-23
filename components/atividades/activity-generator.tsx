'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateActivity, saveActivity } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Save, PenTool, CheckCircle } from 'lucide-react'

const activitySchema = z.object({
  grade: z.string().min(1, 'Selecione a série'),
  subject: z.string().min(2, 'Informe a disciplina'),
  topic: z.string().min(3, 'Informe o tema'),
  type: z.string().min(1, 'Selecione o tipo'),
  difficulty: z.string().min(1, 'Selecione a dificuldade'),
  questionCount: z.coerce.number().min(1).max(20),
})

type ActivityForm = z.infer<typeof activitySchema>

const GRADES = [
  '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1º Ano EM', '2º Ano EM', '3º Ano EM',
]

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Múltipla escolha' },
  { value: 'true_false', label: 'Verdadeiro ou Falso' },
  { value: 'essay', label: 'Discursiva' },
  { value: 'fill_blank', label: 'Complete as lacunas' },
  { value: 'matching', label: 'Associação' },
  { value: 'math_problem', label: 'Problema matemático' },
  { value: 'text_interpretation', label: 'Interpretação de texto' },
]

export function ActivityGenerator() {
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<any | null>(null)
  const [formData, setFormData] = useState<ActivityForm | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { questionCount: 5, difficulty: 'medium' },
  })

  const onGenerate = async (data: ActivityForm) => {
    setGenerating(true)
    setGenerated(null)
    setFormData(data)
    const result = await generateActivity(data)
    setGenerating(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      setGenerated(result.data)
      toast({ title: 'Atividade gerada com sucesso!' })
    }
  }

  const onSave = async () => {
    if (!generated || !formData) return
    setSaving(true)
    const result = await saveActivity({
      title: generated.title,
      subject: formData.subject,
      grade: formData.grade,
      type: formData.type,
      difficulty: formData.difficulty,
      questions: generated.questions,
      answer_key: generated.answer_key,
    })
    setSaving(false)
    if (result.error) {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Atividade salva!' })
    }
  }

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700',
  }
  const difficultyLabels: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Configurar Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Série/Ano</Label>
                <Select onValueChange={(v) => setValue('grade', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Input placeholder="Ex: Ciências" {...register('subject')} />
              </div>

              <div className="space-y-2">
                <Label>Tipo de questão</Label>
                <Select onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select onValueChange={(v) => setValue('difficulty', v)} defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade de questões</Label>
                <Input type="number" min={1} max={20} {...register('questionCount')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tema/Conteúdo</Label>
              <Textarea
                placeholder="Ex: Sistema solar, planetas e suas características..."
                rows={2}
                {...register('topic')}
              />
            </div>

            <Button type="submit" loading={generating} variant="brand" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {generating ? 'Gerando atividade...' : 'Gerar com IA'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                {generated.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={difficultyColors[formData?.difficulty || 'medium']}>
                  {difficultyLabels[formData?.difficulty || 'medium']}
                </Badge>
                <Badge variant="secondary">{generated.questions?.length} questões</Badge>
              </div>
            </div>
            <Button onClick={onSave} loading={saving} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </CardHeader>
          <CardContent>
            {generated.instructions && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">{generated.instructions}</p>
              </div>
            )}

            <div className="space-y-6">
              {generated.questions?.map((q: any, i: number) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">
                    {i + 1}. {q.question}
                  </p>
                  {q.options && q.options.length > 0 && (
                    <ul className="space-y-1 mb-3 ml-4">
                      {q.options.map((opt: string, j: number) => (
                        <li key={j} className="text-sm text-gray-600 dark:text-gray-300">{opt}</li>
                      ))}
                    </ul>
                  )}
                  {q.answer && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">Resposta: </span>
                        <span className="text-xs text-green-700 dark:text-green-400">{q.answer}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {generated.answer_key && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Gabarito</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {generated.answer_key}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
