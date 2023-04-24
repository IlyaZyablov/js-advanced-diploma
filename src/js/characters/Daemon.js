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
  }
}
