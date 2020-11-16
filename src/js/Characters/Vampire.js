import Character from '../Character';
import { computerCharactersTypes } from '../data';

export default class Vampire extends Character {
  constructor(level) {
    super(level, computerCharactersTypes[2]);
    this.attack = 25;
    this.defence = 25;
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}
