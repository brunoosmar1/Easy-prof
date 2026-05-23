import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateLong(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatGrade(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}

export function calculateAverage(grades: number[]): number {
  if (grades.length === 0) return 0
  return grades.reduce((a, b) => a + b, 0) / grades.length
}

export function calculateWeightedAverage(
  grades: { value: number; weight: number }[]
): number {
  if (grades.length === 0) return 0
  const totalWeight = grades.reduce((a, b) => a + b.weight, 0)
  const weightedSum = grades.reduce((a, b) => a + b.value * b.weight, 0)
  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

export function getStudentStatus(average: number): 'approved' | 'recovery' | 'failed' {
  if (average >= 7) return 'approved'
  if (average >= 5) return 'recovery'
  return 'failed'
}

export function getStatusLabel(status: 'approved' | 'recovery' | 'failed'): string {
  const labels = {
    approved: 'Aprovado',
    recovery: 'Recuperação',
    failed: 'Reprovado',
  }
  return labels[status]
}

export function getStatusColor(status: 'approved' | 'recovery' | 'failed'): string {
  const colors = {
    approved: 'text-green-600 bg-green-50',
    recovery: 'text-yellow-600 bg-yellow-50',
    failed: 'text-red-600 bg-red-50',
  }
  return colors[status]
}

export function getBimesterLabel(bimester: number): string {
  const labels = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre']
  return labels[bimester - 1] || `${bimester}º Bimestre`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
