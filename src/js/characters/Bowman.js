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
    if (level > 1) {
      this.attack = Math.max(
        this.attack,
        Math.round(this.attack * ((this.health + 80) / 100)),
      );
      this.defence = Math.max(
        this.defence,
        Math.round(this.defence * ((this.health + 80) / 100)),
      );
    }
  }
}
