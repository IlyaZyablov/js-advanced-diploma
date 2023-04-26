export default class GameState {
  constructor() {
    this.step = 'user';
    this.selectedChar = undefined;
    this.characters = [];
    this.playerCharacters = [];
    this.enemyCharacters = [];
  }
}
