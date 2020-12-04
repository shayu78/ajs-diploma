/* eslint-disable no-console */
import themes from './themes';
import { generateTeam } from './generators';
import Bowman from './Characters/Bowerman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import Team from './Team';
import { coordsToPosition, getRandomInteger, getAvailablePositions } from './utils';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import {
  playerCharactersTypes, computerCharactersTypes,
  playerTeamId, computerTeamId,
  playerId, computerId,
  firstLevel, secondLevel, thirdLevel, forthLevel,
} from './data';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.playerTeam = new Team();
    this.computerTeam = new Team();
    this.addEventListeners();
    this.personAction = undefined;
  }

  get isPlayerPerson() {
    return playerCharactersTypes.includes(this.personAction.character.type);
  }

  get isComputerPerson() {
    return computerCharactersTypes.includes(this.personAction.character.type);
  }

  isAttackPoint(index) {
    return this.availablePoints[1].includes(index);
  }

  isMovePoint(index) {
    return this.availablePoints[0].includes(index);
  }

  get isCharacterSelected() {
    return this.gameState.selectedCharacter !== null;
  }

  init(isReload = true) {
    this.setBlockingBoard(true);
    this.availablePoints = [[], []];
    let loadStateResult = false;
    if (isReload) {
      try {
        this.loadGameState();
        loadStateResult = true;
      } catch (error) {
        console.error(error.message);
      }
    }
    if (!loadStateResult) {
      this.gameState.playerTeamPositioned = [];
      this.gameState.computerTeamPositioned = [];
      this.gameState.level = firstLevel;
      this.activePlayer = playerId;
      this.generateEnvironmentByLevel(this.gameState.level);
      this.gamePlay.redrawPositions(this.gameState.getTeamsPositioned());
      this.viewStateInformation();
    }
    this.setBlockingBoard(false);
  }

  addEventListeners() {
    this.gamePlay.addNewGameListener(() => this.init(false));
    this.gamePlay.addSaveGameListener(() => this.saveGameState(true));
    this.gamePlay.addLoadGameListener(() => this.loadGameState(true));
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      this.saveGameState();
    });
  }

  onCellClick(index) {
    this.gamePlay.deselectCell(index);
    this.personAction = this.gameState.getTeamsPositioned()
      .find((value) => value.position === index);
    if (this.personAction) {
      if (this.isPlayerPerson) {
        if (this.isCharacterSelected) {
          // меняем своего персонажа
          this.gamePlay.deselectCell(this.gameState.selectedCharacter.position);
        }
        this.gamePlay.selectCell(index);
        this.gameState.selectedCharacter = this.personAction;
        this.availablePoints = getAvailablePositions(this.gameState.selectedCharacter.character,
          this.gameState.selectedCharacter.position);
      } else if (this.isCharacterSelected) {
        if (this.isAttackPoint(index)) {
          this.setBlockingBoard(true);
          this.attackAction(this.gameState.selectedCharacter, this.personAction).then((result) => {
            if (result) {
              // уровень пройден
              this.gameState.playerTeamPositioned.forEach((player) => {
                this.gameState.points += player.character.health;
                player.character.levelUp();
              });
              if (this.gameState.level === forthLevel) {
                // оставляем поле заблокируемым
                GamePlay.showMessage('Игра завершена победой игрока!!!');
              } else {
                this.gameState.level += 1;
                // формируем команды игроков
                this.generateEnvironmentByLevel(this.gameState.level);
                this.gamePlay.redrawPositions(this.gameState.getTeamsPositioned());
                this.setBlockingBoard(false);
              }
              this.viewStateInformation();
            } else {
              this.gameState.switchActivePlayer();
              this.viewStateInformation();
              this.computerAction();
            }
          });
        } else GamePlay.showMessage('Противник недостижим для атаки');
      } else GamePlay.showError('Это не ваш персонаж');
    } else if (this.isCharacterSelected && this.isMovePoint(index)) {
      this.setBlockingBoard(true);
      this.moveAction(this.gameState.selectedCharacter, index);
      this.gameState.switchActivePlayer();
      this.viewStateInformation();
      this.computerAction();
    }
  }

  onCellEnter(index) {
    this.personAction = this.gameState.getTeamsPositioned()
      .find((value) => value.position === index);
    if (this.personAction) {
      const tooltip = `\uD83C\uDF96${this.personAction.character.level} \u2694${this.personAction.character.attack} \uD83D\uDEE1${this.personAction.character.defence} \u2764${this.personAction.character.health}`;
      this.gamePlay.showCellTooltip(tooltip, index);
      if (this.isPlayerPerson) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.isCharacterSelected && this.isComputerPerson && this.isAttackPoint(index)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else this.gamePlay.setCursor(cursors.notallowed);
    } else if (this.isCharacterSelected) {
      if (this.gameState.selectedCharacter.position !== index && this.isMovePoint(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.auto);
    if (this.isCharacterSelected
      && this.gameState.selectedCharacter.position !== index) this.gamePlay.deselectCell(index);
    if (this.gameState.getTeamsPositioned()
      .some((value) => value.position === index)) this.gamePlay.hideCellTooltip(index);
  }

  async attackAction(ally, enemy) {
    const damage = Math.floor(Math.max(ally.character.attack - enemy.character.defence,
      ally.character.attack * 0.1));
    await this.gamePlay.showDamage(enemy.position, damage);
    if (this.isComputerPerson) {
      // нанесли урон персонажу компьютера
      const positionedCharacter = this.gameState.computerTeamPositioned
        .find((value) => value === enemy);
      if (positionedCharacter) {
        positionedCharacter.character.health -= damage;
        if (positionedCharacter.character.health <= 0) {
          this.gameState.computerTeamPositioned
            .splice(this.gameState.computerTeamPositioned.indexOf(positionedCharacter), 1);
        }
      }
    } else {
      // нанесли урон персонажу игрока
      const positionedCharacter = this.gameState.playerTeamPositioned
        .find((value) => value === enemy);
      if (positionedCharacter) {
        positionedCharacter.character.health -= damage;
        if (positionedCharacter.character.health <= 0) {
          this.gameState.playerTeamPositioned
            .splice(this.gameState.playerTeamPositioned.indexOf(positionedCharacter), 1);
        }
      }
    }
    this.gamePlay.redrawPositions(this.gameState.getTeamsPositioned());
    this.clearSelection(ally);
    if (this.gameState.playerTeamPositioned.length === 0
      || this.gameState.computerTeamPositioned.length === 0) return true;
    return false;
  }

  moveAction(character, position) {
    if (computerCharactersTypes.includes(character.character.type)) {
      // перемещаем персонаж компьютера
      const positionedCharacter = this.gameState.computerTeamPositioned
        .find((value) => value.position === character.position);
      if (positionedCharacter) positionedCharacter.position = position;
    } else {
      // перемещаем персонаж игрока
      const positionedCharacter = this.gameState.playerTeamPositioned
        .find((value) => value.position === character.position);
      if (positionedCharacter) {
        this.clearSelection(character);
        positionedCharacter.position = position;
      }
    }
    this.gamePlay.redrawPositions(this.gameState.getTeamsPositioned());
  }

  computerAction() {
    const action = () => {
      const ally = this.gameState.computerTeamPositioned[getRandomInteger(0,
        this.gameState.computerTeamPositioned.length - 1)];
      this.availablePoints = getAvailablePositions(ally.character, ally.position);
      this.availablePoints[1].forEach((value, key) => {
        const randomIndex = Math.ceil(Math.random() * (key + 1));
        this.availablePoints[1][key] = this.availablePoints[1][randomIndex];
        this.availablePoints[1][randomIndex] = value;
      });
      this.personAction = this.gameState.playerTeamPositioned
        .find((value) => this.isAttackPoint(value.position));
      if (this.personAction) {
        this.attackAction(ally, this.personAction).then((result) => {
          if (result) {
            // оставляем поле заблокируемым
            GamePlay.showMessage('Игра завершена поражением игрока!!!');
            this.gameState.switchActivePlayer();
          } else {
            this.gameState.switchActivePlayer();
            this.viewStateInformation();
            this.setBlockingBoard(false);
          }
        });
      } else {
        // ищем случайно свободное поле для перемещения (не занятое ни одним персонажем)
        // и перемещаемся туда
        const condition = true;
        let iteration = 0;
        while (condition && iteration < 50) {
          const position = this.availablePoints[0][Math.floor(Math.random()
            * this.availablePoints[0].length)];
          if (!this.gameState.getTeamsPositioned().some((value) => value.position === position)) {
            this.moveAction(ally, position);
            break;
          }
          iteration += 1;
        }
        if (iteration >= 50) console.log('Компьютер в патовой ситуации передает ход');
        this.gameState.switchActivePlayer();
        this.viewStateInformation();
        this.setBlockingBoard(false);
      }
    };
    setTimeout(action, 1000);
  }

  clearSelection(character) {
    this.gamePlay.deselectCell(character.position);
    this.gameState.selectedCharacter = null;
    this.availablePoints = [[], []];
  }

  generateEnvironmentByLevel(level) {
    switch (level) {
      case firstLevel: {
        this.gamePlay.drawUi(themes.prairie);
        this.playerTeam = generateTeam([Bowman, Swordsman], firstLevel, 2);
        this.generatePositionedArrayByTeam(playerTeamId);
        this.computerTeam = generateTeam([Daemon, Undead, Vampire], firstLevel, 2);
        this.generatePositionedArrayByTeam(computerTeamId);
        break;
      }
      case secondLevel: {
        this.gamePlay.drawUi(themes.desert);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], firstLevel, 1);
        this.generatePositionedArrayByTeam(playerTeamId);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire],
          secondLevel, countPlayerCharacters);
        this.generatePositionedArrayByTeam(computerTeamId);
        break;
      }
      case thirdLevel: {
        this.gamePlay.drawUi(themes.arctic);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], secondLevel, 2);
        this.generatePositionedArrayByTeam(playerTeamId);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire],
          thirdLevel, countPlayerCharacters);
        this.generatePositionedArrayByTeam(computerTeamId);
        break;
      }
      case forthLevel: {
        this.gamePlay.drawUi(themes.mountain);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], thirdLevel, 2);
        this.generatePositionedArrayByTeam(playerTeamId);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire],
          forthLevel, countPlayerCharacters);
        this.generatePositionedArrayByTeam(computerTeamId);
        break;
      }
      default:
    }
  }

  generatePositionedArrayByTeam(teamType) {
    const set = new Set([].concat(
      this.gameState.playerTeamPositioned.map((value) => value.position),
      this.gameState.computerTeamPositioned.map((value) => value.position),
    ));

    function getRandomUniquePosition(rangeX, rangeY) {
      let position;
      const condition = true;
      while (condition) {
        position = coordsToPosition(getRandomInteger(...rangeX), getRandomInteger(...rangeY));
        if (!set.has(position)) {
          set.add(position);
          break;
        }
      }
      return position;
    }

    switch (teamType) {
      case playerTeamId: {
        const extendData = this.playerTeam.toArray()
          .map((value) => new PositionedCharacter(value, getRandomUniquePosition([0, 1], [0, 7])));
        this.gameState.playerTeamPositioned.push(...extendData);
        break;
      }
      case computerTeamId: {
        const extendData = this.computerTeam.toArray()
          .map((value) => new PositionedCharacter(value, getRandomUniquePosition([6, 7], [0, 7])));
        this.gameState.computerTeamPositioned.push(...extendData);
        break;
      }
      default:
    }
  }

  setBlockingBoard(status) {
    if (status) {
      this.gamePlay.removeCellEnterListener();
      this.gamePlay.removeCellLeaveListener();
      this.gamePlay.removeCellClickListener();
    } else {
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    }
  }

  getBoardByLevel(level) {
    switch (level) {
      case firstLevel: {
        this.gamePlay.drawUi(themes.prairie);
        break;
      }
      case secondLevel: {
        this.gamePlay.drawUi(themes.desert);
        break;
      }
      case thirdLevel: {
        this.gamePlay.drawUi(themes.arctic);
        break;
      }
      case forthLevel: {
        this.gamePlay.drawUi(themes.mountain);
        break;
      }
      default:
    }
  }

  saveGameState(isSaveUser = false) {
    this.stateService.save({
      level: this.gameState.level,
      points: this.gameState.points,
      playerTeamPositioned: this.gameState.playerTeamPositioned,
      computerTeamPositioned: this.gameState.computerTeamPositioned,
      activePlayer: this.gameState.activePlayer,
    }, isSaveUser);
  }

  loadGameState(isLoadUser = false) {
    try {
      const data = this.stateService.load(isLoadUser);
      if (data) {
        this.gameState.from(data);
        if (this.gameState.level === forthLevel
          && this.gameState.computerTeamPositioned.length === 0) {
          GamePlay.showMessage('Начните новую игру');
          this.getBoardByLevel(firstLevel);
        } else {
          this.getBoardByLevel(this.gameState.level);
          this.gamePlay.redrawPositions(this.gameState.getTeamsPositioned());
          if (this.gameState.activePlayer === computerId) {
            this.setBlockingBoard(true);
            this.computerAction();
          }
        }
        this.viewStateInformation();
      } else if (isLoadUser) GamePlay.showError('Не удалось загрузить игру');
      else throw new Error('Не удалось восстановить игру');
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  viewStateInformation() {
    this.gamePlay.setLevelInfo(this.gameState.level);
    this.gamePlay.setUserPointsInfo(this.gameState.points);
    this.gamePlay.setPlayerInfo(this.gameState.activePlayer === playerId ? 'Игрок' : 'Компьютер');
  }
}
