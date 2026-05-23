'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createAssessment } from '@/lib/actions/grades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

const assessmentSchema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  type: z.string().min(1, 'Selecione o tipo'),
  date: z.string().min(1, 'Informe a data'),
  weight: z.coerce.number().min(0.1).max(10),
  description: z.string().optional(),
  max_grade: z.coerce.number().min(1).max(100),
})

type AssessmentForm = z.infer<typeof assessmentSchema>

export function CreateAssessmentButton({
  classId,
  onCreated,
}: {
  classId: string
  onCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AssessmentForm>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { weight: 1, max_grade: 10, date: new Date().toISOString().split('T')[0] },
  })

  const onSubmit = async (data: AssessmentForm) => {
    setLoading(true)
    const result = await createAssessment({ ...data, class_id: classId })
    setLoading(false)
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Avaliação criada!' })
      setOpen(false)
      reset()
      onCreated?.()
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="w-3.5 h-3.5" />
        Nova avaliação
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Prova Bimestral 1" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select onValueChange={(v) => setValue('type', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {['prova', 'trabalho', 'seminario', 'projeto', 'participacao', 'atividade'].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" {...register('date')} />
              </div>
              <div className="space-y-2">
                <Label>Peso</Label>
                <Input type="number" step="0.1" min="0.1" max="10" {...register('weight')} />
              </div>
              <div className="space-y-2">
                <Label>Nota máxima</Label>
                <Input type="number" step="0.5" min="1" max="100" {...register('max_grade')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea rows={2} placeholder="Conteúdo cobrado, instruções..." {...register('description')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={loading} variant="brand">Criar avaliação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
