import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  POSTGRES_ERROR_CODES,
  POSTGRES_ERROR_MESSAGES,
} from "../constants/postgres-error-codes.constants";

/**
 * Extracts PostgreSQL error code from Prisma error
 */
function getPostgresErrorCode(error: unknown): string | null {
  if (error && typeof error === "object") {
    // Prisma errors have a code property
    const prismaError = error as { code?: string; meta?: { code?: string } };

    // Check Prisma error code (P2002 for unique constraint)
    if (prismaError.code === "P2002") {
      return POSTGRES_ERROR_CODES.UNIQUE_VIOLATION;
    }

    // Check for direct PostgreSQL error code in meta
    if (prismaError.meta?.code) {
      return prismaError.meta.code;
    }

    // Check for error object with code property (direct PostgreSQL errors)
    if (
      "code" in error &&
      typeof (error as { code: string }).code === "string"
    ) {
      return (error as { code: string }).code;
    }
  }

  return null;
}

/**
 * Gets user-friendly error message for PostgreSQL error code
 */
export function getPostgresErrorMessage(
  errorCode: string,
  field?: string,
): string {
  const baseMessage =
    POSTGRES_ERROR_MESSAGES[errorCode] || "Database error occurred";

  if (field) {
    return `${baseMessage}: ${field}`;
  }

  return baseMessage;
}

/**
 * Handles PostgreSQL errors and throws appropriate NestJS exceptions
 */
export function handlePostgresError(error: unknown, field?: string): never {
  const errorCode = getPostgresErrorCode(error);

  if (!errorCode) {
    // If not a PostgreSQL error, throw generic error
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    throw new InternalServerErrorException(message);
  }

  // Handle specific error codes
  switch (errorCode) {
    case POSTGRES_ERROR_CODES.UNIQUE_VIOLATION:
      throw new ConflictException(
        getPostgresErrorMessage(errorCode, field || "This record"),
      );

    case POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION:
    case POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION:
    case POSTGRES_ERROR_CODES.CHECK_VIOLATION:
      throw new BadRequestException(getPostgresErrorMessage(errorCode, field));

    case POSTGRES_ERROR_CODES.CONNECTION_FAILURE:
    case POSTGRES_ERROR_CODES.CONNECTION_DOES_NOT_EXIST:
      throw new InternalServerErrorException(
        getPostgresErrorMessage(errorCode),
      );

    default:
      throw new BadRequestException(getPostgresErrorMessage(errorCode, field));
  }
}

/**
 * Extracts field name from Prisma unique constraint error
 */
export function extractUniqueConstraintField(
  error: unknown,
): string | undefined {
  if (error && typeof error === "object") {
    const prismaError = error as { meta?: { target?: string[] } };
    if (prismaError.meta?.target && Array.isArray(prismaError.meta.target)) {
      return prismaError.meta.target[0];
    }
  }
  return undefined;
}
