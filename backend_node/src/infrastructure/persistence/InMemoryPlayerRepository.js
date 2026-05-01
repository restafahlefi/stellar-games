// Concrete implementation of Player Repository

const IPlayerRepository = require('../../domain/players/repositories/IPlayerRepository');
const db = require('../../config/database');

class InMemoryPlayerRepository extends IPlayerRepository {
  constructor() {
    super();
    this.collection = 'players';
  }

  async findById(playerId) {
    return db.findById(this.collection, playerId);
  }

  async findByUsername(username) {
    const players = db.query(this.collection, player => player.username === username);
    return players.length > 0 ? players[0] : null;
  }

  async findByEmail(email) {
    const players = db.query(this.collection, player => player.email === email);
    return players.length > 0 ? players[0] : null;
  }

  async findAll() {
    return db.findAll(this.collection);
  }

  async save(player) {
    return db.create(this.collection, player.id, player.toJSON());
  }

  async update(playerId, playerData) {
    const data = playerData.toJSON ? playerData.toJSON() : playerData;
    return db.update(this.collection, playerId, data);
  }

  async delete(playerId) {
    return db.delete(this.collection, playerId);
  }

  async exists(playerId) {
    return db.findById(this.collection, playerId) !== undefined;
  }
}

module.exports = InMemoryPlayerRepository;
