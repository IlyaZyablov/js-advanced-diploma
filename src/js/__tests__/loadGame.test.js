import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';

jest.mock('../GameStateService');
jest.mock('../GamePlay');

const gamePlay = new GamePlay();
gamePlay.container = {};

const stateService = new GameStateService('test');
const gameCtrl = new GameController(gamePlay, stateService);

beforeEach(() => {
  jest.resetAllMocks();
});

test('load game test', () => {
  gamePlay.drawUi.mockImplementation();
  gamePlay.redrawPositions.mockImplementation();
  stateService.load.mockReturnValue(JSON.parse('{"game":"new","step":"user","characters":[{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"bowman"},"position":49},{"character":{"level":1,"attack":10,"defence":40,"health":50,"type":"magician"},"position":48},{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"bowman"},"position":17},{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"vampire"},"position":62},{"character":{"level":1,"attack":10,"defence":10,"health":50,"type":"daemon"},"position":38},{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"vampire"},"position":14}],"playerCharacters":[{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"bowman"},"position":49},{"character":{"level":1,"attack":10,"defence":40,"health":50,"type":"magician"},"position":48},{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"bowman"},"position":17}],"enemyCharacters":[{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"vampire"},"position":62},{"character":{"level":1,"attack":10,"defence":10,"health":50,"type":"daemon"},"position":38},{"character":{"level":1,"attack":25,"defence":25,"health":50,"type":"vampire"},"position":14}],"level":1,"gameNumber":1,"stat":[{"gameNumber":1,"gamePoints":0}]}'));
  gameCtrl.onLoadGameClick();
  expect(stateService.load).toBeCalled();
});
