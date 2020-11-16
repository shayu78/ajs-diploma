import Team from './Team';
import { getRandomInteger } from './utils';
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const index = getRandomInteger(0, allowedTypes.length - 1);
  yield new allowedTypes[index](maxLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();
  for (let i = 0; i < characterCount; i += 1) {
    team.add(...characterGenerator(allowedTypes, getRandomInteger(1, maxLevel)));
  }
  return team;
}
