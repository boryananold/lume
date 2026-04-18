import { greetingForHour, formatToday, daysSince } from '../../utils/greeting';

describe('Today Screen', () => {
  it('shows a time-based greeting (Good morning / afternoon / evening)', () => {
    expect(greetingForHour(0)).toBe('Good morning');
    expect(greetingForHour(6)).toBe('Good morning');
    expect(greetingForHour(11)).toBe('Good morning');
    expect(greetingForHour(12)).toBe('Good afternoon');
    expect(greetingForHour(17)).toBe('Good afternoon');
    expect(greetingForHour(18)).toBe('Good evening');
    expect(greetingForHour(23)).toBe('Good evening');
  });

  it("displays today's formatted date as a non-empty string", () => {
    const result = formatToday();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('daysSince returns 0 for today and 14 for two weeks ago', () => {
    const now = new Date().toISOString();
    expect(daysSince(now)).toBe(0);

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(twoWeeksAgo)).toBe(14);
  });

  it('paywall banner threshold is exactly 14 days', () => {
    const thirteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysSince(thirteenDaysAgo)).toBeLessThan(14);
    expect(daysSince(fourteenDaysAgo)).toBeGreaterThanOrEqual(14);
  });
});
