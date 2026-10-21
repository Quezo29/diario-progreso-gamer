/**
 * apiError.ts
 * -----------
 * Errores de negocio esperados (404 de una ficha que no existe, 400 de
 * una regla propia). El errorHandler los distingue de los de Mongoose
 * y de los fallos inesperados.
 */

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
