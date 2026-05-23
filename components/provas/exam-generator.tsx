'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { generateExam } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Sparkles, FileText, CheckCircle } from 'lucide-react'

const examSchema = z.object({
  grade: z.string().min(1, 'Selecione a série'),
  subject: z.string().min(2, 'Informe a disciplina'),
  content: z.string().min(10, 'Descreva o conteúdo'),
  questionCount: z.coerce.number().min(1).max(30),
  generateVersionB: z.boolean(),
})

type ExamForm = z.infer<typeof examSchema>

const GRADES = [
  '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1º Ano EM', '2º Ano EM', '3º Ano EM',
]

export function ExamGenerator() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<any | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: { questionCount: 10, generateVersionB: false },
  })

  const generateVersionB = watch('generateVersionB')

  const onGenerate = async (data: ExamForm) => {
    setGenerating(true)
    setGenerated(null)
    const result = await generateExam(data)
    setGenerating(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      setGenerated(result.data)
      toast({ title: 'Prova gerada com sucesso!' })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Configurar Prova
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Input placeholder="Ex: História" {...register('subject')} />
              </div>

              <div className="space-y-2">
                <Label>Nº de questões</Label>
                <Input type="number" min={1} max={30} {...register('questionCount')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo da prova</Label>
              <Textarea
                rows={4}
                placeholder="Descreva os conteúdos, capítulos e conceitos que serão cobrados na prova..."
                {...register('content')}
              />
              {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="versionB"
                {...register('generateVersionB')}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="versionB" className="cursor-pointer">
                Gerar também a Versão B (questões embaralhadas)
              </Label>
            </div>

            <Button type="submit" loading={generating} variant="brand" className="gap-2">
              <Sparkles className="w-4 h-4" />
              {generating ? 'Gerando prova...' : 'Gerar prova com IA'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {generated.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="version_a">
              <TabsList className="mb-4">
                <TabsTrigger value="version_a">Versão A</TabsTrigger>
                {generated.version_b && (
                  <TabsTrigger value="version_b">Versão B</TabsTrigger>
                )}
                <TabsTrigger value="answer_key">Gabarito</TabsTrigger>
              </TabsList>

              <TabsContent value="version_a">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {generated.version_a}
                  </pre>
                </div>
              </TabsContent>

              {generated.version_b && (
                <TabsContent value="version_b">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {generated.version_b}
                    </pre>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="answer_key">
                <div className="bg-green-50 dark:bg-green-950 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Gabarito Oficial
                    </span>
                  </div>
                  <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {generated.answer_key}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
