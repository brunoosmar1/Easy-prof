'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateClass } from '@/lib/actions/classes'
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
import { Pencil } from 'lucide-react'
import { Class } from '@/types'

const GRADES = [
  'Maternal', 'Jardim I', 'Jardim II', 'Pré-escola',
  '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
  '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
  '1º Ano EM', '2º Ano EM', '3º Ano EM',
]

export function EditClassDialog({ cls }: { cls: Class }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: cls.name,
      grade: cls.grade,
      subject: cls.subject,
      school: cls.school,
      academic_year: cls.academic_year,
      bimester: cls.bimester,
      shift: cls.shift,
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    const result = await updateClass(cls.id, data)
    setLoading(false)
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Turma atualizada!' })
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(true)}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar turma</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome da turma</Label>
                <Input {...register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Série/Ano</Label>
                <Select onValueChange={(v) => setValue('grade', v)} defaultValue={cls.grade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Input {...register('subject')} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Escola</Label>
                <Input {...register('school')} />
              </div>
              <div className="space-y-2">
                <Label>Ano letivo</Label>
                <Input {...register('academic_year')} />
              </div>
              <div className="space-y-2">
                <Label>Bimestre</Label>
                <Select onValueChange={(v) => setValue('bimester', parseInt(v))} defaultValue={cls.bimester.toString()}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((b) => <SelectItem key={b} value={b.toString()}>{b}º Bimestre</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select onValueChange={(v) => setValue('shift', v)} defaultValue={cls.shift}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Manhã', 'Tarde', 'Noite', 'Integral'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={loading} variant="brand">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
