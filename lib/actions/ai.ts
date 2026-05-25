'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWithAI, SYSTEM_PROMPTS } from '@/lib/openai/client'
import { revalidatePath } from 'next/cache'

const FREE_PLAN_LIMIT = 5

async function checkAndIncrementAIUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, ai_generations_count, ai_generations_reset_at')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Perfil não encontrado' }

  if (profile.plan === 'premium') return { userId: user.id, ok: true }

  const resetDate = new Date(profile.ai_generations_reset_at)
  const now = new Date()
  const daysDiff = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)

  let count = profile.ai_generations_count
  if (daysDiff >= 30) {
    count = 0
    await supabase
      .from('profiles')
      .update({ ai_generations_count: 0, ai_generations_reset_at: now.toISOString() })
      .eq('id', user.id)
  }

  if (count >= FREE_PLAN_LIMIT) {
    return {
      error: `Limite de ${FREE_PLAN_LIMIT} gerações por mês atingido no plano gratuito. Faça upgrade para Premium para uso ilimitado.`,
    }
  }

  await supabase
    .from('profiles')
    .update({ ai_generations_count: count + 1 })
    .eq('id', user.id)

  return { userId: user.id, ok: true }
}

export async function generateLessonPlan(data: {
  grade: string
  subject: string
  theme: string
  content: string
  bnccSkills: string
  lessonCount: number
}) {
  const check = await checkAndIncrementAIUsage()
  if (check.error) return { error: check.error }

  const userPrompt = `
Crie um planejamento de aula completo com os seguintes dados:
- Série/Ano: ${data.grade}
- Disciplina: ${data.subject}
- Tema: ${data.theme}
- Conteúdo: ${data.content}
- Habilidades BNCC: ${data.bnccSkills}
- Quantidade de aulas: ${data.lessonCount}

Retorne um JSON com a seguinte estrutura:
{
  "objectives": "Objetivos de aprendizagem detalhados",
  "competencies": "Competências gerais da BNCC desenvolvidas",
  "skills": "Habilidades específicas trabalhadas",
  "contents": "Conteúdos organizados por aula",
  "methodology": "Metodologia e estratégias pedagógicas",
  "resources": "Recursos didáticos necessários",
  "development": "Desenvolvimento detalhado de cada aula",
  "evaluation": "Critérios e instrumentos de avaliação",
  "schedule": "Cronograma das ${data.lessonCount} aulas"
}
`

  try {
    const { content, tokensUsed } = await generateWithAI(
      SYSTEM_PROMPTS.lessonPlan,
      userPrompt,
      3000
    )

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'Erro ao processar resposta da IA' }

    const generated = JSON.parse(jsonMatch[0])

    const supabase = await createClient()
    await supabase.from('ai_generations').insert({
      user_id: check.userId,
      type: 'lesson_plan',
      prompt: userPrompt,
      result: content,
      tokens_used: tokensUsed,
    })

    return { data: generated }
  } catch (err) {
    return { error: 'Erro ao gerar planejamento. Tente novamente.' }
  }
}

export async function saveLessonPlan(data: {
  title: string
  grade: string
  subject: string
  theme: string
  content: string
  bncc_skills: string
  lesson_count: number
  generated_content: object
  class_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: plan, error } = await supabase
    .from('lesson_plans')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/planejamento')
  return { data: plan }
}

export async function getLessonPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('lesson_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function deleteLessonPlan(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('lesson_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/planejamento')
  return { success: true }
}

export async function generateActivity(data: {
  grade: string
  subject: string
  topic: string
  type: string
  difficulty: string
  questionCount: number
}) {
  const check = await checkAndIncrementAIUsage()
  if (check.error) return { error: check.error }

  const userPrompt = `
Crie uma atividade pedagógica com os seguintes dados:
- Série/Ano: ${data.grade}
- Disciplina: ${data.subject}
- Tema/Conteúdo: ${data.topic}
- Tipo de questões: ${data.type}
- Dificuldade: ${data.difficulty === 'easy' ? 'Fácil' : data.difficulty === 'medium' ? 'Médio' : 'Difícil'}
- Quantidade de questões: ${data.questionCount}

Retorne um JSON com a seguinte estrutura:
{
  "title": "Título da atividade",
  "instructions": "Instruções gerais",
  "questions": [
    {
      "number": 1,
      "type": "${data.type}",
      "question": "Enunciado da questão",
      "options": ["A) opção1", "B) opção2", "C) opção3", "D) opção4"],
      "answer": "Resposta correta",
      "explanation": "Explicação da resposta"
    }
  ],
  "answer_key": "Gabarito completo formatado"
}
`

  try {
    const { content, tokensUsed } = await generateWithAI(
      SYSTEM_PROMPTS.activity,
      userPrompt,
      3000
    )

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'Erro ao processar resposta da IA' }

    const generated = JSON.parse(jsonMatch[0])

    const supabase = await createClient()
    await supabase.from('ai_generations').insert({
      user_id: check.userId,
      type: 'activity',
      prompt: userPrompt,
      result: content,
      tokens_used: tokensUsed,
    })

    return { data: generated }
  } catch {
    return { error: 'Erro ao gerar atividade. Tente novamente.' }
  }
}

export async function saveActivity(data: {
  title: string
  subject: string
  grade: string
  type: string
  difficulty: string
  questions: object[]
  answer_key: string
  class_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/atividades')
  return { data: activity }
}

export async function generateExam(data: {
  grade: string
  subject: string
  content: string
  questionCount: number
  generateVersionB: boolean
}) {
  const check = await checkAndIncrementAIUsage()
  if (check.error) return { error: check.error }

  const userPrompt = `
Crie uma prova formal com os seguintes dados:
- Série/Ano: ${data.grade}
- Disciplina: ${data.subject}
- Conteúdo: ${data.content}
- Quantidade de questões: ${data.questionCount}
- Gerar versão B: ${data.generateVersionB ? 'Sim' : 'Não'}

Retorne um JSON com a seguinte estrutura:
{
  "title": "Título da prova",
  "header": "Cabeçalho formatado (escola, disciplina, série, data, nome do aluno)",
  "version_a": "Prova versão A completa formatada com todas as questões",
  "version_b": "${data.generateVersionB ? 'Prova versão B com questões reordenadas e alternativas embaralhadas' : 'null'}",
  "answer_key": "Gabarito completo das versões A e B"
}
`

  try {
    const { content, tokensUsed } = await generateWithAI(
      SYSTEM_PROMPTS.exam,
      userPrompt,
      4000
    )

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'Erro ao processar resposta da IA' }

    const generated = JSON.parse(jsonMatch[0])

    const supabase = await createClient()
    await supabase.from('ai_generations').insert({
      user_id: check.userId,
      type: 'exam',
      prompt: userPrompt,
      result: content,
      tokens_used: tokensUsed,
    })

    return { data: generated }
  } catch {
    return { error: 'Erro ao gerar prova. Tente novamente.' }
  }
}

export async function generateStudentReport(data: {
  studentName: string
  grade: string
  subject: string
  bimester: number
  attendance: {
    total: number
    present: number
    absent: number
    percentage: number
  }
  grades: { assessmentName: string; value: number; weight: number }[]
  average: number
  status: string
  teacherNotes?: string
}) {
  const check = await checkAndIncrementAIUsage()
  if (check.error) return { error: check.error }

  const gradesText = data.grades
    .map((g) => `${g.assessmentName}: ${g.value.toFixed(1)} (peso ${g.weight})`)
    .join(', ')

  const userPrompt = `
Gere um relatório individual completo e individualizado para o seguinte aluno:

Nome do aluno: ${data.studentName}
Série: ${data.grade}
Disciplina: ${data.subject}
Bimestre: ${data.bimester}º Bimestre

DADOS DE FREQUÊNCIA:
- Total de aulas: ${data.attendance.total}
- Presenças: ${data.attendance.present}
- Faltas: ${data.attendance.absent}
- Frequência: ${data.attendance.percentage.toFixed(1)}%

DADOS DE NOTAS:
${gradesText}
Média final: ${data.average.toFixed(1)}
Situação: ${data.status === 'approved' ? 'Aprovado' : data.status === 'recovery' ? 'Em Recuperação' : 'Reprovado'}

OBSERVAÇÕES DO PROFESSOR:
${data.teacherNotes || 'Nenhuma observação adicional registrada.'}

Gere um relatório pedagógico INDIVIDUALIZADO e ESPECÍFICO para ${data.studentName}.
NUNCA use frases genéricas. Sempre mencione o aluno pelo nome.
Use linguagem formal, clara e empática.

Retorne um JSON com a seguinte estrutura:
{
  "academic_performance": "Texto descritivo detalhado sobre o desempenho acadêmico de ${data.studentName} neste bimestre, mencionando especificamente as notas e evolução",
  "participation": "Texto sobre a participação e engajamento de ${data.studentName} nas atividades",
  "behavior": "Texto sobre o comportamento e postura de ${data.studentName} em sala",
  "difficulties": "Texto específico sobre as principais dificuldades identificadas em ${data.studentName}",
  "strengths": "Texto sobre as potencialidades e pontos fortes de ${data.studentName}",
  "recommendations": "Recomendações pedagógicas específicas para ${data.studentName} e família",
  "interventions": "Intervenções pedagógicas necessárias e sugeridas para ${data.studentName}"
}
`

  try {
    const { content, tokensUsed } = await generateWithAI(
      SYSTEM_PROMPTS.studentReport,
      userPrompt,
      3000
    )

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { error: 'Erro ao processar resposta da IA' }

    const generated = JSON.parse(jsonMatch[0])

    const supabase = await createClient()
    await supabase.from('ai_generations').insert({
      user_id: check.userId,
      type: 'student_report',
      prompt: userPrompt,
      result: content,
      tokens_used: tokensUsed,
    })

    return { data: generated }
  } catch {
    return { error: 'Erro ao gerar relatório. Tente novamente.' }
  }
}

export async function saveStudentReport(data: {
  student_id: string
  class_id: string
  bimester: number
  academic_year: string
  academic_performance: string
  participation: string
  behavior: string
  difficulties: string
  strengths: string
  recommendations: string
  interventions: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: report, error } = await supabase
    .from('student_reports')
    .upsert(
      { ...data, user_id: user.id },
      { onConflict: 'student_id,bimester,academic_year' }
    )
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/relatorios')
  return { data: report }
}

export async function getStudentReports(studentId?: string, classId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('student_reports')
    .select(`
      *,
      students(full_name, call_number),
      classes(name, grade, subject)
    `)
    .eq('user_id', user.id)

  if (studentId) query = query.eq('student_id', studentId)
  if (classId) query = query.eq('class_id', classId)

  const { data } = await query.order('created_at', { ascending: false })
  return data ?? []
}

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  classContext?: { grade: string; subject: string; studentCount: number }
) {
  const check = await checkAndIncrementAIUsage()
  if (check.error) return { error: check.error }

  try {
    const supabase = await createClient()

    const systemPrompt = SYSTEM_PROMPTS.pedagogicalAssistant +
      (classContext
        ? `\n\nContexto atual do professor:\n- Série: ${classContext.grade}\n- Disciplina: ${classContext.subject}\n- Número de alunos: ${classContext.studentCount}`
        : '')

    const { getOpenAI } = await import('@/lib/openai/client')
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || ''
    const tokensUsed = response.usage?.total_tokens || 0

    await supabase.from('ai_generations').insert({
      user_id: check.userId,
      type: 'chat',
      prompt: messages[messages.length - 1]?.content || '',
      result: content,
      tokens_used: tokensUsed,
    })

    return { data: content }
  } catch {
    return { error: 'Erro ao conectar com o assistente. Tente novamente.' }
  }
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [classes, students, attendance, grades, lessonPlans, assessments] =
    await Promise.all([
      supabase.from('classes').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('students').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('attendance').select('status').eq('user_id', user.id),
      supabase.from('grades').select('value').eq('user_id', user.id),
      supabase.from('lesson_plans').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('assessments').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])

  const totalAttendance = attendance.data?.length ?? 0
  const presentCount = attendance.data?.filter((a) => a.status === 'present').length ?? 0
  const avgAttendance = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

  const gradeValues = grades.data?.map((g) => g.value) ?? []
  const avgGrade =
    gradeValues.length > 0
      ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
      : 0

  return {
    total_classes: classes.count ?? 0,
    total_students: students.count ?? 0,
    average_attendance: avgAttendance,
    average_grade: avgGrade,
    total_lesson_plans: lessonPlans.count ?? 0,
    total_assessments: assessments.count ?? 0,
    pending_reports: 0,
  }
}
