'use client'

import { useState, useEffect } from 'react'
import { Class } from '@/types'
import { getStudents } from '@/lib/actions/students'
import { getAttendance, getAttendanceStats, recordAttendance } from '@/lib/actions/attendance'
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
import { Users, Check, X, AlertCircle, Save, BarChart3 } from 'lucide-react'
import { formatPercentage } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

interface AttendanceManagerProps {
  classes: Class[]
}

type AttendanceRecord = Record<string, 'present' | 'absent' | 'justified'>

export function AttendanceManager({ classes }: AttendanceManagerProps) {
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord>({})
  const [stats, setStats] = useState<any[]>([])
  const [view, setView] = useState<'register' | 'stats'>('register')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedClassId) return
    loadData()
  }, [selectedClassId, selectedDate])

  const loadData = async () => {
    setLoading(true)
    const [studentsData, attendanceData, statsData] = await Promise.all([
      getStudents(selectedClassId),
      getAttendance(selectedClassId, selectedDate),
      getAttendanceStats(selectedClassId),
    ])

    setStudents(studentsData)
    setStats(statsData || [])

    const attendanceMap: AttendanceRecord = {}
    studentsData.forEach((s: any) => {
      attendanceMap[s.id] = 'present'
    })
    attendanceData.forEach((a: any) => {
      attendanceMap[a.student_id] = a.status
    })
    setAttendance(attendanceMap)
    setLoading(false)
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]:
        prev[studentId] === 'present'
          ? 'absent'
          : prev[studentId] === 'absent'
          ? 'justified'
          : 'present',
    }))
  }

  const markAllPresent = () => {
    const all: AttendanceRecord = {}
    students.forEach((s) => { all[s.id] = 'present' })
    setAttendance(all)
  }

  const handleSave = async () => {
    if (!selectedClassId) return
    setSaving(true)

    const records = students.map((s) => ({
      student_id: s.id,
      class_id: selectedClassId,
      date: selectedDate,
      status: attendance[s.id] || 'present',
    }))

    const result = await recordAttendance(records)
    setSaving(false)

    if (result.error) {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Frequência registrada com sucesso!' })
      loadData()
    }
  }

  const statusConfig = {
    present: { label: 'P', color: 'bg-green-500 text-white', badge: 'Presente' },
    absent: { label: 'F', color: 'bg-red-500 text-white', badge: 'Falta' },
    justified: { label: 'J', color: 'bg-yellow-500 text-white', badge: 'Justificada' },
  }

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length

  return (
    <div className="space-y-6">
      {/* Filters */}
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

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>

            {selectedClassId && (
              <div className="flex gap-2">
                <Button
                  variant={view === 'register' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('register')}
                >
                  Registrar
                </Button>
                <Button
                  variant={view === 'stats' ? 'brand' : 'outline'}
                  size="sm"
                  onClick={() => setView('stats')}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Estatísticas
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedClassId && (
        <EmptyState
          icon={Users}
          title="Selecione uma turma"
          description="Escolha uma turma para registrar a frequência dos alunos."
        />
      )}

      {selectedClassId && view === 'register' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Lista de chamada — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              {students.length > 0 && (
                <>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {presentCount} presentes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {absentCount} faltas
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Todos presentes
                  </Button>
                  <Button variant="brand" size="sm" loading={saving} onClick={handleSave} className="gap-1">
                    <Save className="w-3.5 h-3.5" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : students.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum aluno cadastrado"
                description="Cadastre alunos nesta turma para registrar frequência."
              />
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-4">
                  Clique no status do aluno para alternar: Presente → Falta → Justificada
                </p>
                {students.map((student) => {
                  const status = attendance[student.id] || 'present'
                  const cfg = statusConfig[status]
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6 text-right">
                          {student.call_number}
                        </span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.full_name}
                        </p>
                      </div>
                      <button
                        className={`w-9 h-9 rounded-full text-sm font-bold transition-all hover:scale-110 ${cfg.color}`}
                        onClick={() => toggleAttendance(student.id)}
                        title={`Status atual: ${cfg.badge}. Clique para alternar.`}
                      >
                        {cfg.label}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedClassId && view === 'stats' && stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estatísticas de Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.map((s: any) => (
                <div key={s.student.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 w-6 text-right">{s.student.call_number}</span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex-1 min-w-0 truncate">
                    {s.student.full_name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="text-green-600">{s.present}P</span>
                    <span className="text-red-600">{s.absent}F</span>
                    <span className="text-yellow-600">{s.justified}J</span>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-xs font-semibold ${s.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(s.percentage)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${s.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(s.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  {s.percentage < 75 && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
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
