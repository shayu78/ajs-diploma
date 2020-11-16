import Character from '../Character';
import { playerCharactersTypes } from '../data';

export default class Magician extends Character {
  constructor(level) {
    super(level, playerCharactersTypes[2]);
    this.attack = 10;
    this.defence = 40;
    this.moveDistance = 1;
    this.attackDistance = 4;
  }
}
