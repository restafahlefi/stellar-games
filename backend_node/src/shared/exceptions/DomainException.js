// Custom Domain Exceptions

class DomainException extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainException';
  }
}

class EntityNotFoundException extends DomainException {
  constructor(entityName, id) {
    super(`${entityName} with id ${id} not found`);
    this.name = 'EntityNotFoundException';
    this.statusCode = 404;
  }
}

class ValidationException extends DomainException {
  constructor(message) {
    super(message);
    this.name = 'ValidationException';
    this.statusCode = 400;
  }
}

class DuplicateEntityException extends DomainException {
  constructor(entityName, field, value) {
    super(`${entityName} with ${field} '${value}' already exists`);
    this.name = 'DuplicateEntityException';
    this.statusCode = 409;
  }
}

module.exports = {
  DomainException,
  EntityNotFoundException,
  ValidationException,
  DuplicateEntityException
};
