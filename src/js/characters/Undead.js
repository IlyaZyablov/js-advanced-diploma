import Character from '../Character';

/**
 * Класс нежити, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Undead extends Character {
  constructor(level, type = 'undead') {
    if (type !== 'undead') {
      throw new Error('Создать этого персонажа можно только с типом undead!');
    }
    super(level, type);
    this.attack = 40;
    this.defence = 10;
  }
}
