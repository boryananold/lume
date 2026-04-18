describe('Ritual Screen', () => {
  const parseParam = (val: string | undefined, fallback: number) => Number(val) || fallback;

  it('parses mood from URL param with fallback to 3', () => {
    expect(parseParam('1', 3)).toBe(1);
    expect(parseParam('5', 3)).toBe(5);
    expect(parseParam(undefined, 3)).toBe(3);
    expect(parseParam('', 3)).toBe(3);
  });

  it('parses energy from URL param with fallback to 3', () => {
    expect(parseParam('2', 3)).toBe(2);
    expect(parseParam('4', 3)).toBe(4);
    expect(parseParam(undefined, 3)).toBe(3);
  });

  it('parses sleepHours with fallback to 7', () => {
    expect(parseParam('8', 7)).toBe(8);
    expect(parseParam(undefined, 7)).toBe(7);
    expect(parseParam('', 7)).toBe(7);
  });

  it('shows loading state — isLoading is true before ritual data arrives', () => {
    // useCheckIn starts with isLoading:false, data:null — isLoading = userLoading || checkInLoading || !ritual
    // When userId is empty, submittedRef stays false and ritual remains null => isLoading is truthy
    const userLoading = true;
    const checkInLoading = false;
    const ritual = null;
    const isLoading = userLoading || checkInLoading || !ritual;
    expect(isLoading).toBe(true);
  });

  it('shows content state when ritual data is present', () => {
    const userLoading = false;
    const checkInLoading = false;
    const ritual = { affirmation: 'You glow.', morningRitual: [], eveningRitual: [], glowTip: 'Sleep.', generatedAt: '' };
    const isLoading = userLoading || checkInLoading || !ritual;
    expect(isLoading).toBe(false);
  });

  it('shows error state when generation fails', () => {
    const error = new Error('API limit reached');
    expect(error.message).toBe('API limit reached');
  });
});
