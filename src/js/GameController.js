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
    const teamsPositions = [];
    // размещаем команду игрока
    playerTeam.characters.forEach(element => {
      for (let pos = 0; pos < playerTeamPositions.length; pos++) {
        const randPos = Math.floor(Math.random() * playerTeamPositions.length);
        if (playerTeamPositions[randPos].empty === true) {
          playerTeamPositions[randPos].empty = false;
          const posClass = new PositionedCharacter(element, playerTeamPositions[randPos].index);
          teamsPositions.push(posClass);
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
          teamsPositions.push(posClass);
          break;
        }
      }
    });
    this.gamePlay.redrawPositions(teamsPositions);
  }

  onCellClick(index) {
    for (let cellIndex = 0; cellIndex < this.gamePlay.cells.length; cellIndex++) {
      this.gamePlay.deselectCell(cellIndex); // убираем выделение других клеток
    }

    if (this.gameState.step === 'user') { // если наш ход
      if (this.gamePlay.cells[index].children.length > 0) {
        const child = this.gamePlay.cells[index].children[0];
        if ( // если выбран наш персонаж
          child.classList.contains('bowman')
          || child.classList.contains('magician')
          || child.classList.contains('swordsman')
        ) {
          this.gamePlay.selectCell(index); // добавляем выделение нужного персонажа
          this.gameState.selectedChar = {
            index,
            type: child.dataset.type,
          };
        } else {
          if (this.gameState.selectedChar.index === undefined) {
            // если наш персонаж не выбран, и мы хотим выбрать персонажа противника
            GamePlay.showError('Это не Ваш персонаж!');
          } else {
            console.log('проверяем атаку');
          }
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
        console.log('если навелись не на нашего');
        if (this.gameState.selectedChar.index !== undefined) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red'); // добавляем выделение противника
        }
      }
    } else {
      if (this.gameState.selectedChar.index !== undefined) {
        // если персонаж может сюда пройти
        if (this.canMove(index)) {
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
    if (this.gameState.selectedChar.index !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  canMove(index) {
    const { selectedChar } = this.gameState;
    let result = false;
    // проверяем движение мечника
    if (selectedChar.type === 'swordsman') {
      if ( // движение по вертикали
        Math.abs(selectedChar.index - index) % this.gamePlay.boardSize === 0
        && Math.abs(selectedChar.index - index) <= this.gamePlay.boardSize * 4
      ) {
        result = true;
      } else if ( // движение по горизонтали
        Math.abs(selectedChar.index - index) <= 4
        && this.getHorizontalLine(selectedChar.index) === this.getHorizontalLine(index)
      ) {
        result = true;
      }
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
