-- EasyProf - Schema Completo do Banco de Dados

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =====================
-- TABELA: profiles (usuários)
-- =====================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  school_name text,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  ai_generations_count integer not null default 0,
  ai_generations_reset_at timestamp with time zone default now(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: classes (turmas)
-- =====================
create table if not exists public.classes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  grade text not null,
  subject text not null,
  school text not null,
  academic_year text not null,
  bimester integer not null default 1 check (bimester between 1 and 4),
  shift text not null default 'Manhã',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: students (alunos)
-- =====================
create table if not exists public.students (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  call_number integer not null,
  birth_date date,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  pedagogical_notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(class_id, call_number)
);

-- =====================
-- TABELA: attendance (frequência)
-- =====================
create table if not exists public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text not null default 'present' check (status in ('present', 'absent', 'justified')),
  justification text,
  created_at timestamp with time zone default now() not null,
  unique(student_id, date)
);

-- =====================
-- TABELA: assessments (avaliações)
-- =====================
create table if not exists public.assessments (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('prova', 'trabalho', 'seminario', 'projeto', 'participacao', 'atividade')),
  date date not null,
  weight numeric(4,2) not null default 1.0,
  description text,
  max_grade numeric(5,2) not null default 10.0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: grades (notas)
-- =====================
create table if not exists public.grades (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value numeric(5,2) not null check (value >= 0),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(assessment_id, student_id)
);

-- =====================
-- TABELA: lesson_plans (planejamentos)
-- =====================
create table if not exists public.lesson_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  grade text not null,
  subject text not null,
  theme text not null,
  content text not null,
  bncc_skills text,
  lesson_count integer not null default 1,
  generated_content jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: activities (atividades geradas por IA)
-- =====================
create table if not exists public.activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  subject text not null,
  grade text not null,
  type text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  questions jsonb not null default '[]',
  answer_key text,
  created_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: exams (provas geradas por IA)
-- =====================
create table if not exists public.exams (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  subject text not null,
  grade text not null,
  content text not null,
  question_count integer not null,
  version_a text,
  version_b text,
  answer_key text,
  created_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: student_reports (relatórios individuais)
-- =====================
create table if not exists public.student_reports (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bimester integer not null,
  academic_year text not null,
  academic_performance text,
  participation text,
  behavior text,
  difficulties text,
  strengths text,
  recommendations text,
  interventions text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(student_id, bimester, academic_year)
);

-- =====================
-- TABELA: subscriptions (assinaturas Stripe)
-- =====================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================
-- TABELA: ai_generations (histórico de gerações IA)
-- =====================
create table if not exists public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  prompt text not null,
  result text not null,
  tokens_used integer not null default 0,
  created_at timestamp with time zone default now() not null
);

-- =====================
-- ÍNDICES para performance
-- =====================
create index if not exists idx_classes_user_id on public.classes(user_id);
create index if not exists idx_students_class_id on public.students(class_id);
create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_attendance_student_id on public.attendance(student_id);
create index if not exists idx_attendance_class_id on public.attendance(class_id);
create index if not exists idx_attendance_date on public.attendance(date);
create index if not exists idx_assessments_class_id on public.assessments(class_id);
create index if not exists idx_grades_assessment_id on public.grades(assessment_id);
create index if not exists idx_grades_student_id on public.grades(student_id);
create index if not exists idx_lesson_plans_user_id on public.lesson_plans(user_id);
create index if not exists idx_activities_user_id on public.activities(user_id);
create index if not exists idx_student_reports_student_id on public.student_reports(student_id);
create index if not exists idx_ai_generations_user_id on public.ai_generations(user_id);

-- =====================
-- FUNÇÕES auxiliares
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.updated_at_trigger()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure public.updated_at_trigger();
create trigger update_classes_updated_at before update on public.classes
  for each row execute procedure public.updated_at_trigger();
create trigger update_students_updated_at before update on public.students
  for each row execute procedure public.updated_at_trigger();
create trigger update_assessments_updated_at before update on public.assessments
  for each row execute procedure public.updated_at_trigger();
create trigger update_grades_updated_at before update on public.grades
  for each row execute procedure public.updated_at_trigger();
create trigger update_lesson_plans_updated_at before update on public.lesson_plans
  for each row execute procedure public.updated_at_trigger();
create trigger update_student_reports_updated_at before update on public.student_reports
  for each row execute procedure public.updated_at_trigger();
create trigger update_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.updated_at_trigger();

-- =====================
-- POLÍTICAS RLS
-- =====================
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.assessments enable row level security;
alter table public.grades enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.activities enable row level security;
alter table public.exams enable row level security;
alter table public.student_reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_generations enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Classes policies
create policy "Users can manage own classes" on public.classes
  for all using (auth.uid() = user_id);

-- Students policies
create policy "Users can manage own students" on public.students
  for all using (auth.uid() = user_id);

-- Attendance policies
create policy "Users can manage own attendance" on public.attendance
  for all using (auth.uid() = user_id);

-- Assessments policies
create policy "Users can manage own assessments" on public.assessments
  for all using (auth.uid() = user_id);

-- Grades policies
create policy "Users can manage own grades" on public.grades
  for all using (auth.uid() = user_id);

-- Lesson plans policies
create policy "Users can manage own lesson plans" on public.lesson_plans
  for all using (auth.uid() = user_id);

-- Activities policies
create policy "Users can manage own activities" on public.activities
  for all using (auth.uid() = user_id);

-- Exams policies
create policy "Users can manage own exams" on public.exams
  for all using (auth.uid() = user_id);

-- Student reports policies
create policy "Users can manage own student reports" on public.student_reports
  for all using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- AI generations policies
create policy "Users can manage own ai generations" on public.ai_generations
  for all using (auth.uid() = user_id);
