import Character from '../Character';
import { playerCharactersTypes } from '../data';

export default class Bowerman extends Character {
  constructor(level) {
    super(level, playerCharactersTypes[0]);
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}
