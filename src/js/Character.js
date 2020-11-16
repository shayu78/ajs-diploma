export default class Character {
  constructor(level, type = 'generic', name = '') {
    if (new.target.name === 'Character') {
      throw new Error('Запрещено создавать объекты класса Character');
    }
    this.name = name;
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 100;
    this.type = type;
  }

  setValues(attack, defence, health) {
    this.attack = attack;
    this.defence = defence;
    this.health = health;
  }

  levelUp() {
    if (this.health > 0) {
      this.level += 1;
      this.attack = Math.floor(Math.max(this.attack, this.attack * ((80 + this.health) / 100)));
      this.defence = Math.floor(Math.max(this.defence, this.defence * ((80 + this.health) / 100)));
      this.health = (this.health + 80 > 100) ? 100 : this.health + 80;
    } else throw new Error('Нельзя повысить уровень умершего');
  }
}
