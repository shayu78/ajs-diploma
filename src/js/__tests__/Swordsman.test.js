import Swordsman from '../Characters/Swordsman';

describe('Swordsman methods', () => {
  test('class Swordsman - throw (create object)', () => {
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const swordsman = new Swordsman(1);
    }).not.toThrowError('Запрещено создавать объекты класса Character');
  });

  const swordsman = new Swordsman(2);
  swordsman.health = 0;

  test('Swordsman levelUp throw', () => {
    expect(() => {
      swordsman.levelUp();
    }).toThrowError(Error);
  });

  const upLevelSwordsman = new Swordsman(3);

  test('Swordsman levelUp', () => {
    upLevelSwordsman.levelUp();
    expect(upLevelSwordsman).toEqual(
      {
        name: '',
        type: 'swordsman',
        health: 100,
        level: 4,
        attack: 72,
        defence: 18,
        attackDistance: 1,
        moveDistance: 4,
      },
    );
  });

  const setValuesSwordsman = new Swordsman(1);

  test('Swordsman setValues', () => {
    setValuesSwordsman.setValues(10, 20, 10);
    expect(setValuesSwordsman).toEqual(
      {
        name: '',
        type: 'swordsman',
        health: 10,
        level: 1,
        attack: 10,
        defence: 20,
        attackDistance: 1,
        moveDistance: 4,
      },
    );
  });

  test('Swordsman levelUp again', () => {
    setValuesSwordsman.levelUp();
    expect(setValuesSwordsman).toEqual(
      {
        name: '',
        type: 'swordsman',
        health: 90,
        level: 2,
        attack: 10,
        defence: 20,
        attackDistance: 1,
        moveDistance: 4,
      },
    );
  });
});
