'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateLessonPlan, saveLessonPlan } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Save, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { LessonPlanContent } from '@/types'
import { Class } from '@/types'

const planSchema = z.object({
  grade: z.string().min(1, 'Selecione a série'),
  subject: z.string().min(2, 'Informe a disciplina'),
  theme: z.string().min(3, 'Informe o tema'),
  content: z.string().min(10, 'Descreva o conteúdo'),
  bnccSkills: z.string(),
  lessonCount: z.coerce.number().min(1).max(20),
})

type PlanForm = z.infer<typeof planSchema>

const GRADES = [
  'Maternal', 'Jardim I', 'Jardim II', 'Pré-escola',
  '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1º Ano EM', '2º Ano EM', '3º Ano EM',
]

interface LessonPlanGeneratorProps {
  classes: Class[]
}

export function LessonPlanGenerator({ classes }: LessonPlanGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generated, setGenerated] = useState<LessonPlanContent | null>(null)
  const [editedContent, setEditedContent] = useState<LessonPlanContent | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<PlanForm | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: { lessonCount: 2 },
  })

  const onGenerate = async (data: PlanForm) => {
    setGenerating(true)
    setGenerated(null)
    setFormData(data)

    const result = await generateLessonPlan(data)
    setGenerating(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      setGenerated(result.data)
      setEditedContent(result.data)
      toast({ title: 'Planejamento gerado com sucesso!' })
    }
  }

  const onSave = async () => {
    if (!editedContent || !formData) return
    setSaving(true)

    const result = await saveLessonPlan({
      title: `${formData.theme} - ${formData.grade}`,
      grade: formData.grade,
      subject: formData.subject,
      theme: formData.theme,
      content: formData.content,
      bncc_skills: formData.bnccSkills,
      lesson_count: formData.lessonCount,
      generated_content: editedContent,
    })

    setSaving(false)

    if (result.error) {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Planejamento salvo com sucesso!' })
    }
  }

  const sections = generated
    ? [
        { key: 'objectives', label: 'Objetivos de Aprendizagem' },
        { key: 'competencies', label: 'Competências da BNCC' },
        { key: 'skills', label: 'Habilidades' },
        { key: 'contents', label: 'Conteúdos' },
        { key: 'methodology', label: 'Metodologia' },
        { key: 'resources', label: 'Recursos Didáticos' },
        { key: 'development', label: 'Desenvolvimento das Aulas' },
        { key: 'evaluation', label: 'Avaliação' },
        { key: 'schedule', label: 'Cronograma' },
      ]
    : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Gerar Planejamento com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Série/Ano</Label>
                <Select onValueChange={(v) => setValue('grade', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-xs text-red-500">{errors.grade.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Input placeholder="Ex: Matemática" {...register('subject')} />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Quantidade de aulas</Label>
                <Input type="number" min={1} max={20} {...register('lessonCount')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tema da aula</Label>
              <Input placeholder="Ex: Frações e números decimais" {...register('theme')} />
              {errors.theme && <p className="text-xs text-red-500">{errors.theme.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Conteúdo a ser trabalhado</Label>
              <Textarea
                placeholder="Descreva os conteúdos, conceitos e habilidades que serão abordados..."
                rows={3}
                {...register('content')}
              />
              {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Habilidades BNCC (opcional)</Label>
              <Input
                placeholder="Ex: EF07MA08, EF07MA09"
                {...register('bnccSkills')}
              />
            </div>

            <Button type="submit" loading={generating} variant="brand" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {generating ? 'Gerando planejamento...' : 'Gerar com IA'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generated && editedContent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Planejamento Gerado
            </CardTitle>
            <Button onClick={onSave} loading={saving} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map(({ key, label }) => (
                <div key={key} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    {expanded[key] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expanded[key] && (
                    <div className="px-4 pb-4">
                      <Textarea
                        value={(editedContent as any)[key] || ''}
                        onChange={(e) =>
                          setEditedContent((prev) => prev ? ({ ...prev, [key]: e.target.value }) : null)
                        }
                        rows={6}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
