export class InvalidLengthError extends Error {
  name = "InvalidLengthError";

  constructor(length, excepetedLength, action = "") {
    super(`Expected ${excepetedLength} bytes, got ${length}${action ? ", while " + action : ""}`);
  } 
}
