import Character from '../Character';

/**
 * Класс мага, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Magician extends Character {
  constructor(level, type = 'magician') {
    if (type !== 'magician') {
      throw new Error('Создать этого персонажа можно только с типом magician!');
    }
    super(level, type);
    this.attack = 10;
    this.defence = 40;
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
