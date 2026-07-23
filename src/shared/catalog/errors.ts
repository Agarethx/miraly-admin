/**
 * Typed catalog errors shared by every product module. Use cases and the error
 * mapper branch on class, not on string matching. `CatalogError` is the base.
 */
export abstract class CatalogError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class CatalogNotFoundError extends CatalogError {
  readonly code = 'CATALOG_NOT_FOUND';
  constructor(id: string, label = 'el registro') {
    super(`No se encontró ${label} solicitado (${id}).`);
  }
}

export class CatalogForbiddenError extends CatalogError {
  readonly code = 'CATALOG_FORBIDDEN';
  constructor(label = 'el catálogo') {
    super(`No tienes permisos para modificar ${label}.`);
  }
}

export class CatalogValidationError extends CatalogError {
  readonly code = 'CATALOG_VALIDATION';
  constructor(message: string) {
    super(message);
  }
}

export class CatalogRepositoryError extends CatalogError {
  readonly code = 'CATALOG_REPOSITORY';
  constructor(message: string) {
    super(message);
  }
}
