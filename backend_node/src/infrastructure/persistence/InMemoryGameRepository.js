// Concrete implementation of Game Repository using in-memory storage

const IGameRepository = require('../../domain/games/repositories/IGameRepository');
const db = require('../../config/database');

class InMemoryGameRepository extends IGameRepository {
  constructor() {
    super();
    this.collection = 'games';
  }

  async findById(gameId) {
    return db.findById(this.collection, gameId);
  }

  async findAll() {
    return db.findAll(this.collection);
  }

  async findByCategory(category) {
    return db.query(this.collection, game => game.category === category);
  }

  async findActive() {
    return db.query(this.collection, game => game.isActive === true);
  }

  async save(game) {
    return db.create(this.collection, game.id, game.toJSON());
  }

  async update(gameId, gameData) {
    const data = gameData.toJSON ? gameData.toJSON() : gameData;
    return db.update(this.collection, gameId, data);
  }

  async delete(gameId) {
    return db.delete(this.collection, gameId);
  }

  async exists(gameId) {
    return db.findById(this.collection, gameId) !== undefined;
  }
}

module.exports = InMemoryGameRepository;
