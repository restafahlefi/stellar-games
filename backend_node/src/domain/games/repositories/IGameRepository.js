// Repository Interface - Contract untuk data access
// Mengikuti Dependency Inversion Principle

class IGameRepository {
  async findById(gameId) {
    throw new Error('Method not implemented');
  }

  async findAll() {
    throw new Error('Method not implemented');
  }

  async findByCategory(category) {
    throw new Error('Method not implemented');
  }

  async findActive() {
    throw new Error('Method not implemented');
  }

  async save(game) {
    throw new Error('Method not implemented');
  }

  async update(gameId, gameData) {
    throw new Error('Method not implemented');
  }

  async delete(gameId) {
    throw new Error('Method not implemented');
  }

  async exists(gameId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IGameRepository;
