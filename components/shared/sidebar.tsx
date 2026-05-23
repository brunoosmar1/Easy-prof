'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  FileText,
  PenTool,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
  BookMarked,
  Trophy,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    label: 'Principal',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Turmas', href: '/turmas', icon: Users },
      { name: 'Alunos', href: '/alunos', icon: GraduationCap },
    ],
  },
  {
    label: 'Pedagógico',
    items: [
      { name: 'Frequência', href: '/frequencia', icon: ClipboardCheck },
      { name: 'Avaliações', href: '/avaliacoes', icon: BookMarked },
      { name: 'Notas', href: '/notas', icon: Trophy },
    ],
  },
  {
    label: 'IA & Conteúdo',
    items: [
      { name: 'Planejamento', href: '/planejamento', icon: BookOpen, ai: true },
      { name: 'Atividades', href: '/atividades', icon: PenTool, ai: true },
      { name: 'Provas', href: '/provas', icon: FileText, ai: true },
      { name: 'Relatórios', href: '/relatorios', icon: BarChart3, ai: true },
      { name: 'Assistente IA', href: '/assistente', icon: MessageSquare, ai: true },
    ],
  },
  {
    label: 'Conta',
    items: [
      { name: 'Perfil', href: '/perfil', icon: Settings },
      { name: 'Planos', href: '/planos', icon: Sparkles },
    ],
  },
]

interface SidebarProps {
  collapsed?: boolean
  plan?: string
}

export function Sidebar({ collapsed = false, plan = 'free' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white flex-shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">EasyProf</span>
            {plan === 'premium' && (
              <Badge variant="premium" className="ml-2 text-[10px] py-0">
                Premium
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigation.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 mb-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white',
                        collapsed && 'justify-center px-2'
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                      {!collapsed && (
                        <span className="flex-1">{item.name}</span>
                      )}
                      {!collapsed && item.ai && (
                        <Sparkles className="w-3 h-3 text-brand-500" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400 w-full transition-colors',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
            {!collapsed && 'Sair'}
          </button>
        </form>
      </div>
    </aside>
  )
}
