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
    if (this.gameState.step === 'user') {
      if (this.gamePlay.cells[index].children.length > 0) {
        const child = this.gamePlay.cells[index].children[0];
        if (
          child.classList.contains('bowman')
          || child.classList.contains('magician')
          || child.classList.contains('swordsman')
        ) {
          for (let cellIndex = 0; cellIndex < this.gamePlay.cells.length; cellIndex++) {
            this.gamePlay.deselectCell(cellIndex);
          }
          this.gamePlay.selectCell(index);
        } else {
          GamePlay.showError('Это не Ваш персонаж!');
        }
      }
    } else {
      GamePlay.showError('Сейчас не Ваш ход!');
    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length > 0) {
      const {
        level, attack, defence, health,
      } = this.gamePlay.cells[index].children[0].dataset;
      this.gamePlay.showCellTooltip(getDescription`🎖${level}\u2694${attack}🛡${defence}\u2764${health}`, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
