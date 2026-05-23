'use client'

import { Bell, Moon, Sun, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  user?: { full_name: string; email: string; plan: string }
  onMenuClick?: () => void
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {user && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user.full_name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                {user.full_name.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.plan === 'premium' ? 'Premium' : 'Gratuito'}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
