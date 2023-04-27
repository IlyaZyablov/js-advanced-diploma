import Character from '../Character';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';
import Magician from '../characters/Magician';
import Swordsman from '../characters/Swordsman';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';

import { generateTeam, characterGenerator } from '../generators';

// тест 1 из раздела 2 задания
test('new Character error test', () => {
  expect(() => {
    // eslint-disable-next-line no-unused-vars
    const character = new Character(5, 'daemon');
  }).toThrow();
});

// тест 2 из раздела 2 задания
test.each([
  [Bowman, 25, 25],
  [Daemon, 10, 10],
  [Magician, 10, 40],
  [Swordsman, 40, 10],
  [Undead, 40, 10],
  [Vampire, 25, 25],
])('features test', (Char, attack, defence) => {
  const result = new Char(1);
  expect(result.attack).toBe(attack);
  expect(result.defence).toBe(defence);
});

// тест 3 из раздела 2 задания
test('characters count test', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const playerGenerator = characterGenerator(playerTypes, 2);
  const result = [
    playerGenerator.next().value,
    playerGenerator.next().value,
    playerGenerator.next().value,
  ];
  expect(result.length).toBe(playerTypes.length);
});

// тест 4 из раздела 2 задания
test('characters team test', () => {
  const playerTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;
  const playerTeam = generateTeam(playerTypes, maxLevel, playerTypes.length);
  expect(playerTeam.characters.length).toBe(playerTypes.length);
  expect(playerTeam.characters[0].level).toBeLessThan(maxLevel + 1);
  expect(playerTeam.characters[1].level).toBeGreaterThan(0);
});

test.each([
  [Bowman, 'swordsman'],
  [Daemon, 'swordsman'],
  [Magician, 'swordsman'],
  [Swordsman, 'bowman'],
  [Undead, 'bowman'],
  [Vampire, 'bowman'],
])('features test', (Char, type) => {
  expect(() => {
    // eslint-disable-next-line no-unused-vars
    const character = new Char(1, type);
  }).toThrow();
});
