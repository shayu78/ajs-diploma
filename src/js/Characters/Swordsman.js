import Character from '../Character';
import { playerCharactersTypes } from '../data';

export default class Swordsman extends Character {
  constructor(level) {
    super(level, playerCharactersTypes[1]);
    this.attack = 40;
    this.defence = 10;
    this.moveDistance = 4;
    this.attackDistance = 1;
  }
}
