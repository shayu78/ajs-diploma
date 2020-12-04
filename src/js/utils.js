export function calcTileType(index, boardSize) {
  if (index === 0) return 'top-left';

  if (index === (boardSize - 1)) return 'top-right';

  if (index === (boardSize ** 2 - 1)) return 'bottom-right';

  if (index === (boardSize ** 2 - boardSize)) return 'bottom-left';

  if (index > 0 && index < (boardSize - 1)) return 'top';

  if ((index % boardSize) === (boardSize - 1)) return 'right';

  if (index > (boardSize ** 2 - boardSize) && index < (boardSize ** 2 - 1)) return 'bottom';

  if ((index % boardSize) === 0) return 'left';

  return 'center';
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

export function getRandomInteger(min, max) {
  return Math.floor(min + (max + 1 - min) * Math.random());
}

export function coordsToPosition(x, y) {
  if (x < 0 || x > 7 || y < 0 || y > 7) throw new Error('Неверные координаты игрового поля');
  return x + y * 8;
}

export function positionToCoords(position) {
  if (position < 0 || position > 63) throw new Error('Неверная позиция игрового поля');
  const x = Math.floor(position % 8);
  const y = Math.floor(position / 8);
  return [x, y];
}

export function getAvailableHorizontalVerticalPositionsByValue(selectedCoords, parameter) {
  const coords = [];

  // сверху по вертикали
  for (let i = 1, j = 0; selectedCoords[1] - i >= 0 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0], selectedCoords[1] - i]);

  // справа по горизонтали
  for (let i = 1, j = 0; selectedCoords[0] + i <= 7 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] + i, selectedCoords[1]]);

  // снизу по вертикали
  for (let i = 1, j = 0; selectedCoords[1] + i <= 7 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0], selectedCoords[1] + i]);

  // слева по горизонтали
  for (let i = 1, j = 0; selectedCoords[0] - i >= 0 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] - i, selectedCoords[1]]);

  return coords.map((value) => coordsToPosition(value[0], value[1]));
}

export function getAvailableMovePositions(selectedCoords, parameter) {
  const hvPositions = getAvailableHorizontalVerticalPositionsByValue(selectedCoords, parameter);

  const coords = [];

  // сверху слева по диагонали
  for (let i = 1, j = 0;
    selectedCoords[0] - i >= 0 && selectedCoords[1] - i >= 0 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] - i, selectedCoords[1] - i]);

  // сверху справа по диагонали
  for (let i = 1, j = 0;
    selectedCoords[0] + i <= 7 && selectedCoords[1] - i >= 0 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] + i, selectedCoords[1] - i]);

  // снизу справа по диагонали
  for (let i = 1, j = 0;
    selectedCoords[0] + i <= 7 && selectedCoords[1] + i <= 7 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] + i, selectedCoords[1] + i]);

  // снизу слева по диагонали
  for (let i = 1, j = 0;
    selectedCoords[0] - i >= 0 && selectedCoords[1] + i <= 7 && j < parameter;
    i += 1, j += 1) coords.push([selectedCoords[0] - i, selectedCoords[1] + i]);

  return (coords.map((value) => coordsToPosition(value[0], value[1])).concat(hvPositions))
    .sort((a, b) => a - b);
}

export function getAvailableAttackPositions(selectedCoords, parameter) {
  const coords = [];

  function repeatedY(x, selectedY, distance) {
    for (let j = selectedY - 1; j >= 0 && j >= selectedY - distance; j -= 1) {
      coords.push([x, j]);
    }
    for (let j = selectedY + 1; j <= 7 && j <= selectedY + distance; j += 1) {
      coords.push([x, j]);
    }
  }

  const hvPositions = getAvailableHorizontalVerticalPositionsByValue(selectedCoords, parameter);

  // сверху и снизу слева квадраты
  for (let i = selectedCoords[0] - 1; i >= 0 && i >= selectedCoords[0] - parameter; i -= 1) {
    repeatedY(i, selectedCoords[1], parameter);
  }

  // сверху и снизу справа квадраты
  for (let i = selectedCoords[0] + 1; i <= 7 && i <= selectedCoords[0] + parameter; i += 1) {
    repeatedY(i, selectedCoords[1], parameter);
  }

  return (coords.map((value) => coordsToPosition(value[0], value[1])).concat(hvPositions))
    .sort((a, b) => a - b);
}

export function getAvailablePositions(selectedCharacter, selectedPosition) {
  // console.log(`Персонаж = ${selectedCharacter.type},
  // позиция выбранного персонажа = ${selectedPosition}`);
  const selectedCoords = positionToCoords(selectedPosition);
  // console.log(`Координаты выбранного персонажа = ${selectedCoords}`);

  // console.log(`Дистанция перемещения персонажа = ${selectedCharacter.moveDistance}`);
  const movePositions = getAvailableMovePositions(selectedCoords, selectedCharacter.moveDistance);

  // console.log(`Дистанция атаки персонажа = ${selectedCharacter.attackDistance}`);
  const attackPositions = getAvailableAttackPositions(selectedCoords,
    selectedCharacter.attackDistance);

  return [movePositions, attackPositions];
}
