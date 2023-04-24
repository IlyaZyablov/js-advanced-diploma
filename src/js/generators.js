import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  try {
    while (true) {
      const randTypeIndex = Math.floor(Math.random() * allowedTypes.length);
      const randLevel = Math.round(1 - 0.5 + Math.random() * (maxLevel - 1 + 1));
      yield new allowedTypes[randTypeIndex](randLevel);
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const characters = [];
  for (let i = 0; i < characterCount; i++) {
    characters.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }
  return new Team(characters);
}
