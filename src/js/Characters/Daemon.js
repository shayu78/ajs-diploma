import Character from '../Character';
import { computerCharactersTypes } from '../data';

export default class Daemon extends Character {
  constructor(level) {
    super(level, computerCharactersTypes[0]);
    this.attack = 10;
    this.defence = 40;
    this.moveDistance = 1;
    this.attackDistance = 4;
  }
}
