interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-4 text-white">
        <div className="text-3xl font-bold">{currentStreak}</div>
        <div className="text-sm opacity-90">目前連續天數</div>
        {currentStreak > 0 && (
          <div className="mt-2 text-2xl">
            {'🔥'.repeat(Math.min(currentStreak, 5))}
          </div>
        )}
      </div>
      <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl p-4 text-white">
        <div className="text-3xl font-bold">{longestStreak}</div>
        <div className="text-sm opacity-90">最長連續天數</div>
        {longestStreak > 0 && <div className="mt-2 text-2xl">🏆</div>}
      </div>
    </div>
  );
}
