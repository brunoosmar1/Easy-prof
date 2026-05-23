'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Class } from '@/types'
import { deleteClass } from '@/lib/actions/classes'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { Users, Pencil, Trash2, ArrowRight, BookOpen, Clock } from 'lucide-react'
import { getBimesterLabel } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EditClassDialog } from './edit-class-dialog'

interface ClassListProps {
  classes: (Class & { student_count: number })[]
}

export function ClassList({ classes }: ClassListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteClass(id)
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Turma excluída', variant: 'default' })
    }
    setDeletingId(null)
    setConfirmDelete(null)
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhuma turma cadastrada"
        description="Crie sua primeira turma para começar a organizar seus alunos, frequência e avaliações."
        action={{
          label: 'Criar primeira turma',
          onClick: () => {},
        }}
      />
    )
  }

  const shiftColors: Record<string, string> = {
    'Manhã': 'bg-yellow-50 text-yellow-700',
    'Tarde': 'bg-orange-50 text-orange-700',
    'Noite': 'bg-blue-50 text-blue-700',
    'Integral': 'bg-green-50 text-green-700',
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-md transition-all group overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cls.school}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditClassDialog cls={cls} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setConfirmDelete(cls.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {cls.grade}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {cls.subject}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getBimesterLabel(cls.bimester)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.shift}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {cls.academic_year}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{cls.student_count} alunos</span>
                </div>
                <Link href={`/turmas/${cls.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-brand-600 hover:text-brand-700 hover:bg-brand-50 -mr-2">
                    Ver turma
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir turma</DialogTitle>
            <DialogDescription>
              Esta ação irá excluir permanentemente a turma e todos os dados relacionados
              (alunos, frequência, notas). Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={deletingId === confirmDelete}
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Excluir turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
