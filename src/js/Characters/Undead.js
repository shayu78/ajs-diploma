import Character from '../Character';
import { computerCharactersTypes } from '../data';

export default class Undead extends Character {
  constructor(level) {
    super(level, computerCharactersTypes[1]);
    this.attack = 40;
    this.defence = 10;
    this.moveDistance = 4;
    this.attackDistance = 1;
  }
}
