'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAttendance(classId: string, date?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('attendance')
    .select(`
      *,
      students(full_name, call_number)
    `)
    .eq('class_id', classId)
    .eq('user_id', user.id)

  if (date) {
    query = query.eq('date', date)
  }

  const { data } = await query.order('date', { ascending: false })
  return data ?? []
}

export async function getStudentAttendance(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return data ?? []
}

export async function recordAttendance(records: {
  student_id: string
  class_id: string
  date: string
  status: 'present' | 'absent' | 'justified'
  justification?: string
}[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const recordsWithUser = records.map((r) => ({ ...r, user_id: user.id }))

  const { error } = await supabase
    .from('attendance')
    .upsert(recordsWithUser, {
      onConflict: 'student_id,date',
      ignoreDuplicates: false,
    })

  if (error) return { error: error.message }

  revalidatePath('/frequencia')
  return { success: true }
}

export async function getAttendanceStats(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, call_number')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .order('call_number')

  const { data: attendance } = await supabase
    .from('attendance')
    .select('student_id, status')
    .eq('class_id', classId)
    .eq('user_id', user.id)

  if (!students || !attendance) return null

  return students.map((student) => {
    const studentAttendance = attendance.filter(
      (a) => a.student_id === student.id
    )
    const total = studentAttendance.length
    const present = studentAttendance.filter(
      (a) => a.status === 'present'
    ).length
    const absent = studentAttendance.filter(
      (a) => a.status === 'absent'
    ).length
    const justified = studentAttendance.filter(
      (a) => a.status === 'justified'
    ).length
    const percentage = total > 0 ? (present / total) * 100 : 100

    return {
      student,
      total,
      present,
      absent,
      justified,
      percentage,
    }
  })
}

export async function getClassAttendanceDates(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('attendance')
    .select('date')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const uniqueDates = [...new Set(data?.map((a) => a.date) ?? [])]
  return uniqueDates
}
