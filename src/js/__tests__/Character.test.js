import Character from '../Character';

test('class Character - throw (create object)', () => {
  expect(() => {
    // eslint-disable-next-line no-unused-vars
    const character = new Character(1);
  }).toThrowError('Запрещено создавать объекты класса Character');
});
