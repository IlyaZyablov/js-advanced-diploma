import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';

const gamePlay = new GamePlay();
const stateService = new GameStateService('test');
const gameCtrl = new GameController(gamePlay, stateService);

test.each([
  ['bowman', 36, 20, true],
  ['swordsman', 36, 37, true],
  ['daemon', 36, 29, true],
  ['magician', 36, 45, true],
  ['magician', 36, 52, false],
  ['swordsman', 0, 63, false],
])('features test', (type, currentIndex, nextIndex, expected) => {
  const result = gameCtrl.canMove(type, currentIndex, nextIndex);
  expect(result).toBe(expected);
});
