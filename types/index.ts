export type UserRole = 'teacher' | 'admin'
export type PlanType = 'free' | 'premium'
export type StudentStatus = 'approved' | 'recovery' | 'failed'
export type AssessmentType = 'prova' | 'trabalho' | 'seminario' | 'projeto' | 'participacao' | 'atividade'
export type AttendanceStatus = 'present' | 'absent' | 'justified'
export type ExportFormat = 'pdf' | 'docx'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  plan: PlanType
  school_name?: string
  created_at: string
}

export interface School {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface Class {
  id: string
  user_id: string
  name: string
  grade: string
  subject: string
  school: string
  academic_year: string
  bimester: number
  shift: string
  student_count?: number
  created_at: string
}

export interface Student {
  id: string
  class_id: string
  user_id: string
  full_name: string
  call_number: number
  birth_date?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  pedagogical_notes?: string
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  class_id: string
  user_id: string
  date: string
  status: AttendanceStatus
  justification?: string
  created_at: string
}

export interface Assessment {
  id: string
  class_id: string
  user_id: string
  name: string
  type: AssessmentType
  date: string
  weight: number
  description?: string
  created_at: string
}

export interface Grade {
  id: string
  assessment_id: string
  student_id: string
  class_id: string
  user_id: string
  value: number
  created_at: string
}

export interface LessonPlan {
  id: string
  user_id: string
  class_id?: string
  title: string
  grade: string
  subject: string
  theme: string
  content: string
  bncc_skills: string
  lesson_count: number
  generated_content?: LessonPlanContent
  created_at: string
}

export interface LessonPlanContent {
  objectives: string
  competencies: string
  skills: string
  contents: string
  methodology: string
  resources: string
  development: string
  evaluation: string
  schedule: string
}

export interface Activity {
  id: string
  user_id: string
  class_id?: string
  title: string
  subject: string
  grade: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: ActivityQuestion[]
  answer_key: string
  created_at: string
}

export interface ActivityQuestion {
  number: number
  type: string
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

export interface Exam {
  id: string
  user_id: string
  class_id?: string
  title: string
  subject: string
  grade: string
  content: string
  question_count: number
  version_a?: string
  version_b?: string
  answer_key?: string
  created_at: string
}

export interface StudentReport {
  id: string
  student_id: string
  class_id: string
  user_id: string
  bimester: number
  academic_year: string
  academic_performance: string
  participation: string
  behavior: string
  difficulties: string
  strengths: string
  recommendations: string
  interventions: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: PlanType
  status: string
  current_period_end?: string
  created_at: string
}

export interface AIGeneration {
  id: string
  user_id: string
  type: string
  prompt: string
  result: string
  tokens_used: number
  created_at: string
}

export interface DashboardStats {
  total_classes: number
  total_students: number
  average_attendance: number
  average_grade: number
  total_lesson_plans: number
  total_assessments: number
  pending_reports: number
}

export interface ClassReport {
  class_id: string
  class_name: string
  average_grade: number
  average_attendance: number
  approved_count: number
  recovery_count: number
  failed_count: number
  excessive_absences_count: number
  grade_distribution: GradeDistribution[]
}

export interface GradeDistribution {
  range: string
  count: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
