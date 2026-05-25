'use client'

import { useState, useEffect } from 'react'
import { Class } from '@/types'
import { getStudents } from '@/lib/actions/students'
import { getAttendanceStats } from '@/lib/actions/attendance'
import { getClassGradeSummary } from '@/lib/actions/grades'
import { generateStudentReport, saveStudentReport } from '@/lib/actions/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Save, FileText, User } from 'lucide-react'
import { formatGrade, formatPercentage } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

const REPORT_SECTIONS = [
  { key: 'academic_performance', label: 'Desempenho Acadêmico' },
  { key: 'participation', label: 'Participação' },
  { key: 'behavior', label: 'Comportamento' },
  { key: 'difficulties', label: 'Dificuldades Encontradas' },
  { key: 'strengths', label: 'Potencialidades' },
  { key: 'recommendations', label: 'Recomendações Pedagógicas' },
  { key: 'interventions', label: 'Intervenções Necessárias' },
]

export function ReportGenerator({ classes }: { classes: Class[] }) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any[]>([])
  const [gradeSummary, setGradeSummary] = useState<any[]>([])
  const [teacherNotes, setTeacherNotes] = useState('')
  const [bimester, setBimester] = useState('1')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [report, setReport] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (!selectedClassId) return
    Promise.all([
      getStudents(selectedClassId),
      getAttendanceStats(selectedClassId),
      getClassGradeSummary(selectedClassId),
    ]).then(([s, a, g]) => {
      setStudents(s)
      setAttendanceStats(a || [])
      setGradeSummary(g || [])
    })
  }, [selectedClassId])

  const selectedStudent = students.find((s) => s.id === selectedStudentId)
  const studentAttendance = attendanceStats.find((a) => a.student.id === selectedStudentId)
  const studentGrades = gradeSummary.find((g) => g.student.id === selectedStudentId)

  const handleGenerate = async () => {
    if (!selectedStudent || !selectedClassId) return
    setGenerating(true)

    const grades =
      studentGrades?.grades
        ?.filter((g: any) => g.value !== null)
        .map((g: any) => ({
          assessmentName: g.assessment.name,
          value: g.value,
          weight: g.assessment.weight,
        })) || []

    const selectedClass = classes.find((c) => c.id === selectedClassId)

    const result = await generateStudentReport({
      studentName: selectedStudent.full_name,
      grade: selectedClass?.grade || '',
      subject: selectedClass?.subject || '',
      bimester: parseInt(bimester),
      attendance: {
        total: studentAttendance?.total || 0,
        present: studentAttendance?.present || 0,
        absent: studentAttendance?.absent || 0,
        percentage: studentAttendance?.percentage || 100,
      },
      grades,
      average: studentGrades?.average || 0,
      status: studentGrades?.status || 'approved',
      teacherNotes,
    })

    setGenerating(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      setReport(result.data)
      toast({ title: 'Relatório gerado com sucesso!' })
    }
  }

  const handleSave = async () => {
    if (!report || !selectedStudentId || !selectedClassId) return
    setSaving(true)

    const result = await saveStudentReport({
      student_id: selectedStudentId,
      class_id: selectedClassId,
      bimester: parseInt(bimester),
      academic_year: new Date().getFullYear().toString(),
      academic_performance: report.academic_performance ?? '',
      participation: report.participation ?? '',
      behavior: report.behavior ?? '',
      difficulties: report.difficulties ?? '',
      strengths: report.strengths ?? '',
      recommendations: report.recommendations ?? '',
      interventions: report.interventions ?? '',
    })

    setSaving(false)

    if (result.error) {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Relatório salvo!' })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Configurar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Turma</Label>
              <Select onValueChange={(v) => { setSelectedClassId(v); setSelectedStudentId(''); setReport(null) }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select onValueChange={(v) => { setSelectedStudentId(v); setReport(null) }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.call_number}. {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Bimestre</Label>
              <Select onValueChange={setBimester} defaultValue="1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((b) => (
                    <SelectItem key={b} value={b.toString()}>{b}º Bimestre</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedStudent.full_name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Frequência</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(studentAttendance?.percentage || 100)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Faltas</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {studentAttendance?.absent || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Média</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {studentGrades ? formatGrade(studentGrades.average) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Observações pedagógicas adicionais (opcional)</Label>
            <Textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              rows={3}
              placeholder="Inclua informações específicas sobre o aluno que a IA deve considerar ao gerar o relatório..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!selectedStudentId || generating}
            loading={generating}
            variant="brand"
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Gerando relatório...' : 'Gerar relatório com IA'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório de {selectedStudent?.full_name}
            </CardTitle>
            <Button onClick={handleSave} loading={saving} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Salvar relatório
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {REPORT_SECTIONS.map(({ key, label }) => (
                <div key={key}>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wide">
                    {label}
                  </h4>
                  <Textarea
                    value={report[key] || ''}
                    onChange={(e) => setReport((prev) => prev ? ({ ...prev, [key]: e.target.value }) : null)}
                    rows={4}
                    className="text-sm leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
