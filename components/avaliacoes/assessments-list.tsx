'use client'

import { useState, useEffect } from 'react'
import { Class } from '@/types'
import { getAssessments, deleteAssessment } from '@/lib/actions/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { BookMarked, Trash2, Calendar, Scale } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'
import { CreateAssessmentButton } from './create-assessment-button'

const typeColors: Record<string, string> = {
  prova: 'bg-blue-100 text-blue-700',
  trabalho: 'bg-green-100 text-green-700',
  seminario: 'bg-purple-100 text-purple-700',
  projeto: 'bg-orange-100 text-orange-700',
  participacao: 'bg-teal-100 text-teal-700',
  atividade: 'bg-gray-100 text-gray-700',
}

export function AssessmentsList({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadAssessments = async () => {
    if (!selectedClassId) return
    setLoading(true)
    const data = await getAssessments(selectedClassId)
    setAssessments(data)
    setLoading(false)
  }

  useEffect(() => { loadAssessments() }, [selectedClassId])

  const handleDelete = async (id: string) => {
    const result = await deleteAssessment(id)
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Avaliação excluída' })
      loadAssessments()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>Turma</Label>
              <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} — {cls.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClassId && (
              <CreateAssessmentButton classId={selectedClassId} onCreated={loadAssessments} />
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedClassId && (
        <EmptyState icon={BookMarked} title="Selecione uma turma" description="Escolha uma turma para ver suas avaliações." />
      )}

      {selectedClassId && !loading && assessments.length === 0 && (
        <EmptyState icon={BookMarked} title="Nenhuma avaliação" description="Crie a primeira avaliação desta turma." />
      )}

      {selectedClassId && assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avaliações ({assessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                      <BookMarked className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{a.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeColors[a.type] || 'bg-gray-100 text-gray-600'}`}>
                          {a.type}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(a.date)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          Peso {a.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
