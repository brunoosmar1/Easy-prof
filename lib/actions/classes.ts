'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getClasses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('classes')
    .select(`
      *,
      students(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data?.map((c) => ({
    ...c,
    student_count: c.students?.[0]?.count ?? 0,
  })) ?? []
}

export async function getClass(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data
}

export async function createClass(formData: {
  name: string
  grade: string
  subject: string
  school: string
  academic_year: string
  bimester: number
  shift: string
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
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 1) {
      return { error: 'Plano gratuito permite apenas 1 turma. Faça upgrade para Premium.' }
    }
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({ ...formData, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/turmas')
  revalidatePath('/dashboard')
  return { data }
}

export async function updateClass(
  id: string,
  formData: Partial<{
    name: string
    grade: string
    subject: string
    school: string
    academic_year: string
    bimester: number
    shift: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('classes')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/turmas')
  revalidatePath(`/turmas/${id}`)
  return { success: true }
}

export async function deleteClass(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/turmas')
  revalidatePath('/dashboard')
  return { success: true }
}
