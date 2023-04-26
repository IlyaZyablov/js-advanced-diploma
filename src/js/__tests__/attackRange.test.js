import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';

const gamePlay = new GamePlay();
const stateService = new GameStateService('test');
const gameCtrl = new GameController(gamePlay, stateService);

test.each([
  ['bowman', 32, 12, false],
  ['swordsman', 32, 39, false],
  ['undead', 39, 40, false],
  ['magician', 32, 47, false],
  ['bowman', 32, 18, true],
  ['swordsman', 0, 9, true],
])('features test', (type, currentIndex, nextIndex, expected) => {
  const result = gameCtrl.canAttack(type, currentIndex, nextIndex);
  expect(result).toBe(expected);
});
