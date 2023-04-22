import { calcTileType } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [1, 8, 'top'],
  [7, 8, 'top-right'],
  [7, 7, 'left'],
  [9, 8, 'center'],
  [23, 8, 'right'],
  [56, 8, 'bottom-left'],
  [59, 8, 'bottom'],
  [63, 8, 'bottom-right'],
])('utils test', (index, boardSize, expected) => {
  const result = calcTileType(index, boardSize);
  expect(result).toBe(expected);
});
