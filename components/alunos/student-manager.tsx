'use client'

import { useState } from 'react'
import { Student } from '@/types'
import { createStudent, updateStudent, deleteStudent } from '@/lib/actions/students'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { EmptyState } from '@/components/shared/empty-state'
import { toast } from '@/hooks/use-toast'
import { GraduationCap, Plus, Pencil, Trash2, Phone, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface StudentManagerProps {
  classId: string
  initialStudents: Student[]
}

export function StudentManager({ classId, initialStudents }: StudentManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [createOpen, setCreateOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Student>>({
    defaultValues: { call_number: students.length + 1 },
  })

  const handleCreate = async (data: any) => {
    setLoading(true)
    const result = await createStudent({ ...data, class_id: classId })
    setLoading(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Aluno cadastrado!' })
      setStudents((prev) => [...prev, result.data as Student].sort((a, b) => a.call_number - b.call_number))
      setCreateOpen(false)
      reset({ call_number: students.length + 2 })
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editStudent) return
    setLoading(true)
    const result = await updateStudent(editStudent.id, data)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Aluno atualizado!' })
      setStudents((prev) =>
        prev.map((s) => (s.id === editStudent.id ? { ...s, ...data } : s))
      )
      setEditStudent(null)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    const result = await deleteStudent(id, classId)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Aluno removido' })
      setStudents((prev) => prev.filter((s) => s.id !== id))
      setConfirmDelete(null)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.call_number.toString().includes(search)
  )

  const StudentForm = ({ onSubmit, defaultValues }: { onSubmit: (d: any) => void; defaultValues?: Partial<Student> }) => {
    const form = useForm({ defaultValues })
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>Nome completo</Label>
            <Input placeholder="Nome do aluno" {...form.register('full_name', { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Nº de chamada</Label>
            <Input type="number" min={1} {...form.register('call_number', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input type="date" {...form.register('birth_date')} />
          </div>
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input placeholder="Nome do responsável" {...form.register('guardian_name')} />
          </div>
          <div className="space-y-2">
            <Label>Telefone do responsável</Label>
            <Input placeholder="(11) 99999-9999" {...form.register('guardian_phone')} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>E-mail do responsável</Label>
            <Input type="email" placeholder="email@exemplo.com" {...form.register('guardian_email')} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Observações pedagógicas</Label>
            <Textarea rows={2} placeholder="Necessidades especiais, observações importantes..." {...form.register('pedagogical_notes')} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); setEditStudent(null) }}>Cancelar</Button>
          <Button type="submit" loading={loading} variant="brand">Salvar</Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Alunos ({students.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar aluno..."
              className="w-48 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="brand"
              size="sm"
              className="gap-1"
              onClick={() => { reset({ call_number: students.length + 1 }); setCreateOpen(true) }}
            >
              <Plus className="w-3.5 h-3.5" />
              Aluno
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={search ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              description={search ? 'Tente outra busca.' : 'Cadastre o primeiro aluno desta turma.'}
              action={!search ? { label: 'Cadastrar aluno', onClick: () => setCreateOpen(true) } : undefined}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm flex-shrink-0">
                    {student.call_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {student.full_name}
                    </p>
                    {(student.guardian_name || student.guardian_phone) && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {student.guardian_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {student.guardian_name}
                          </span>
                        )}
                        {student.guardian_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {student.guardian_phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {student.pedagogical_notes && (
                    <Badge variant="warning" className="text-xs flex-shrink-0">Obs.</Badge>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditStudent(student)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setConfirmDelete(student.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Aluno</DialogTitle>
          </DialogHeader>
          <StudentForm onSubmit={handleCreate} defaultValues={{ call_number: students.length + 1 }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <StudentForm onSubmit={handleUpdate} defaultValues={editStudent} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover aluno</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja remover este aluno? Todos os dados de frequência e notas associados serão excluídos.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              loading={loading}
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
