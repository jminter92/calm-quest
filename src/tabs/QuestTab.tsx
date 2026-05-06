import { totalXp } from '../lib/progress';
import { titleThresholds } from '../lib/xp';
import type { CalmQuestData } from '../types';

const levelNotes = [
  'Notice the pattern.',
  'Keep the plan visible.',
  'Build calmer defaults.',
  'Let natural energy return.',
  'Protect the quiet baseline.'
];

export function QuestTab({ data }: { data: CalmQuestData }) {
  const xp = totalXp(data.xpEvents);
  const levels = [...titleThresholds].reverse();

  return (
    <section className="screen">
      <div className="screen-heading centered-heading">
        <h1>Quest</h1>
      </div>

      <div className="quest-summary">
        <span>Current XP</span>
        <strong>{xp}</strong>
      </div>

      <div className="quest-path">
        {levels.map((level, levelIndex) => {
          const nextLevel = levels[levelIndex + 1];
          const regionEnd = nextLevel?.xp ?? level.xp + 150;
          const range = Math.max(regionEnd - level.xp, 1);
          const isCurrentRegion = xp >= level.xp && xp < regionEnd;
          const isUnlocked = xp >= level.xp;

          return (
            <article className={`quest-region region-${levelIndex}`} key={level.title}>
              <div className="quest-region-copy">
                <span>{isUnlocked ? 'Unlocked' : `${level.xp} XP`}</span>
                <h2>{level.title}</h2>
                <p>{levelNotes[levelIndex]}</p>
              </div>
              <div className="quest-steps" aria-label={`${level.title} steps`}>
                {[0, 1, 2, 3, 4].map((step) => {
                  const stepXp = Math.round(level.xp + (range / 4) * step);
                  const reached = xp >= stepXp;
                  const current = isCurrentRegion && reached && (step === 4 || xp < Math.round(level.xp + (range / 4) * (step + 1)));

                  return (
                    <div className={current ? 'quest-step current' : reached ? 'quest-step reached' : 'quest-step'} key={step}>
                      <span>{step + 1}</span>
                      <small>{stepXp} XP</small>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
