export class ObfError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ObfError {
  constructor(
    message: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}

export class StorageError extends ObfError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause);
  }
}

export class ArchiveError extends ObfError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause);
  }
}

export class BoardError extends ObfError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause);
  }
}

export class ObzError extends ObfError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options?.cause);
  }
}
