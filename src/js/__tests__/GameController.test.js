import Bowerman from '../Characters/Bowerman';
import Magician from '../Characters/Magician';
import Swordsman from '../Characters/Swordsman';
import PositionedCharacter from '../PositionedCharacter';

test('Bowerman tooltip (level 1)', () => {
  const value = new PositionedCharacter(new Bowerman(1), 0);
  const received = `\uD83C\uDF96${value.character.level} \u2694${value.character.attack} \uD83D\uDEE1${value.character.defence} \u2764${value.character.health}`;
  const expected = '\uD83C\uDF961 \u269425 \uD83D\uDEE125 \u2764100';
  expect(received).toBe(expected);
});

test('Magician tooltip (level 2)', () => {
  const value = new PositionedCharacter(new Magician(2), 10);
  const received = `\uD83C\uDF96${value.character.level} \u2694${value.character.attack} \uD83D\uDEE1${value.character.defence} \u2764${value.character.health}`;
  const expected = '\uD83C\uDF962 \u269410 \uD83D\uDEE140 \u2764100';
  expect(received).toBe(expected);
});

test('Swordsman tooltip (level 3)', () => {
  const value = new PositionedCharacter(new Swordsman(3), 63);
  const received = `\uD83C\uDF96${value.character.level} \u2694${value.character.attack} \uD83D\uDEE1${value.character.defence} \u2764${value.character.health}`;
  const expected = '\uD83C\uDF963 \u269440 \uD83D\uDEE110 \u2764100';
  expect(received).toBe(expected);
});
