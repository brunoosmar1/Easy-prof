'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssessments(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('assessments')
    .select('*')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return data ?? []
}

export async function createAssessment(formData: {
  class_id: string
  name: string
  type: string
  date: string
  weight: number
  description?: string
  max_grade?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('assessments')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/avaliacoes')
  revalidatePath('/notas')
  return { data }
}

export async function updateAssessment(
  id: string,
  formData: Partial<{
    name: string
    type: string
    date: string
    weight: number
    description: string
    max_grade: number
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('assessments')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/avaliacoes')
  return { success: true }
}

export async function deleteAssessment(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/avaliacoes')
  revalidatePath('/notas')
  return { success: true }
}

export async function getGrades(classId: string, assessmentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('grades')
    .select(`
      *,
      students(full_name, call_number),
      assessments(name, weight, max_grade)
    `)
    .eq('class_id', classId)
    .eq('user_id', user.id)

  if (assessmentId) {
    query = query.eq('assessment_id', assessmentId)
  }

  const { data } = await query
  return data ?? []
}

export async function upsertGrade(formData: {
  assessment_id: string
  student_id: string
  class_id: string
  value: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('grades')
    .upsert(
      { ...formData, user_id: user.id },
      { onConflict: 'assessment_id,student_id' }
    )
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/notas')
  return { data }
}

export async function upsertGradesBulk(
  grades: { assessment_id: string; student_id: string; class_id: string; value: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const gradesWithUser = grades.map((g) => ({ ...g, user_id: user.id }))

  const { error } = await supabase
    .from('grades')
    .upsert(gradesWithUser, { onConflict: 'assessment_id,student_id' })

  if (error) return { error: error.message }

  revalidatePath('/notas')
  return { success: true }
}

export async function getStudentGradeSummary(studentId: string, classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: grades } = await supabase
    .from('grades')
    .select(`
      value,
      assessments(name, weight, max_grade, type, date)
    `)
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .eq('user_id', user.id)

  if (!grades || grades.length === 0) return null

  const totalWeight = grades.reduce(
    (a, g) => a + ((g.assessments as any)?.weight ?? 1),
    0
  )
  const weightedSum = grades.reduce(
    (a, g) => a + g.value * ((g.assessments as any)?.weight ?? 1),
    0
  )
  const average = totalWeight > 0 ? weightedSum / totalWeight : 0

  let status: 'approved' | 'recovery' | 'failed'
  if (average >= 7) status = 'approved'
  else if (average >= 5) status = 'recovery'
  else status = 'failed'

  return { grades, average, status }
}

export async function getClassGradeSummary(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, call_number')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .order('call_number')

  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, name, weight, max_grade')
    .eq('class_id', classId)
    .eq('user_id', user.id)

  const { data: grades } = await supabase
    .from('grades')
    .select('student_id, assessment_id, value')
    .eq('class_id', classId)
    .eq('user_id', user.id)

  if (!students || !assessments || !grades) return null

  return students.map((student) => {
    const studentGrades = assessments.map((assessment) => {
      const grade = grades.find(
        (g) => g.student_id === student.id && g.assessment_id === assessment.id
      )
      return {
        assessment,
        value: grade?.value ?? null,
      }
    })

    const gradedItems = studentGrades.filter((g) => g.value !== null)
    const totalWeight = gradedItems.reduce(
      (a, g) => a + (g.assessment.weight ?? 1),
      0
    )
    const weightedSum = gradedItems.reduce(
      (a, g) => a + (g.value! * (g.assessment.weight ?? 1)),
      0
    )
    const average = totalWeight > 0 ? weightedSum / totalWeight : 0

    let status: 'approved' | 'recovery' | 'failed'
    if (average >= 7) status = 'approved'
    else if (average >= 5) status = 'recovery'
    else status = 'failed'

    return { student, grades: studentGrades, average, status }
  })
}
