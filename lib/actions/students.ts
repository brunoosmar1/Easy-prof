'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStudents(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .order('call_number', { ascending: true })

  return data ?? []
}

export async function getStudent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function createStudent(formData: {
  class_id: string
  full_name: string
  call_number: number
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  pedagogical_notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', formData.class_id)
      .eq('user_id', user.id)

    if ((count ?? 0) >= 30) {
      return { error: 'Plano gratuito permite até 30 alunos por turma. Faça upgrade para Premium.' }
    }
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/turmas/${formData.class_id}`)
  revalidatePath('/dashboard')
  return { data }
}

export async function updateStudent(
  id: string,
  formData: Partial<{
    full_name: string
    call_number: number
    birth_date: string
    guardian_name: string
    guardian_phone: string
    guardian_email: string
    pedagogical_notes: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('students')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/alunos')
  return { success: true }
}

export async function deleteStudent(id: string, classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/turmas/${classId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function transferStudent(studentId: string, newClassId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('students')
    .update({ class_id: newClassId })
    .eq('id', studentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/turmas')
  return { success: true }
}
