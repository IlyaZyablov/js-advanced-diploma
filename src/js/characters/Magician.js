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
  }
}
