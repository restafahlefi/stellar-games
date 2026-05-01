// Player Repository Interface

class IPlayerRepository {
  async findById(playerId) {
    throw new Error('Method not implemented');
  }

  async findByUsername(username) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async findAll() {
    throw new Error('Method not implemented');
  }

  async save(player) {
    throw new Error('Method not implemented');
  }

  async update(playerId, playerData) {
    throw new Error('Method not implemented');
  }

  async delete(playerId) {
    throw new Error('Method not implemented');
  }

  async exists(playerId) {
    throw new Error('Method not implemented');
  }
}

module.exports = IPlayerRepository;
