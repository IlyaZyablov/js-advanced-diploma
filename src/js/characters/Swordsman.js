import Character from '../Character';

/**
 * Класс мечника, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Swordsman extends Character {
  constructor(level, type = 'swordsman') {
    if (type !== 'swordsman') {
      throw new Error('Создать этого персонажа можно только с типом swordsman!');
    }
    super(level, type);
    this.attack = 40;
    this.defence = 10;
  }
}
