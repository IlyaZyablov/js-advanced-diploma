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
    if (level > 1) {
      if (level === 2) {
        this.health = 55;
      } else if (level === 3) {
        this.health = 65;
      } else if (level === 4) {
        this.health = 80;
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
