'use client'

import { useState, useEffect } from 'react'
import { Class } from '@/types'
import { getStudents } from '@/lib/actions/students'
import { getAssessments, getClassGradeSummary, upsertGradesBulk } from '@/lib/actions/grades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Save, Trophy, Users } from 'lucide-react'
import { formatGrade, getStudentStatus, getStatusLabel, getStatusColor } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'
import { CreateAssessmentButton } from '@/components/avaliacoes/create-assessment-button'

export function GradesManager({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [assessments, setAssessments] = useState<any[]>([])
  const [summary, setSummary] = useState<any[]>([])
  const [gradeInputs, setGradeInputs] = useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedClassId) return
    loadData()
  }, [selectedClassId])

  const loadData = async () => {
    setLoading(true)
    const [assessmentsData, summaryData] = await Promise.all([
      getAssessments(selectedClassId),
      getClassGradeSummary(selectedClassId),
    ])
    setAssessments(assessmentsData)
    setSummary(summaryData || [])

    const inputs: Record<string, Record<string, string>> = {}
    summaryData?.forEach((row: any) => {
      inputs[row.student.id] = {}
      row.grades.forEach((g: any) => {
        if (g.value !== null) {
          inputs[row.student.id][g.assessment.id] = g.value.toString()
        }
      })
    })
    setGradeInputs(inputs)
    setLoading(false)
  }

  const handleGradeChange = (studentId: string, assessmentId: string, value: string) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentId]: value,
      },
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const grades: { assessment_id: string; student_id: string; class_id: string; value: number }[] = []

    Object.entries(gradeInputs).forEach(([studentId, assessmentGrades]) => {
      Object.entries(assessmentGrades).forEach(([assessmentId, value]) => {
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
          grades.push({
            assessment_id: assessmentId,
            student_id: studentId,
            class_id: selectedClassId,
            value: numValue,
          })
        }
      })
    })

    const result = await upsertGradesBulk(grades)
    setSaving(false)

    if (result.error) {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Notas salvas com sucesso!' })
      loadData()
    }
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId)

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
              <CreateAssessmentButton classId={selectedClassId} onCreated={loadData} />
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedClassId && (
        <EmptyState
          icon={Trophy}
          title="Selecione uma turma"
          description="Escolha uma turma para gerenciar as notas dos alunos."
        />
      )}

      {selectedClassId && !loading && assessments.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="Nenhuma avaliação cadastrada"
          description="Crie avaliações para começar a lançar notas nesta turma."
        />
      )}

      {selectedClassId && !loading && assessments.length > 0 && summary.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Notas — {selectedClass?.name}</CardTitle>
            <Button variant="brand" size="sm" loading={saving} onClick={handleSaveAll} className="gap-1">
              <Save className="w-3.5 h-3.5" />
              Salvar tudo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 w-8">#</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 min-w-[160px]">Aluno</th>
                    {assessments.map((a) => (
                      <th key={a.id} className="text-center py-2 px-2 font-medium text-gray-500 min-w-[80px]">
                        <div className="text-xs leading-tight">
                          {a.name}
                          <div className="text-gray-400 font-normal">Peso {a.weight}</div>
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-2 px-2 font-medium text-gray-500 min-w-[70px]">Média</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 min-w-[100px]">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row: any) => {
                    const status = getStudentStatus(row.average)
                    const statusColors = getStatusColor(status)
                    return (
                      <tr
                        key={row.student.id}
                        className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <td className="py-2 pr-4 text-gray-400 text-xs">{row.student.call_number}</td>
                        <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">
                          {row.student.full_name}
                        </td>
                        {assessments.map((a) => (
                          <td key={a.id} className="py-2 px-2 text-center">
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={gradeInputs[row.student.id]?.[a.id] || ''}
                              onChange={(e) =>
                                handleGradeChange(row.student.id, a.id, e.target.value)
                              }
                              className="w-16 text-center h-8 text-xs mx-auto"
                              placeholder="—"
                            />
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center font-bold text-gray-900 dark:text-white">
                          {row.average > 0 ? formatGrade(row.average) : '—'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {row.average > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors}`}>
                              {getStatusLabel(status)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
