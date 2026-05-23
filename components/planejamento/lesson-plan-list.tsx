'use client'

import { useState } from 'react'
import { LessonPlan } from '@/types'
import { deleteLessonPlan } from '@/lib/actions/ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { BookOpen, Trash2, Eye, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function LessonPlanList({ plans }: { plans: LessonPlan[] }) {
  const [selected, setSelected] = useState<LessonPlan | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const result = await deleteLessonPlan(id)
    setDeleting(null)
    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Planejamento excluído' })
    }
  }

  if (plans.length === 0) return null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planejamentos Salvos ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{plan.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{plan.grade}</Badge>
                      <Badge variant="secondary" className="text-xs">{plan.subject}</Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(plan.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelected(plan)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    loading={deleting === plan.id}
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected?.generated_content && (
            <div className="space-y-4 text-sm">
              {Object.entries(selected.generated_content as Record<string, string>).map(
                ([key, value]) => (
                  <div key={key}>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {value}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
