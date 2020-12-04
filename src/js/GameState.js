import {
  playerCharactersTypes, computerCharactersTypes,
  playerId, computerId, firstLevel,
} from './data';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Characters/Bowerman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

export default class GameState {
  constructor() {
    this.activePlayer = playerId;
    this.selectedCharacter = null;
    this.playerTeamPositioned = [];
    this.computerTeamPositioned = [];
    this.points = 0;
    this.level = firstLevel;
  }

  switchActivePlayer() {
    this.activePlayer = (this.activePlayer === playerId) ? computerId : playerId;
  }

  from(object) {
    this.activePlayer = object.activePlayer;
    this.points = object.points;
    this.level = object.level;
    this.playerTeamPositioned = object.playerTeamPositioned.map((value) => {
      let character;
      switch (value.character.type) {
        case playerCharactersTypes[0]: {
          character = new Bowman(value.character.level);
          break;
        }
        case playerCharactersTypes[2]: {
          character = new Magician(value.character.level);
          break;
        }
        case playerCharactersTypes[1]: {
          character = new Swordsman(value.character.level);
          break;
        }
        default:
      }
      character.setValues(value.character.attack, value.character.defence, value.character.health);
      return new PositionedCharacter(character, value.position);
    });

    this.computerTeamPositioned = object.computerTeamPositioned.map((value) => {
      let character;
      switch (value.character.type) {
        case computerCharactersTypes[0]: {
          character = new Daemon(value.character.level);
          break;
        }
        case computerCharactersTypes[1]: {
          character = new Undead(value.character.level);
          break;
        }
        case computerCharactersTypes[2]: {
          character = new Vampire(value.character.level);
          break;
        }
        default:
      }
      character.setValues(value.character.attack, value.character.defence, value.character.health);
      return new PositionedCharacter(character, value.position);
    });

    return null;
  }

  getTeamsPositioned() {
    return this.playerTeamPositioned.concat(this.computerTeamPositioned);
  }
}
