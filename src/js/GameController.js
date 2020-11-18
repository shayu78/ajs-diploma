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
import { playerCharactersTypes, computerCharactersTypes } from './data';
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
      this.gameState.level = 1;
      this.activePlayer = 0;
      this.generateEnvironmentByLevel(this.gameState.level);
      this.gamePlay.redrawPositions([
        ...this.gameState.playerTeamPositioned,
        ...this.gameState.computerTeamPositioned,
      ]);
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
    const characterInCell = [
      ...this.gameState.playerTeamPositioned,
      ...this.gameState.computerTeamPositioned,
    ].some((value) => {
      if (value.position === index) {
        if (playerCharactersTypes.includes(value.character.type)) {
          if (this.gameState.selectedCharacter !== null) {
            // меняем своего персонажа
            this.gamePlay.deselectCell(this.gameState.selectedCharacter.position);
          }
          this.gamePlay.selectCell(index);
          this.gameState.selectedCharacter = value;
          this.availablePoints = getAvailablePositions(this.gameState.selectedCharacter.character,
            this.gameState.selectedCharacter.position);
        } else if (this.gameState.selectedCharacter !== null) {
          if (this.availablePoints[1].includes(index)) {
            // атакуем персонаж противника
            this.setBlockingBoard(true);
            this.attackAction(this.gameState.selectedCharacter, value).then((result) => {
              if (result) {
                // уровень пройден
                this.gameState.playerTeamPositioned.forEach((player) => {
                  this.gameState.points += player.character.health;
                  player.character.levelUp();
                });
                // console.log(`total player points = ${this.gameState.points}`);
                if (this.gameState.level === 4) {
                  // оставляем поле заблокируемым
                  GamePlay.showMessage('Игра завершена победой игрока!!!');
                } else {
                  this.gameState.level += 1;
                  // формируем команды игроков
                  this.generateEnvironmentByLevel(this.gameState.level);
                  this.gamePlay.redrawPositions([
                    ...this.gameState.playerTeamPositioned,
                    ...this.gameState.computerTeamPositioned]);
                  this.setBlockingBoard(false);
                }
                this.viewStateInformation();
              } else {
                // console.log(`переход хода от ${this.gameState.activePlayer}`);
                this.gameState.switchActivePlayer();
                this.viewStateInformation();
                this.computerAction();
              }
            });
          } else GamePlay.showMessage('Противник недостижим для атаки');
        } else GamePlay.showError('Это не ваш персонаж');
        return true;
      }
      return false;
    });
    if (!characterInCell && this.gameState.selectedCharacter !== null
      && this.availablePoints[0].includes(index)) {
      // перемещаем персонаж игрока
      this.setBlockingBoard(true);
      this.moveAction(this.gameState.selectedCharacter, index);
      // console.log(`переход хода от ${this.gameState.activePlayer}`);
      this.gameState.switchActivePlayer();
      this.viewStateInformation();
      this.computerAction();
    }
  }

  onCellEnter(index) {
    const characterInCell = [
      ...this.gameState.playerTeamPositioned,
      ...this.gameState.computerTeamPositioned,
    ].some((value) => {
      if (value.position === index) {
        const tooltip = `\uD83C\uDF96${value.character.level} \u2694${value.character.attack} \uD83D\uDEE1${value.character.defence} \u2764${value.character.health}`;
        this.gamePlay.showCellTooltip(tooltip, index);
        if (playerCharactersTypes.includes(value.character.type)) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.gameState.selectedCharacter !== null
          && computerCharactersTypes.includes(value.character.type)
          && this.availablePoints[1].includes(index)) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else this.gamePlay.setCursor(cursors.notallowed);
        return true;
      }
      return false;
    });
    if (!characterInCell && this.gameState.selectedCharacter !== null) {
      if (this.gameState.selectedCharacter.position !== index
        && this.availablePoints[0].includes(index)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      } else this.gamePlay.setCursor(cursors.notallowed);
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.auto);
    if (this.gameState.selectedCharacter !== null
      && this.gameState.selectedCharacter.position !== index) this.gamePlay.deselectCell(index);
    [...this.gameState.playerTeamPositioned, ...this.gameState.computerTeamPositioned]
      .some((value) => {
        if (value.position === index) {
          this.gamePlay.hideCellTooltip(index);
          return true;
        }
        return false;
      });
  }

  async attackAction(ally, enemy) {
    const damage = Math.floor(Math.max(ally.character.attack - enemy.character.defence,
      ally.character.attack * 0.1));
    await this.gamePlay.showDamage(enemy.position, damage);
    if (computerCharactersTypes.includes(enemy.character.type)) {
      // console.log(`Нанесли урон персонажу компьютера - ${enemy.character.type}`);
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
      // console.log(`Нанесли урон персонажу игрока - ${enemy.character.type}`);
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
    this.gamePlay.redrawPositions([
      ...this.gameState.playerTeamPositioned, ...this.gameState.computerTeamPositioned]);
    this.clearSelection(ally);
    if (this.gameState.playerTeamPositioned.length === 0
      || this.gameState.computerTeamPositioned.length === 0) return true;
    return false;
  }

  moveAction(character, position) {
    if (computerCharactersTypes.includes(character.character.type)) {
      // console.log('перемещаем персонаж компьютера');
      const positionedCharacter = this.gameState.computerTeamPositioned
        .find((value) => value.position === character.position);
      if (positionedCharacter) positionedCharacter.position = position;
    } else {
      // console.log('перемещаем персонаж игрока');
      const positionedCharacter = this.gameState.playerTeamPositioned
        .find((value) => value.position === character.position);
      if (positionedCharacter) {
        this.clearSelection(character);
        positionedCharacter.position = position;
      }
    }
    this.gamePlay.redrawPositions([
      ...this.gameState.playerTeamPositioned, ...this.gameState.computerTeamPositioned]);
  }

  computerAction() {
    const action = () => {
      const ally = this.gameState.computerTeamPositioned[getRandomInteger(0,
        this.gameState.computerTeamPositioned.length - 1)];
      const availablePoints = getAvailablePositions(ally.character, ally.position);
      availablePoints[1].forEach((value, key) => {
        const randomIndex = Math.ceil(Math.random() * (key + 1));
        availablePoints[1][key] = availablePoints[1][randomIndex];
        availablePoints[1][randomIndex] = value;
      });
      const enemy = this.gameState.playerTeamPositioned
        .find((value) => availablePoints[1].includes(value.position));
      if (enemy) {
        this.attackAction(ally, enemy).then((result) => {
          if (result) {
            // оставляем поле заблокируемым
            GamePlay.showMessage('Игра завершена поражением игрока!!!');
            this.viewStateInformation();
          } else {
            // console.log(`переход хода от ${this.gameState.activePlayer}`);
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
          const position = availablePoints[0][Math.floor(Math.random()
            * availablePoints[0].length)];
          if (![...this.gameState.playerTeamPositioned, ...this.gameState.computerTeamPositioned]
            .some((value) => value.position === position)) {
            this.moveAction(ally, position);
            break;
          }
          iteration += 1;
        }
        if (iteration >= 50) console.log('Компьютер в патовой ситуации передает ход');
        // console.log(`переход хода от ${this.gameState.activePlayer}`);
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
      case 1: {
        this.gamePlay.drawUi(themes.prairie);
        this.playerTeam = generateTeam([Bowman, Swordsman], 1, 2);
        this.generatePositionedArrayByTeam(0);
        this.computerTeam = generateTeam([Daemon, Undead, Vampire], 1, 2);
        this.generatePositionedArrayByTeam(1);
        break;
      }
      case 2: {
        this.gamePlay.drawUi(themes.desert);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], 1, 1);
        this.generatePositionedArrayByTeam(0);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire], 2, countPlayerCharacters);
        this.generatePositionedArrayByTeam(1);
        break;
      }
      case 3: {
        this.gamePlay.drawUi(themes.arctic);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], 2, 2);
        this.generatePositionedArrayByTeam(0);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire], 3, countPlayerCharacters);
        this.generatePositionedArrayByTeam(1);
        break;
      }
      case 4: {
        this.gamePlay.drawUi(themes.mountain);
        this.playerTeam = generateTeam([Bowman, Swordsman, Magician], 3, 2);
        this.generatePositionedArrayByTeam(0);
        const countPlayerCharacters = this.gameState.playerTeamPositioned.length;
        this.computerTeam = generateTeam([Daemon, Undead, Vampire], 4, countPlayerCharacters);
        this.generatePositionedArrayByTeam(1);
        break;
      }
      default:
    }
  }

  generatePositionedArrayByTeam(teamType) {
    const set = new Set([
      ...this.gameState.playerTeamPositioned.map((value) => value.position),
      ...this.gameState.computerTeamPositioned.map((value) => value.position)]);

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
      // return coordsToPosition(getRandomInteger(...rangeX), getRandomInteger(...rangeY));
    }

    switch (teamType) {
      case 0: {
        const extendData = this.playerTeam.toArray()
          .map((value) => new PositionedCharacter(value, getRandomUniquePosition([0, 1], [0, 7])));
        this.gameState.playerTeamPositioned.push(...extendData);
        break;
      }
      case 1: {
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
      case 1: {
        this.gamePlay.drawUi(themes.prairie);
        break;
      }
      case 2: {
        this.gamePlay.drawUi(themes.desert);
        break;
      }
      case 3: {
        this.gamePlay.drawUi(themes.arctic);
        break;
      }
      case 4: {
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
        if (this.gameState.level === 4 && this.gameState.computerTeamPositioned.length === 0) {
          GamePlay.showMessage('Начните новую игру');
          this.getBoardByLevel(1);
        } else {
          this.getBoardByLevel(this.gameState.level);
          this.gamePlay.redrawPositions([
            ...this.gameState.playerTeamPositioned, ...this.gameState.computerTeamPositioned]);
          if (this.gameState.activePlayer === 1) {
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
    this.gamePlay.setPlayerInfo(this.gameState.activePlayer === 0 ? 'Игрок' : 'Компьютер');
  }
}
