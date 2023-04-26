// импорт GamePlay для использования статических методов
import GamePlay from './GamePlay';

// импорт модуля, хранящего данные о текущей ситуации на доске
import GameState from './GameState';

// импорт тем
import themes from './themes';

// импорт персонажей
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

// импорт функции формирования команд и расположения
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';

// импорт функции отрисовки нужных элементов карты
// чтобы выбрать верные позиции для персонажей
import { calcTileType } from './utils';

// импорт курсоров
import cursors from './cursors';

// функция, возвращающая вывод описания
export function getDescription(strings, level, attack, defence, health) {
  const levelIcon = strings[0];
  const attackIcon = strings[1];
  const defenceIcon = strings[2];
  const healthIcon = strings[3];
  return `${levelIcon} ${level} ${attackIcon} ${attack} ${defenceIcon} ${defence} ${healthIcon} ${health}`;
}

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.initCharacters();
    // listeners
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  initCharacters() {
    // формирование команды игрока
    const playerTypes = [Bowman, Swordsman, Magician];
    const playerTeam = generateTeam(playerTypes, 3, 3);

    // формирование команды противника
    const enemyTypes = [Daemon, Undead, Vampire];
    const enemyTeam = generateTeam(enemyTypes, 3, 3);

    // отрисовка позиций
    this.drawTeams(playerTeam, enemyTeam);
  }

  drawTeams(playerTeam, enemyTeam) {
    const playerTeamPositions = [];
    const enemyTeamPositions = [];
    // собираем доступные позиции игрока и противника
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      // определяем позициию
      const position = calcTileType(i, this.gamePlay.boardSize);
      if (position === 'top-left' || position === 'bottom-left' || position === 'left') { // позиции игрока
        // добавляем непосредственно полученные позиции
        playerTeamPositions.push({ index: i, empty: true });
        // добавляем соседние справа позиции
        playerTeamPositions.push({ index: i + 1, empty: true });
      } else if (position === 'top-right' || position === 'bottom-right' || position === 'right') { // позиции противнка
        // добавляем соседние слева позиции
        enemyTeamPositions.push({ index: i - 1, empty: true });
        // добавляем непосредственно полученные позиции
        enemyTeamPositions.push({ index: i, empty: true });
      }
    }
    // размещаем команду игрока
    playerTeam.characters.forEach(element => {
      for (let pos = 0; pos < playerTeamPositions.length; pos++) {
        const randPos = Math.floor(Math.random() * playerTeamPositions.length);
        if (playerTeamPositions[randPos].empty === true) {
          playerTeamPositions[randPos].empty = false;
          const posClass = new PositionedCharacter(element, playerTeamPositions[randPos].index);
          // записываем персонажа в команду игрока
          this.gameState.playerCharacters.push(posClass);
          // записываем персонажа в общий массив персонажей
          this.gameState.characters.push(posClass);
          break;
        }
      }
    });
    // размещаем команду противника
    enemyTeam.characters.forEach(element => {
      for (let pos = 0; pos < enemyTeamPositions.length; pos++) {
        const randPos = Math.floor(Math.random() * enemyTeamPositions.length);
        if (enemyTeamPositions[randPos].empty === true) {
          enemyTeamPositions[randPos].empty = false;
          const posClass = new PositionedCharacter(element, enemyTeamPositions[randPos].index);
          // записываем персонажа в команду противника
          this.gameState.enemyCharacters.push(posClass);
          // записываем персонажа в общий массив персонажей
          this.gameState.characters.push(posClass);
          break;
        }
      }
    });
    this.gamePlay.redrawPositions(this.gameState.characters);
  }

  onCellClick(index) {
    for (let cellIndex = 0; cellIndex < this.gamePlay.cells.length; cellIndex++) {
      this.gamePlay.deselectCell(cellIndex); // убираем выделение других клеток
    }

    if (this.gameState.step === 'user') { // если наш ход
      // если кликаем по полю, на котором есть какой-либо персонаж
      if (this.gamePlay.cells[index].children.length > 0) {
        const child = this.gamePlay.cells[index].children[0];
        if ( // если пытаемся выбрать нашего персонаж
          child.classList.contains('bowman')
          || child.classList.contains('magician')
          || child.classList.contains('swordsman')
        ) {
          this.gamePlay.selectCell(index); // добавляем выделение нужного персонажа
          // перебираем массив с персонажами
          for (let i = 0; i < this.gameState.characters.length; i++) {
            const element = this.gameState.characters[i];
            // если позиция персонажа из массива совпадает с выбранной точкой
            if (element.position === index) {
              this.gameState.selectedChar = element;
            }
          }
        } else { // если кликаем на персонажа противника
          // если наш персонаж не выбран, и мы хотим выбрать персонажа противника
          if (this.gameState.selectedChar === undefined) {
            GamePlay.showError('Это не Ваш персонаж!');
          } else { // если наш персонаж выбран, проверяем дальность атаки
            const char = this.gameState.selectedChar;
            if (this.canAttack(char.character.type, char.position, index)) {
              this.attack(char, index);
            } else {
              GamePlay.showError('Вы не можете атаковать выбранным персонажем так далеко!');
              // очищаем данные о выбранном персонаже
              this.gameState.selectedChar = undefined;
            }
          }
        }
      } else { // если хотим перейти на свободную клетку
        if (this.gameState.selectedChar === undefined) {
          // если наш персонаж не выбран, и мы хотим кликаем по пустым клеткам
          GamePlay.showError('Выберите персонажа для перемещения!');
          return;
        }
        const char = this.gameState.selectedChar;
        if (this.canMove(char.character.type, char.position, index)) {
          this.move(char, index);
        } else {
          GamePlay.showError('Вы не можете переместить этого персонажа сюда!');
          // очищаем данные о выбранном персонаже
          this.gameState.selectedChar = undefined;
        }
      }
    } else {
      GamePlay.showError('Сейчас не Ваш ход!');
    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length > 0) {
      // показываем tooltip при наведении на любого персонажа
      const child = this.gamePlay.cells[index].children[0];
      const {
        level, attack, defence, health,
      } = child.dataset;
      this.gamePlay.showCellTooltip(getDescription`🎖${level}\u2694${attack}🛡${defence}\u2764${health}`, index);

      // меняем курсор, если:
      if ( // мы наводимся на своего персонажа
        child.classList.contains('bowman')
        || child.classList.contains('magician')
        || child.classList.contains('swordsman')
      ) {
        this.gamePlay.setCursor(cursors.pointer);
      } else { // мы наводимся не на своего персонажа
        if (this.gameState.selectedChar !== undefined) {
          // если персонаж может атаковать на такое расстояние
          const char = this.gameState.selectedChar;
          if (this.canAttack(char.character.type, char.position, index)) {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red'); // добавляем выделение противника
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
        }
      }
    } else {
      if (this.gameState.selectedChar !== undefined) {
        // если персонаж может сюда пройти
        const char = this.gameState.selectedChar;
        if (this.canMove(char.character.type, char.position, index)) {
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green'); // добавляем выделение нужного квадрата
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    if (this.gameState.selectedChar && this.gameState.selectedChar.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  move(char, toIndex) {
    // перебираем массив с персонажами
    for (let i = 0; i < this.gameState.characters.length; i++) {
      const element = this.gameState.characters[i];
      // если позиция персонажа из массива совпадает с позицией выбранного персонажа
      if (element.position === char.position) {
        element.position = toIndex; // присваиваем новую позицию
        break;
      }
    }
    // обновляем поле
    this.gamePlay.redrawPositions(this.gameState.characters);

    // если был ход игрока
    if (this.gameState.step === 'user') {
      // очищаем данные выбранного персонажа
      this.gameState.selectedChar = undefined;
      // передаём ход противнику
      this.gameState.step = 'enemy';
      // запускаем действия противника
      this.enemyAction();
    } else { // если был ход противника
      // передаём ход игроку
      this.gameState.step = 'user';
    }
  }

  attack(char, toIndex) {
    let damage;
    // перебираем массив с персонажами
    for (let i = 0; i < this.gameState.characters.length; i++) {
      const element = this.gameState.characters[i];
      // если позиция персонажа из массива совпадает с выбранной точкой
      if (element.position === toIndex) {
        damage = Math.max(
          char.character.attack - element.character.defence,
          char.character.attack * 0.1,
        );
        element.character.health -= damage;
      }
    }

    this.gamePlay.showDamage(toIndex, damage).then(() => {
      // обновляем поле
      this.gamePlay.redrawPositions(this.gameState.characters);

      // если был ход игрока
      if (this.gameState.step === 'user') {
        // очищаем данные выбранного персонажа
        this.gameState.selectedChar = undefined;
        // передаём ход противнику
        this.gameState.step = 'enemy';
        // запускаем действия противника
        this.enemyAction();
      } else { // если был ход противника
        // передаём ход игроку
        this.gameState.step = 'user';
      }
    });
  }

  async enemyAction() {
    // Логика противника:
    // 1) перебираются все противники, и если в диапазоне их атаки есть игрок,
    // то атакуем этого игрока
    // 2) если атака произведена не была, то случайный противник двигается на случайную
    // доступную клетку

    // перебираем массив с противниками
    let isAttacking = false;
    for (let en = 0; en < this.gameState.enemyCharacters.length; en++) {
      // прерываем дальнейший перебор массива
      if (isAttacking) {
        break;
      }
      const enemy = this.gameState.enemyCharacters[en];
      for (let pl = 0; pl < this.gameState.playerCharacters.length; pl++) {
        const player = this.gameState.playerCharacters[pl];
        // если у противника есть какой-либо игрок, которого он может атаковать
        if (this.canAttack(enemy.character.type, enemy.position, player.position)) {
          // производим атаку
          this.attack(enemy, player.position);
          console.log(`${enemy.character.type} атаковал ${player.character.type}`);
          // выставляем ключ, чтобы предотвратить дальнейшие действия противника
          isAttacking = true;
          break;
        }
      }
    }

    // если атака произведена не была
    if (!isAttacking) {
      // выбираем случайного персонажа
      const randEnemyIndex = Math.floor(Math.random() * this.gameState.enemyCharacters.length);
      const randEnemy = this.gameState.enemyCharacters[randEnemyIndex];
      // получаем случайную позицию для выбранного персонажа
      const moveIndex = await this.getRandomIndexToMove(randEnemy);
      // двигаем противника на полученную позицию
      this.move(randEnemy, moveIndex);
    }
  }

  async getRandomIndexToMove(enemy) {
    const allowedPositions = [];
    // перебираем позиции доски
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      // если персонаж может двигаться на эта позицию, то записываем в массив
      if (
        this.canMove(enemy.character.type, enemy.position, i)
        && this.gamePlay.cells[i].children.length === 0
      ) {
        allowedPositions.push(i);
      }
    }
    return allowedPositions[Math.floor(Math.random() * allowedPositions.length)];
  }

  canMove(charType, currentIndex, nextIndex) {
    let result = false;
    let stepLength = 0;
    if (charType === 'swordsman' || charType === 'undead') {
      stepLength = 4;
    } else if (charType === 'bowman' || charType === 'vampire') {
      stepLength = 2;
    } else if (charType === 'magician' || charType === 'daemon') {
      stepLength = 1;
    }
    if ( // движение по вертикали
      Math.abs(currentIndex - nextIndex) % this.gamePlay.boardSize === 0
      && Math.abs(currentIndex - nextIndex) <= this.gamePlay.boardSize * stepLength
    ) {
      result = true;
    } else if ( // движение по горизонтали
      Math.abs(currentIndex - nextIndex) <= stepLength
      && this.getHorizontalLine(currentIndex) === this.getHorizontalLine(nextIndex)
    ) {
      result = true;
    } else if ( // правая диагональ
      Math.abs(currentIndex - nextIndex) % (this.gamePlay.boardSize - 1) === 0
      && Math.abs(currentIndex - nextIndex) <= (this.gamePlay.boardSize - 1) * stepLength
    ) {
      result = true;
    } else if ( // левая диагональ
      Math.abs(currentIndex - nextIndex) % (this.gamePlay.boardSize + 1) === 0
      && Math.abs(currentIndex - nextIndex) <= (this.gamePlay.boardSize + 1) * stepLength
    ) {
      result = true;
    }
    return result;
  }

  canAttack(charType, currentIndex, nextIndex) {
    let result = false;
    let attackLength = 0;
    if (charType === 'swordsman' || charType === 'undead') {
      attackLength = 1;
    } else if (charType === 'bowman' || charType === 'vampire') {
      attackLength = 2;
    } else if (charType === 'magician' || charType === 'daemon') {
      attackLength = 4;
    }
    // проверяем радиус
    if ( // если расхождение по линиям уже больше доступного радиуса атаки
      Math.abs(
        this.getHorizontalLine(currentIndex) - this.getHorizontalLine(nextIndex),
      ) > attackLength
    ) {
      return false;
    }

    if ( // если на одной и той же линии
      this.getHorizontalLine(currentIndex) === this.getHorizontalLine(nextIndex)
    ) {
      if (Math.abs(currentIndex - nextIndex) <= attackLength) {
        result = true;
      }
      return result;
    }

    // во всех иных случаях ищем аналогичную позицию нашего персонажа
    // в линии, соответствующей линии противника (по столбику вверх или вниз)
    const differenceIndex = Math.abs(
      this.getHorizontalLine(currentIndex) - this.getHorizontalLine(nextIndex),
    ) * this.gamePlay.boardSize;
    let similarIndexInEnemyRow;

    // если наш персонаж по линии ниже, чем персонаж противника
    if (this.getHorizontalLine(currentIndex) > this.getHorizontalLine(nextIndex)) {
      similarIndexInEnemyRow = currentIndex - differenceIndex;
    } else { // если наш персонаж по линии выше, чем персонаж противника
      similarIndexInEnemyRow = currentIndex + differenceIndex;
    }

    // и теперь рассчитал позицию нашего персонажа, если бы он был на одной
    // линии с противником, вычисляем возможность атаки
    if (Math.abs(similarIndexInEnemyRow - nextIndex) <= attackLength) {
      result = true;
    }
    return result;
  }

  getHorizontalLine(index) {
    let result = 0;
    const size = this.gamePlay.boardSize;
    for (let i = 0; i < size; i++) {
      if (index >= size * i && index < size * (i + 1)) {
        result = i + 1;
        break;
      }
    }
    return result;
  }
}
