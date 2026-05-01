// Game Entity - Representasi game dalam domain
// Entity memiliki identitas unik dan lifecycle

class Game {
  constructor({
    id,
    name,
    description,
    icon,
    category,
    color,
    difficulty,
    maxPlayers,
    guide,
    isActive = true,
    metadata = {}
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.category = category;
    this.color = color;
    this.difficulty = difficulty;
    this.maxPlayers = maxPlayers;
    this.guide = guide;
    this.isActive = isActive;
    this.metadata = metadata;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Business logic methods
  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateMetadata(newMetadata) {
    this.metadata = { ...this.metadata, ...newMetadata };
    this.updatedAt = new Date();
  }

  canBePlayedBy(playerCount) {
    return playerCount <= this.maxPlayers;
  }

  // Validation
  validate() {
    if (!this.id || !this.name) {
      throw new Error('Game must have id and name');
    }
    if (this.maxPlayers < 1) {
      throw new Error('Game must support at least 1 player');
    }
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      category: this.category,
      color: this.color,
      difficulty: this.difficulty,
      maxPlayers: this.maxPlayers,
      guide: this.guide,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Game;
