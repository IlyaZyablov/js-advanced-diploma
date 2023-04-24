import Character from '../Character';

/**
 * Класс лучника, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    if (type !== 'bowman') {
      throw new Error('Создать этого персонажа можно только с типом bowman!');
    }
    super(level, type);
    this.attack = 25;
    this.defence = 25;
  }
}
