export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state, isUserSave) {
    if (isUserSave) this.storage.setItem('userState', JSON.stringify(state));
    else this.storage.setItem('state', JSON.stringify(state));
  }

  load(isUserLoad) {
    try {
      if (isUserLoad) return JSON.parse(this.storage.getItem('userState'));
      return JSON.parse(this.storage.getItem('state'));
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}
