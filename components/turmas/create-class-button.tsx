'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClass } from '@/lib/actions/classes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Lock } from 'lucide-react'
import Link from 'next/link'

const classSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  grade: z.string().min(1, 'Selecione a série'),
  subject: z.string().min(2, 'Informe a disciplina'),
  school: z.string().min(2, 'Informe o nome da escola'),
  academic_year: z.string().min(4, 'Informe o ano letivo'),
  bimester: z.coerce.number().min(1).max(4),
  shift: z.string().min(1, 'Selecione o turno'),
})

type ClassForm = z.infer<typeof classSchema>

const GRADES = [
  'Maternal', 'Jardim I', 'Jardim II', 'Pré-escola',
  '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1º Ano EM', '2º Ano EM', '3º Ano EM',
]

interface CreateClassButtonProps {
  plan: string
  currentCount: number
}

export function CreateClassButton({ plan, currentCount }: CreateClassButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const isLocked = plan === 'free' && currentCount >= 1

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClassForm>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      academic_year: new Date().getFullYear().toString(),
      bimester: 1,
      shift: 'Manhã',
    },
  })

  const onSubmit = async (data: ClassForm) => {
    setLoading(true)
    const result = await createClass(data)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Turma criada com sucesso!' })
      setOpen(false)
      reset()
    }
  }

  if (isLocked) {
    return (
      <Link href="/planos">
        <Button variant="outline" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
          <Lock className="w-4 h-4" />
          Upgrade para mais turmas
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="brand" className="gap-2">
        <Plus className="w-4 h-4" />
        Nova turma
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar nova turma</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome da turma</Label>
                <Input placeholder="Ex: 7º Ano A" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Série/Ano</Label>
                <Select onValueChange={(v) => setValue('grade', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
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

              <div className="col-span-2 space-y-2">
                <Label>Nome da escola</Label>
                <Input placeholder="Ex: EMEF João Paulo" {...register('school')} />
                {errors.school && <p className="text-xs text-red-500">{errors.school.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Ano letivo</Label>
                <Input placeholder="2025" {...register('academic_year')} />
              </div>

              <div className="space-y-2">
                <Label>Bimestre</Label>
                <Select
                  onValueChange={(v) => setValue('bimester', parseInt(v))}
                  defaultValue="1"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((b) => (
                      <SelectItem key={b} value={b.toString()}>
                        {b}º Bimestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Turno</Label>
                <Select onValueChange={(v) => setValue('shift', v)} defaultValue="Manhã">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Manhã', 'Tarde', 'Noite', 'Integral'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} variant="brand">
                Criar turma
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
