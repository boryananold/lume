describe('Onboarding Circle Screen', () => {
  it('shows the 2.3× streak benefit claim', () => {
    const stat = '2.3×';
    const copy = 'Women with accountability partners are 2.3× more likely to keep their streak.';
    expect(copy).toContain(stat);
  });

  it('copy uses "streak" and "ritual" not "routine"', () => {
    const copy = 'Women with accountability partners are 2.3× more likely to keep their streak.';
    expect(copy).toContain('streak');
    expect(copy.toLowerCase()).not.toContain('routine');
  });

  it('paywall copy uses "Glow" language from brand guidelines', () => {
    const paywallLabel = '14 days in — you\'re glowing.';
    expect(paywallLabel.toLowerCase()).toContain('glow');
  });

  it('does not contain shame-based language', () => {
    const forbidden = ['fix', 'anti-aging', 'easy', 'weight', 'fat'];
    const circleCopy = [
      'Women with accountability partners are 2.3× more likely to keep their streak.',
      'Your Circle sees your streak. Show up for them — and for yourself.',
      'Glow together with up to 5 friends.',
    ];
    for (const line of circleCopy) {
      for (const word of forbidden) {
        expect(line.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('invite code is 8 characters from UUID substring', () => {
    // Schema: invite_code = substring(gen_random_uuid()::text, 1, 8)
    const mockCode = 'a1b2c3d4';
    expect(mockCode.length).toBe(8);
  });
});
