/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor(characters = []) {
    if (!Array.isArray(characters)) {
      throw new Error('Персонажи должны передаваться массивом!');
    }
    this.characters = [];
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      this.characters.push(char);
    }
  }
}
