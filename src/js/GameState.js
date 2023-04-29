export default class GameState {
  constructor() {
    this.game = 'new';
    this.step = 'user';
    this.selectedChar = undefined;
    this.playerCharacters = [];
    this.enemyCharacters = [];
    this.level = 1;
    this.gameNumber = 1;
    this.stat = [{
      gameNumber: 1,
      gamePoints: 0,
    }];
  }
}
