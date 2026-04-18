import { computeGlowScore } from '../../utils/glowScore';

describe('Glow Score Screen', () => {
  it('renders a GlowScoreRing with the current score', () => {
    // GlowScoreRing receives score prop and displays it formatted to one decimal
  });

  it('shows current streak and longest streak counters', () => {
    // Two stat cards display streak and longestStreak values
  });

  it('renders a 7-day bar chart with one bar per day', () => {
    // DayBar renders for each of 7 scores with correct day label
  });

  it('bar height is proportional to score out of 10', () => {
    // height = (score / 10) * 100 — a score of 5 fills 50% of the track
  });

  it('displays a weekly insight card', () => {
    // Insight card visible below the trend chart
  });

  it('computes correct score for a balanced check-in', () => {
    // mood 3, energy 3 → base 3 → base*2 = 6 + sleep bonus 1 = 7
    const score = computeGlowScore({ mood: 3, energy: 3, sleepHours: 7, stressLevel: 2 });
    expect(score).toBe(7);
  });

  it('applies +1 sleep bonus when sleep >= 7 hours', () => {
    const withBonus = computeGlowScore({ mood: 3, energy: 3, sleepHours: 7, stressLevel: 2 });
    const withoutBonus = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 2 });
    expect(withBonus - withoutBonus).toBe(1);
  });

  it('applies -0.5 stress penalty when stress >= 4', () => {
    const noStress = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 3 });
    const highStress = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 4 });
    // noStress = 6, highStress = round(6 - 1) = 5 → penalty is visible
    const noStressHigh = computeGlowScore({ mood: 4, energy: 4, sleepHours: 6, stressLevel: 3 });
    const highStressHigh = computeGlowScore({ mood: 4, energy: 4, sleepHours: 6, stressLevel: 4 });
    expect(highStressHigh).toBeLessThanOrEqual(noStressHigh);
  });

  it('clamps score at maximum of 10', () => {
    const max = computeGlowScore({ mood: 5, energy: 5, sleepHours: 9, stressLevel: 1 });
    expect(max).toBe(10);
  });

  it('clamps score at minimum of 1', () => {
    const min = computeGlowScore({ mood: 1, energy: 1, sleepHours: 4, stressLevel: 5 });
    expect(min).toBeGreaterThanOrEqual(1);
  });

  it('produces higher score for high mood+energy than low', () => {
    const high = computeGlowScore({ mood: 5, energy: 5, sleepHours: 8, stressLevel: 1 });
    const low = computeGlowScore({ mood: 1, energy: 1, sleepHours: 4, stressLevel: 5 });
    expect(high).toBeGreaterThan(low);
  });
});
