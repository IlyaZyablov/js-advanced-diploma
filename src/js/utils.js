/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  let result;
  if (index === 0) { // левый верхний
    result = 'top-left';
  } else if (index === boardSize - 1) { // правый верхний
    result = 'top-right';
  } else if (index < boardSize) { // верхние
    result = 'top';
  } else if (index === boardSize ** 2 - boardSize) { // левый нижний
    result = 'bottom-left';
  } else if (index === boardSize ** 2 - 1) { // правый нижний
    result = 'bottom-right';
  } else if (index > boardSize ** 2 - boardSize && index < boardSize ** 2 - 1) { // нижние
    result = 'bottom';
  } else if (index % boardSize === 0) { // левые
    result = 'left';
  } else if (index % boardSize === boardSize - 1) { // правые
    result = 'right';
  } else { // центральные
    result = 'center';
  }
  return result;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
