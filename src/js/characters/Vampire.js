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
  }
}
