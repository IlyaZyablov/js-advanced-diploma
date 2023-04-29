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
// и функции, возвращающей вывод описания
import { calcTileType, getDescription } from './utils';

// импорт курсоров
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    this.drawBoard(1);
    this.initCharacters();
    // listeners
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
  }

  drawBoard(level) {
    if (level === 1) {
      this.gamePlay.drawUi(themes.prairie);
    } else if (level === 2) {
      this.gamePlay.drawUi(themes.desert);
    } else if (level === 3) {
      this.gamePlay.drawUi(themes.arctic);
    } else {
      this.gamePlay.drawUi(themes.mountain);
    }
  }

  initCharacters() {
    // формирование команды игрока
    const playerTypes = [Bowman, Swordsman, Magician];
    const playerTeam = generateTeam(playerTypes, 1, 3);

    // формирование команды противника
    const enemyTypes = [Daemon, Undead, Vampire];
    const enemyTeam = generateTeam(enemyTypes, 1, 3);

    // отрисовка позиций
    this.drawTeams(playerTeam, enemyTeam);
  }

  drawTeams(playerTeam, enemyTeam) {
    // получаем позиции для игрока и противника
    const positions = this.getPositions();

    // размещаем команду игрока
    this.placeTeam(playerTeam, positions.player, 'player');

    // размещаем команду противника
    this.placeTeam(enemyTeam, positions.enemy, 'enemy');

    // обновляем поле
    this.gamePlay.redrawPositions([
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ]);
  }

  getPositions() {
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
    return { player: playerTeamPositions, enemy: enemyTeamPositions };
  }

  placeTeam(team, poses, teamType) {
    const positions = poses;
    team.characters.forEach(element => {
      for (let pos = 0; pos < positions.length; pos++) {
        const randPos = Math.floor(Math.random() * positions.length);
        if (positions[randPos].empty === true) {
          positions[randPos].empty = false;
          const posClass = new PositionedCharacter(element, positions[randPos].index);
          // записываем персонажа в команду игрока
          if (teamType === 'player') {
            this.gameState.playerCharacters.push(posClass);
          } else { // записываем персонажа в команду противника
            this.gameState.enemyCharacters.push(posClass);
          }
          break;
        }
      }
    });
  }

  generateNewLevel() {
    // формирование команды противника
    const enemyTypes = [Daemon, Undead, Vampire];
    const enemyTeam = generateTeam(enemyTypes, this.gameState.level, this.gameState.level + 1);

    // получаем позиции для игрока и противника
    const positions = this.getPositions();

    // размещаем команду противника
    this.placeTeam(enemyTeam, positions.enemy, 'enemy');

    // повышение уровня оставшихся персонажей игрока и размещение на дефолтные позиции
    for (let i = 0; i < this.gameState.playerCharacters.length; i++) {
      const element = this.gameState.playerCharacters[i];
      // размещаем на дефолтных позициях игрока
      for (let pos = 0; pos < positions.player.length; pos++) {
        const randPos = Math.floor(Math.random() * positions.player.length);
        if (positions.player[randPos].empty === true) {
          positions.player[randPos].empty = false;
          element.position = positions.player[randPos].index;
          break;
        }
      }
      // добавляем очки за каждого живого персонажа
      this.gameState.stat[this.gameState.gameNumber - 1].gamePoints += 20;
      // повышаем уровень и характеристики
      element.character.levelUp();
    }

    this.gamePlay.redrawPositions([
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ]);
  }

  onCellClick(index) {
    if (this.gameState.game === 'over') {
      GamePlay.showError('Игра окончена! Нажмите New Game для начала новой игры.');
      return;
    }

    for (let cellIndex = 0; cellIndex < this.gamePlay.cells.length; cellIndex++) {
      this.gamePlay.deselectCell(cellIndex); // убираем выделение других клеток
    }

    // если не наш ход
    if (this.gameState.step !== 'user') {
      GamePlay.showError('Сейчас не Ваш ход!');
      return;
    }

    // если кликаем по полю, на котором есть какой-либо персонаж
    if (this.gamePlay.cells[index].children.length > 0) {
      const child = this.gamePlay.cells[index].children[0];
      if ( // если пытаемся выбрать нашего персонаж
        child.classList.contains('bowman')
        || child.classList.contains('magician')
        || child.classList.contains('swordsman')
      ) {
        this.gamePlay.selectCell(index); // добавляем выделение нужного персонажа
        // перебираем массив с персонажами игрока
        for (let i = 0; i < this.gameState.playerCharacters.length; i++) {
          const element = this.gameState.playerCharacters[i];
          // если позиция персонажа из массива совпадает с выбранной точкой
          if (element.position === index) {
            this.gameState.selectedChar = element;
          }
        }
      } else { // если кликаем на персонажа противника
        // если наш персонаж не выбран, и мы хотим выбрать персонажа противника
        if (this.gameState.selectedChar === undefined) {
          GamePlay.showError('Это не Ваш персонаж!');
          return;
        }
        // если наш персонаж выбран, проверяем дальность атаки
        const char = this.gameState.selectedChar;
        if (this.canAttack(char.character.type, char.position, index)) {
          this.attack(char, index);
          // добавляем очки за проведение атаки
          this.gameState.stat[this.gameState.gameNumber - 1].gamePoints += 5;
        } else {
          GamePlay.showError('Вы не можете атаковать выбранным персонажем так далеко!');
          // очищаем данные о выбранном персонаже
          this.gameState.selectedChar = undefined;
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
        // добавляем очки за передвижение
        this.gameState.stat[this.gameState.gameNumber - 1].gamePoints += 1;
      } else {
        GamePlay.showError('Вы не можете переместить этого персонажа сюда!');
        // очищаем данные о выбранном персонаже
        this.gameState.selectedChar = undefined;
      }
    }
  }

  onCellEnter(index) {
    if (this.gameState.game === 'over') {
      return;
    }

    // если наводимся на поле, на котором есть какой-либо персонаж
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
    } else { // если наводимся на пустое поле
      // если выбран какой-либо персонаж
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
    if (this.gameState.game === 'over') {
      return;
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
    if (this.gameState.selectedChar && this.gameState.selectedChar.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  move(char, toIndex) {
    // перебираем массив с персонажами
    const characters = [
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ];
    for (let i = 0; i < characters.length; i++) {
      const element = characters[i];
      // если позиция персонажа из массива совпадает с позицией выбранного персонажа
      if (element.position === char.position) {
        element.position = toIndex; // присваиваем новую позицию
        break;
      }
    }
    // обновляем поле
    this.gamePlay.redrawPositions(characters);

    // если был ход игрока
    if (this.gameState.step === 'user') {
      // очищаем данные выбранного персонажа
      this.gameState.selectedChar = undefined;
      // передаём ход противнику
      this.gameState.step = 'enemy';
      // запускаем действия противника
      setTimeout(() => this.enemyAction(), 300);
    } else { // если был ход противника
      // передаём ход игроку
      this.gameState.step = 'user';
    }
  }

  attack(attacker, toIndex) {
    let damage;
    // перебираем массив с персонажами
    const characters = [
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ];
    for (let i = 0; i < characters.length; i++) {
      const target = characters[i];
      // если позиция персонажа из массива совпадает с выбранной точкой
      if (target.position === toIndex) {
        damage = Math.max(
          attacker.character.attack - target.character.defence,
          Math.round(attacker.character.attack * 0.1),
        );
        target.character.health -= damage;
        console.log(`[LOG] ${attacker.character.type} атаковал ${target.character.type} - урон ${damage}`);
        if (target.character.health <= 0) {
          console.log(`[LOG] ${target.character.type} был убит персонажем ${attacker.character.type}`);
          this.deleteChar(target);
        }
      }
    }

    this.gamePlay.showDamage(toIndex, damage).then(() => {
      // обновляем поле
      this.gamePlay.redrawPositions([
        ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
      ]);

      // если был ход игрока
      if (this.gameState.step === 'user') {
        // очищаем данные выбранного персонажа
        this.gameState.selectedChar = undefined;
        // передаём ход противнику
        this.gameState.step = 'enemy';
        // запускаем действия противника
        setTimeout(() => this.enemyAction(), 300);
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

    for (let cellIndex = 0; cellIndex < this.gamePlay.cells.length; cellIndex++) {
      this.gamePlay.deselectCell(cellIndex); // убираем выделение других клеток
    }

    // если персонажей не осталось, ничего не делаем
    if (this.gameState.enemyCharacters.length === 0) {
      return;
    }

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

  deleteChar(char) {
    if ( // если персонаж игрока, обновляем массив персонажей игрока
      char.character.type === 'bowman'
      || char.character.type === 'swordsman'
      || char.character.type === 'magician'
    ) {
      // забираем очки, если персонаж игрока убит
      this.gameState.stat[this.gameState.gameNumber - 1].gamePoints -= 20;
      if (this.gameState.stat[this.gameState.gameNumber - 1].gamePoints < 0) {
        this.gameState.stat[this.gameState.gameNumber - 1].gamePoints = 0;
      }
      for (let i = 0; i < this.gameState.playerCharacters.length; i++) {
        if (this.gameState.playerCharacters[i].position === char.position) {
          this.gameState.playerCharacters.splice(i, 1);
        }
      }
    } else if ( // если персонаж противника, обновляем массив персонажей противника
      char.character.type === 'daemon'
      || char.character.type === 'undead'
      || char.character.type === 'vampire'
    ) {
      // добавляем очки за убийство противника
      this.gameState.stat[this.gameState.gameNumber - 1].gamePoints += 20;
      for (let i = 0; i < this.gameState.enemyCharacters.length; i++) {
        if (this.gameState.enemyCharacters[i].position === char.position) {
          this.gameState.enemyCharacters.splice(i, 1);
        }
      }
    }
    // обновляем поле
    this.gamePlay.redrawPositions([
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ]);

    // если персонажей игрока больше нет
    if (this.gameState.playerCharacters.length === 0) {
      console.log(`[LOG] Поражение! Количество очков: ${this.gameState.stat[this.gameState.gameNumber - 1].gamePoints}`);
      this.gameState.game = 'over';
      return;
    }

    // если противников больше нет
    if (this.gameState.enemyCharacters.length === 0) {
      console.log(`[LOG] Победа! Вы успешно прошли ${this.gameState.level}-й уровень!`);
      this.gameState.level += 1;
      setTimeout(() => {
        this.gameState.step = 'user';
        if (this.gameState.level <= 4) {
          this.drawBoard(this.gameState.level);
          this.generateNewLevel();
        } else {
          console.log(`[LOG] Победа! Вы успешно прошли игру! Количество очков: ${this.gameState.stat[this.gameState.gameNumber - 1].gamePoints}`);
          this.gameState.game = 'over';
        }
      }, 3000);
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
    }

    // движение по вертикали
    const linesDiff = Math.abs(
      this.getHorizontalLine(currentIndex) - this.getHorizontalLine(nextIndex),
    );
    if (
      this.getHorizontalLine(currentIndex) > this.getHorizontalLine(nextIndex)
      && linesDiff <= stepLength
    ) {
      if (
        currentIndex - this.gamePlay.boardSize * linesDiff - linesDiff === nextIndex
        || currentIndex - this.gamePlay.boardSize * linesDiff + linesDiff === nextIndex
      ) {
        result = true;
      }
    } else if (
      this.getHorizontalLine(currentIndex) < this.getHorizontalLine(nextIndex)
      && linesDiff <= stepLength
    ) {
      if (
        currentIndex + this.gamePlay.boardSize * linesDiff - linesDiff === nextIndex
        || currentIndex + this.gamePlay.boardSize * linesDiff + linesDiff === nextIndex
      ) {
        result = true;
      }
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

    // и теперь рассчитаем позицию нашего персонажа, если бы он был на одной
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

  onNewGameClick() {
    // изменением номера текущей игры
    this.gameState.gameNumber += 1;
    this.gameState.stat.push({
      gameNumber: this.gameState.gameNumber,
      gamePoints: 0,
    });

    // очистка состояний прошлой игры
    this.gameState.playerCharacters = [];
    this.gameState.enemyCharacters = [];
    this.gameState.game = 'new';
    this.gameState.step = 'user';
    this.gameState.selectedChar = undefined;
    this.gameState.level = 1;

    // отрисовка поля
    this.drawBoard(1);
    this.initCharacters();
  }

  onLoadGameClick() {
    if (!this.stateService.load()) {
      GamePlay.showError('У вас нет сохранённых игр!');
      return;
    }
    // получаем данные
    const loadGameInfo = this.stateService.load();
    // пересоздаём GameState
    this.gameState = new GameState();

    // записываем состояние игры
    this.gameState.game = loadGameInfo.game;

    // пересоздаём персонажей игрока
    for (let i = 0; i < loadGameInfo.playerCharacters.length; i++) {
      const char = loadGameInfo.playerCharacters[i];
      let charClass;
      if (char.character.type === 'bowman') {
        charClass = new Bowman(char.character.level);
      } else if (char.character.type === 'swordsman') {
        charClass = new Swordsman(char.character.level);
      } else if (char.character.type === 'magician') {
        charClass = new Magician(char.character.level);
      }
      charClass.attack = char.character.attack;
      charClass.defence = char.character.defence;
      charClass.health = char.character.health;
      this.gameState.playerCharacters.push(
        new PositionedCharacter(charClass, char.position),
      );
    }

    // пересоздаём персонажей противника
    for (let i = 0; i < loadGameInfo.enemyCharacters.length; i++) {
      const char = loadGameInfo.enemyCharacters[i];
      let charClass;
      if (char.character.type === 'daemon') {
        charClass = new Daemon(char.character.level);
      } else if (char.character.type === 'undead') {
        charClass = new Undead(char.character.level);
      } else if (char.character.type === 'vampire') {
        charClass = new Vampire(char.character.level);
      }
      charClass.attack = char.character.attack;
      charClass.defence = char.character.defence;
      charClass.health = char.character.health;
      this.gameState.enemyCharacters.push(
        new PositionedCharacter(charClass, char.position),
      );
    }

    // записываем уровень игры
    this.gameState.level = loadGameInfo.level;

    // записываем номер игры
    this.gameState.gameNumber = loadGameInfo.gameNumber;

    // записываем статистику
    this.gameState.stat = loadGameInfo.stat;

    // отрисовываем поле и персонажей
    this.drawBoard(this.gameState.level);
    this.gamePlay.redrawPositions([
      ...this.gameState.playerCharacters, ...this.gameState.enemyCharacters,
    ]);

    console.log('[LOG] Игра успешно загружена!');
  }

  onSaveGameClick() {
    this.stateService.save(this.gameState);
    console.log('[LOG] Игра успешно сохранена!');
  }
}
