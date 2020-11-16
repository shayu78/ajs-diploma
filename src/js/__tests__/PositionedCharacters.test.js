import PositionedCharacters from '../PositionedCharacter';
import Swordsman from '../Characters/Swordsman';

describe('Swordsman methods', () => {
  const swordsman = new Swordsman(2);

  test('class PositionedCharacters - throw (create object)', () => {
    expect(() => {
    // eslint-disable-next-line no-unused-vars
      const positionedCharacters = new PositionedCharacters(1, 2);
    }).toThrowError('character must be instance of Character or its children');
  });

  test('class PositionedCharacters - throw (create object 2)', () => {
    expect(() => {
    // eslint-disable-next-line no-unused-vars
      const positionedCharacters = new PositionedCharacters(swordsman, true);
    }).toThrowError('position must be a number');
  });

  test('class PositionedCharacters - create object success)', () => {
    const positionedCharacters = new PositionedCharacters(swordsman, 1);
    expect(positionedCharacters).toEqual(
      {
        character: {
          attack: 40,
          attackDistance: 1,
          defence: 10,
          health: 100,
          level: 2,
          moveDistance: 4,
          name: '',
          type: 'swordsman',
        },
        position: 1,
      },
    );
  });
});
