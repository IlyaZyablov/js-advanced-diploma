import Character from '../Character';

/**
 * Класс демона, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Daemon extends Character {
  constructor(level, type = 'daemon') {
    if (type !== 'daemon') {
      throw new Error('Создать этого персонажа можно только с типом daemon!');
    }
    super(level, type);
    this.attack = 10;
    this.defence = 10;
    if (level > 1) {
      if (level === 2) {
        this.health = 55;
      } else if (level === 3) {
        this.health = 75;
      } else if (level === 4) {
        this.health = 90;
      }
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
