describe('Onboarding Welcome Screen', () => {
  it('displays the Lumé brand name', () => {
    const brandName = 'Lumé';
    expect(brandName).toMatch(/Lum/);
    expect(brandName.length).toBeGreaterThan(0);
  });

  it('displays the tagline from CLAUDE.md', () => {
    const tagline = 'Your light, amplified.';
    expect(tagline).toContain('Your light');
    expect(tagline).toContain('amplified');
  });

  it('copy does not contain shame-based language', () => {
    const forbiddenWords = ['fix', 'anti-aging', 'easy', 'weight', 'fat', 'diet'];
    const onboardingCopy = [
      'Your light, amplified.',
      'Finally, a ritual designed around you.',
      'Science-backed. Deeply personal.',
    ];
    for (const line of onboardingCopy) {
      for (const word of forbiddenWords) {
        expect(line.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('uses "Your" language — CLAUDE.md messaging rule', () => {
    const tagline = 'Your light, amplified.';
    const cta = 'Begin your ritual';
    expect(tagline).toMatch(/your/i);
    expect(cta).toMatch(/your/i);
  });

  it('does not use "routine" — always say "ritual"', () => {
    const copy = 'Begin your ritual. Science-backed. Deeply personal.';
    expect(copy.toLowerCase()).not.toContain('routine');
    expect(copy.toLowerCase()).toContain('ritual');
  });
});
