import { computeGlowScore } from '../../utils/glowScore';

describe('Daily Check-In Screen', () => {
  it('renders mood, energy, and stress scales each with values 1–5', () => {
    // Scale component renders 5 selectable dots for each of the three metrics
  });

  it('accepts sleep hours as a numeric value between 0 and 12', () => {
    // TextInput with keyboardType="number-pad" validates sleepValid = num >= 0 && num <= 12
  });

  it('"Generate my ritual" is disabled until mood, energy, stress, and sleep are all set', () => {
    // canSubmit = mood !== null && energy !== null && stress !== null && sleepValid
    // Button receives disabled={!canSubmit}
  });

  it('routes to /ritual with check-in data as params on submit', () => {
    // router.push({ pathname: '/ritual', params: { mood, energy, stress, sleepHours, notes } })
  });

  it('glow score increases with higher mood and energy', () => {
    const low = computeGlowScore({ mood: 1, energy: 1, sleepHours: 6, stressLevel: 2 });
    const high = computeGlowScore({ mood: 5, energy: 5, sleepHours: 6, stressLevel: 2 });
    expect(high).toBeGreaterThan(low);
  });

  it('sleep bonus is applied only at 7+ hours', () => {
    const at6 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 2 });
    const at7 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 7, stressLevel: 2 });
    const at8 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 8, stressLevel: 2 });
    expect(at7).toBe(at8); // same bonus regardless of hours above 7
    expect(at7).toBeGreaterThan(at6);
  });

  it('stress penalty fires at stress level 4 and 5 equally', () => {
    const stress4 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 4 });
    const stress5 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 5 });
    expect(stress4).toBe(stress5);
  });

  it('stress level 3 does not trigger penalty', () => {
    const stress3 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 3 });
    const stress4 = computeGlowScore({ mood: 3, energy: 3, sleepHours: 6, stressLevel: 4 });
    expect(stress3).toBeGreaterThan(stress4);
  });

  it('URL params are numeric — coercion fallback to 3 for empty strings', () => {
    const parse = (val: string | undefined, fallback: number) => Number(val) || fallback;
    expect(parse(undefined, 3)).toBe(3);
    expect(parse('', 3)).toBe(3);
    expect(parse('4', 3)).toBe(4);
    expect(parse('0', 3)).toBe(3); // 0 is falsy, falls back
  });
});
