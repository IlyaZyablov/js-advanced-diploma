/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target.name === 'Character') {
      throw new Error('Невозможно создать персонажа через new Character()!');
    }
    this.level = level;
    this.health = 50;
    this.type = type;

    if (type === 'bowman' || type === 'vampire') {
      this.attack = 25;
      this.defence = 25;
    } else if (type === 'swordsman' || type === 'undead') {
      this.attack = 40;
      this.defence = 10;
    } else if (type === 'magician' || type === 'daemon') {
      this.attack = 10;
      this.defence = 40;
    }

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

  levelUp() {
    // повышаем уровень
    this.level += 1;
    // повышаем характеристики
    this.attack = Math.max(
      this.attack,
      Math.round(this.attack * ((this.health + 80) / 100)),
    );
    this.defence = Math.max(
      this.defence,
      Math.round(this.defence * ((this.health + 80) / 100)),
    );
    // повышаем уровень жизни
    if (this.health + 80 > 100) {
      this.health = 100;
    } else {
      this.health += 80;
    }
  }
}
