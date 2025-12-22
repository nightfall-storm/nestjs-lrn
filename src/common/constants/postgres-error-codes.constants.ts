/**
 * PostgreSQL Error Codes
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const POSTGRES_ERROR_CODES = {
  // Class 23 — Integrity Constraint Violation
  UNIQUE_VIOLATION: "23505", // unique_violation
  NOT_NULL_VIOLATION: "23502", // not_null_violation
  FOREIGN_KEY_VIOLATION: "23503", // foreign_key_violation
  CHECK_VIOLATION: "23514", // check_violation
  EXCLUSION_VIOLATION: "23P01", // exclusion_violation

  // Class 22 — Data Exception
  STRING_DATA_RIGHT_TRUNCATION: "22001", // string_data_right_truncation
  NUMERIC_VALUE_OUT_OF_RANGE: "22003", // numeric_value_out_of_range
  INVALID_DATETIME_FORMAT: "22007", // invalid_datetime_format
  INVALID_TIME_ZONE_DISPLACEMENT_VALUE: "22009", // invalid_time_zone_displacement_value

  // Class 08 — Connection Exception
  CONNECTION_FAILURE: "08006", // connection_failure
  CONNECTION_DOES_NOT_EXIST: "08003", // connection_does_not_exist

  // Class 40 — Transaction Rollback
  SERIALIZATION_FAILURE: "40001", // serialization_failure
  DEADLOCK_DETECTED: "40P01", // deadlock_detected

  // Class 42 — Syntax Error or Access Rule Violation
  UNDEFINED_TABLE: "42P01", // undefined_table
  UNDEFINED_COLUMN: "42703", // undefined_column
  UNDEFINED_FUNCTION: "42883", // undefined_function

  // Class 53 — Insufficient Resources
  TOO_MANY_CONNECTIONS: "53300", // too_many_connections
} as const;

/**
 * Error messages mapped to PostgreSQL error codes
 */
export const POSTGRES_ERROR_MESSAGES: Record<string, string> = {
  [POSTGRES_ERROR_CODES.UNIQUE_VIOLATION]:
    "A record with this value already exists",
  [POSTGRES_ERROR_CODES.NOT_NULL_VIOLATION]: "A required field cannot be null",
  [POSTGRES_ERROR_CODES.FOREIGN_KEY_VIOLATION]:
    "Referenced record does not exist",
  [POSTGRES_ERROR_CODES.CHECK_VIOLATION]: "Check constraint violation",
  [POSTGRES_ERROR_CODES.EXCLUSION_VIOLATION]: "Exclusion constraint violation",
  [POSTGRES_ERROR_CODES.STRING_DATA_RIGHT_TRUNCATION]: "String data too long",
  [POSTGRES_ERROR_CODES.NUMERIC_VALUE_OUT_OF_RANGE]:
    "Numeric value out of range",
  [POSTGRES_ERROR_CODES.INVALID_DATETIME_FORMAT]: "Invalid date or time format",
  [POSTGRES_ERROR_CODES.INVALID_TIME_ZONE_DISPLACEMENT_VALUE]:
    "Invalid time zone",
  [POSTGRES_ERROR_CODES.CONNECTION_FAILURE]: "Database connection failed",
  [POSTGRES_ERROR_CODES.CONNECTION_DOES_NOT_EXIST]:
    "Database connection does not exist",
  [POSTGRES_ERROR_CODES.SERIALIZATION_FAILURE]:
    "Transaction serialization failure",
  [POSTGRES_ERROR_CODES.DEADLOCK_DETECTED]: "Deadlock detected",
  [POSTGRES_ERROR_CODES.UNDEFINED_TABLE]: "Table does not exist",
  [POSTGRES_ERROR_CODES.UNDEFINED_COLUMN]: "Column does not exist",
  [POSTGRES_ERROR_CODES.UNDEFINED_FUNCTION]: "Function does not exist",
  [POSTGRES_ERROR_CODES.TOO_MANY_CONNECTIONS]: "Too many database connections",
};
