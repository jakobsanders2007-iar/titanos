'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { DEMO_TRAINING, type TrainingLesson } from '@/lib/demo-extended'
import { GraduationCap, PlayCircle, CheckCircle2, Circle, Clock, X } from 'lucide-react'

export default function TrainingPage() {
  const [lessons, setLessons] = useState<TrainingLesson[]>(DEMO_TRAINING)
  const [selected, setSelected] = useState<TrainingLesson | null>(null)

  const completedCount = lessons.filter(l => l.completed).length
  const progress = Math.round((completedCount / lessons.length) * 100)
  const totalMin = lessons.reduce((s, l) => s + l.duration_min, 0)

  const toggleComplete = (id: string) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, completed: !l.completed } : l))
    setSelected(prev => prev && prev.id === id ? { ...prev, completed: !prev.completed } : prev)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Training Academy"
        subtitle="Onboard your whole team — dispatchers, technicians, and owners"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Progress banner */}
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-5 flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">Onboarding Progress</div>
              <div className="text-sm text-amber-400 font-semibold tabular-nums">{progress}%</div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {completedCount} of {lessons.length} lessons complete · {totalMin} minutes total curriculum
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              onClick={() => setSelected(lesson)}
              className={`text-left bg-gray-900 border rounded-lg overflow-hidden hover:border-gray-600 transition-colors ${lesson.completed ? 'border-emerald-500/30' : 'border-gray-800'}`}
            >
              {/* Video placeholder */}
              <div className="aspect-video bg-gray-950 border-b border-gray-800 flex items-center justify-center relative">
                <PlayCircle className="w-10 h-10 text-gray-700" />
                <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 bg-gray-900/80 rounded text-gray-400">Lesson {i + 1}</div>
                <div className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 bg-gray-900/80 rounded text-gray-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />{lesson.duration_min} min
                </div>
                {lesson.completed && (
                  <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-white mb-1">{lesson.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-2">{lesson.description}</div>
                <div className="text-[10px] text-amber-400/80 uppercase tracking-wide">{lesson.audience}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lesson drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md bg-gray-950 border-l border-gray-800 h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-lg font-semibold text-white pr-4">{selected.title}</div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center justify-center mb-4">
              <PlayCircle className="w-12 h-12 text-gray-700 mb-2" />
              <div className="text-xs text-gray-600">Video coming soon · {selected.duration_min} min</div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-4">{selected.description}</p>

            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Checklist</div>
            <div className="space-y-2 mb-6">
              {selected.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-300 bg-gray-900 border border-gray-800 rounded px-3 py-2">
                  {selected.completed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={() => toggleComplete(selected.id)}
              className={`w-full py-2.5 text-sm font-semibold rounded transition-colors ${
                selected.completed
                  ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                  : 'bg-amber-500 text-gray-950 hover:bg-amber-400'
              }`}
            >
              {selected.completed ? 'Mark Incomplete' : 'Mark Lesson Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
