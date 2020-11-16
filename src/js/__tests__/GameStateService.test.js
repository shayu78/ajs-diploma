import GameStateService from '../GameStateService';

beforeEach(() => {
  jest.resetAllMocks();
});

test('Load success status from localStorage', () => {
  const state = {
    activePlayer: 0,
    playerTeamPositioned: [],
    computerTeamPositioned: [],
    points: 0,
    level: 1,
  };
  const gameStateService = new GameStateService(localStorage);
  gameStateService.save(state);
  const load = jest.fn(gameStateService.load());
  load.mockReturnValue(state);
  expect(gameStateService.load()).toEqual(load());
});

test('Load success userStatus from localStorage', () => {
  const state = {
    activePlayer: 0,
    playerTeamPositioned: [],
    computerTeamPositioned: [],
    points: 0,
    level: 1,
  };
  const gameStateService = new GameStateService(localStorage);
  gameStateService.save(state, true);
  const load = jest.fn(gameStateService.load(true));
  load.mockReturnValue(state);
  expect(gameStateService.load(true)).toEqual(load());
});

test('Load failed from localStorage', () => {
  const gameStateService = new GameStateService(null);
  expect(() => gameStateService.load()).toThrowError('Invalid state');
});
