import Character from '../Character';

/**
 * Класс вампира, наследуется от класса Character
 * @property level - уровень персонажа, от 1 до 4
 */

export default class Vampire extends Character {
  constructor(level, type = 'vampire') {
    if (type !== 'vampire') {
      throw new Error('Создать этого персонажа можно только с типом vampire!');
    }
    super(level, type);
    this.attack = 25;
    this.defence = 25;
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
