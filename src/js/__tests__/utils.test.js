import {
  calcTileType,
  calcHealthLevel,
  getRandomInteger,
  coordsToPosition,
  positionToCoords,
  getAvailableMovePositions,
  getAvailablePositions,
} from '../utils';
import Swordsman from '../Characters/Swordsman';

describe('function calcTileType result for boardSize is 8', () => {
  const boardSize = 8;

  test.each([
    [0, 'top-left'],
    [1, 'top'],
    [4, 'top'],
    [6, 'top'],
    [7, 'top-right'],
    [8, 'left'],
    [9, 'center'],
    [11, 'center'],
    [14, 'center'],
    [15, 'right'],
    [16, 'left'],
    [18, 'center'],
    [19, 'center'],
    [22, 'center'],
    [23, 'right'],
    [24, 'left'],
    [26, 'center'],
    [27, 'center'],
    [30, 'center'],
    [31, 'right'],
    [56, 'bottom-left'],
    [57, 'bottom'],
    [60, 'bottom'],
    [62, 'bottom'],
    [63, 'bottom-right'],
  ])('index %d is %s', (index, expected) => {
    const received = calcTileType(index, boardSize);
    expect(received).toBe(expected);
  });
});

describe('function calcTileType result for boardSize is 3', () => {
  const boardSize = 3;

  test.each([
    [0, 'top-left'],
    [1, 'top'],
    [2, 'top-right'],
    [3, 'left'],
    [4, 'center'],
    [5, 'right'],
    [6, 'bottom-left'],
    [7, 'bottom'],
    [8, 'bottom-right'],
  ])('index %d is %s', (index, expected) => {
    const received = calcTileType(index, boardSize);
    expect(received).toBe(expected);
  });
});

describe('function calcHealthLevel', () => {
  test.each([
    [5, 'critical'],
    [15, 'normal'],
    [30, 'normal'],
    [50, 'high'],
    [80, 'high'],
  ])('get health status - index %d is %s', (health, expected) => {
    const received = calcHealthLevel(health);
    expect(received).toBe(expected);
  });
});

test('function getRandomInteger', () => {
  const data = getRandomInteger(2, 7);
  expect(data).toBeGreaterThanOrEqual(2);
  expect(data).toBeLessThanOrEqual(7);
});

test('function coordsToPosition throw', () => {
  expect(() => {
    coordsToPosition(-1, 0);
  }).toThrowError(Error);
});

test('function coordsToPosition', () => {
  const data = coordsToPosition(2, 7);
  expect(data).toEqual(58);
});

test('function positionToCoords throw', () => {
  expect(() => {
    positionToCoords(-1);
  }).toThrowError(Error);
});

test('function positionToCoords', () => {
  const data = positionToCoords(63);
  expect(data).toEqual(expect.arrayContaining([7, 7]));
});

describe('function getAvailableMovePositions', () => {
  test.each([
    [[0, 0], 2, [1, 2, 8, 9, 16, 18]],
    [[7, 0], 3, [4, 5, 6, 14, 15, 21, 23, 28, 31]],
    [[7, 7], 1, [54, 55, 62]],
    [[0, 7], 4, [24, 28, 32, 35, 40, 42, 48, 49, 57, 58, 59, 60]],
    [[4, 4], 1, [27, 28, 29, 35, 37, 43, 44, 45]],
  ])('get available positions by distance - index %o is %d', (coords, distance, expected) => {
    const received = getAvailableMovePositions(coords, distance);
    expect(received).toEqual(expect.arrayContaining(expected));
  });
});

describe('function getAvailablePositions', () => {
  const swordsman = new Swordsman(1);

  test.each([
    [swordsman, 0, [[1, 2, 3, 4, 8, 9, 16, 18, 24, 27, 32, 36], [1, 8, 9]]],
    [swordsman, 7, [[3, 4, 5, 6, 14, 15, 21, 23, 28, 31, 35, 39], [6, 14, 15]]],
    [swordsman, 63, [[27, 31, 36, 39, 45, 47, 54, 55, 59, 60, 61, 62], [54, 55, 62]]],
    [swordsman, 56, [[24, 28, 32, 35, 40, 42, 48, 49, 57, 58, 59, 60], [48, 49, 57]]],
    [swordsman, 25, [
      [1, 4, 9, 11, 16, 17, 18, 24, 26, 27, 28, 29, 32, 33, 34, 41, 43, 49, 52, 57, 61],
      [16, 17, 18, 24, 26, 32, 33, 34]],
    ],
  ])('get available positions by character - index %o is %d', (character, position, expected) => {
    const received = getAvailablePositions(character, position);
    expect(received).toEqual(expect.arrayContaining(expected));
  });
});
