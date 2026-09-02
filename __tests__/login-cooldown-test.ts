import {
  getLoginCooldownDeadline,
  getLoginCooldownRemainingSeconds,
} from '@/features/auth/login-cooldown';

describe('login cooldown', () => {
  it('creates an absolute deadline from the server retry interval', () => {
    expect(getLoginCooldownDeadline(480, 1_000)).toBe(481_000);
  });

  it('uses elapsed wall-clock time instead of timer ticks', () => {
    const deadline = getLoginCooldownDeadline(480, 1_000);

    expect(getLoginCooldownRemainingSeconds(deadline, 301_000)).toBe(180);
  });

  it('expires while the app is suspended', () => {
    const deadline = getLoginCooldownDeadline(480, 1_000);

    expect(getLoginCooldownRemainingSeconds(deadline, 481_000)).toBe(0);
    expect(getLoginCooldownRemainingSeconds(deadline, 600_000)).toBe(0);
  });

  it('ignores invalid retry intervals', () => {
    expect(getLoginCooldownDeadline(0, 1_000)).toBeNull();
    expect(getLoginCooldownDeadline(Number.NaN, 1_000)).toBeNull();
  });
});
