import { getDescription } from '../GameController';

test.each([
  [1, 25, 25, 50, '🎖 1 ⚔ 25 🛡 25 ❤ 50'],
  [1, 10, 10, 50, '🎖 1 ⚔ 10 🛡 10 ❤ 50'],
])('features test', (level, attack, defence, health, expected) => {
  const result = getDescription`🎖${level}\u2694${attack}🛡${defence}\u2764${health}`;
  expect(result).toBe(expected);
});
