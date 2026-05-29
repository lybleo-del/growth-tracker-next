'use client';

import { Mood } from '@/lib/types';
import { MOODS } from '@/lib/constants';

interface MoodTrackerProps {
  currentMood?: Mood;
  onSelect: (mood: Mood) => void;
}

export function MoodTracker({ currentMood, onSelect }: MoodTrackerProps) {
  return (
    <div className="flex justify-center gap-4 py-4">
      {MOODS.map(({ mood, label }) => (
        <button
          key={mood}
          onClick={() => onSelect(mood as Mood)}
          className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
            currentMood === mood
              ? 'bg-primary/10 scale-110'
              : 'hover:bg-muted'
          }`}
        >
          <span className="text-3xl">{mood}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </button>
      ))}
    </div>
  );
}
