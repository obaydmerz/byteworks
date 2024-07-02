/**
 * @file byteutils.d.ts
 * @brief Utilities to manipulate buffers in a more convenient way.
 */

/**
 * Class representing a BufferData.
 * Provides methods to write to and read from a byte buffer.
 */
declare class BufferData {
  data: number[];
  #_readingPosition: number[];

  /**
   * Get the length of the buffer.
   * @returns {number} The length of the buffer.
   */
  get bufferLength(): number;

  /**
   * Constructs a BufferData instance.
   * @param {number[]} data - The initial data array.
   * @param {number} [initialReadingPosition=0] - The initial reading position.
   */
  constructor(data: number[], initialReadingPosition?: number);

  /**
   * Concatenates another BufferData or array to the current data.
   * @param {BufferData | number[]} other - The other BufferData or array to concatenate.
   * @returns {BufferData} The updated BufferData instance.
   */
  concat(other?: BufferData | number[]): BufferData;

  /**
   * Sets the reading position.
   * @param {number} position - The position to set.
   * @returns {BufferData} The updated BufferData instance.
   */
  seek(position: number): BufferData;

  /**
   * Moves the reading cursor by a relative position.
   * @param {number} position - The relative position to move the cursor.
   * @returns {BufferData} The updated BufferData instance.
   */
  moveCursor(position: number): BufferData;

  /**
   * Writes a value to the buffer.
   * @param {any} value - The value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  write(value: any): BufferData;

  /**
   * Writes an integer to the buffer.
   * @param {number} value - The integer value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeInt(value: number): BufferData;

  /**
   * Writes a long integer to the buffer.
   * @param {number} value - The long integer value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeLong(value: number): BufferData;

  /**
   * Writes a string to the buffer.
   * @param {string} value - The string value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeString(value: string): BufferData;

  /**
   * Writes a short integer to the buffer.
   * @param {number} value - The short integer value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeShort(value: number): BufferData;

  /**
   * Writes a float to the buffer.
   * @param {number} value - The float value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeFloat(value: number): BufferData;

  /**
   * Writes a double to the buffer.
   * @param {number} value - The double value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeDouble(value: number): BufferData;

  /**
   * Writes a boolean to the buffer.
   * @param {boolean} value - The boolean value to write.
   * @returns {BufferData} The updated BufferData instance.
   */
  writeBoolean(value: boolean): BufferData;

  /**
   * Extracts values from the buffer according to the given pattern.
   * @param {string} pattern - The pattern to extract (e.g., 'sli' for string, long, int).
   * @returns {any[]} The extracted values.
   */
  extract(pattern?: string): any[];

  /**
   * Reads an integer from the buffer.
   * @returns {number} The read integer value.
   */
  readInt(): number;

  /**
   * Reads a long integer from the buffer.
   * @returns {number} The read long integer value.
   */
  readLong(): number;

  /**
   * Reads bytes from the buffer by length.
   * @param {number} [length=1] - The number of bytes to read.
   * @returns {number[]} The read bytes.
   */
  readBytesByLength(length?: number): number[];

  /**
   * Reads the remaining bytes from the buffer.
   * @returns {number[]} The read bytes.
   */
  readRestBytes(): number[];

  /**
   * Reads bytes from the buffer.
   * @returns {number[]} The read bytes.
   */
  readBytes(): number[];

  /**
   * Reads a string from the buffer.
   * @returns {string} The read string.
   */
  readString(): string;

  /**
   * Reads a short integer from the buffer.
   * @returns {number} The read short integer.
   */
  readShort(): number;

  /**
   * Reads a float from the buffer.
   * @returns {number} The read float value.
   */
  readFloat(): number;

  /**
   * Reads a double from the buffer.
   * @returns {number} The read double value.
   */
  readDouble(): number;

  /**
   * Reads a boolean from the buffer.
   * @returns {boolean} The read boolean value.
   */
  readBoolean(): boolean;
}

/**
 * Utility class for byte operations.
 */
declare class ByteUtils {
  /**
   * Writes a value to the buffer.
   * @param {any} value - The value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static write(value: any, buffer: number[]): void;

  /**
   * Writes an integer to the buffer.
   * @param {number} value - The integer value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeInt(value: number, buffer: number[]): void;

  /**
   * Writes a long integer to the buffer.
   * @param {number} value - The long integer value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeLong(value: number, buffer: number[]): void;

  /**
   * Writes a string to the buffer.
   * @param {string} value - The string value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeString(value: string, buffer: number[]): void;

  /**
   * Writes a short integer to the buffer.
   * @param {number} value - The short integer value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeShort(value: number, buffer: number[]): void;

  /**
   * Writes a float to the buffer.
   * @param {number} value - The float value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeFloat(value: number, buffer: number[]): void;

  /**
   * Writes a double to the buffer.
   * @param {number} value - The double value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeDouble(value: number, buffer: number[]): void;

  /**
   * Writes a boolean to the buffer.
   * @param {boolean} value - The boolean value to write.
   * @param {number[]} buffer - The buffer to write to.
   */
  static writeBoolean(value: boolean, buffer: number[]): void;

  /**
   * Reads an integer from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number} The read integer value.
   */
  static readInt(buffer: number[], position: number[]): number;

  /**
   * Reads a long integer from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number} The read long integer value.
   */
  static readLong(buffer: number[], position: number[]): number;

  /**
   * Reads bytes by length from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number} length - The number of bytes to read.
   * @param {number[]} position - The current reading position.
   * @returns {number[]} The read bytes.
   */
  static readBytesByLength(
    buffer: number[],
    length: number,
    position: number[]
  ): number[];

  /**
   * Reads the remaining bytes from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number[]} The read bytes.
   */
  static readRestBytes(buffer: number[], position: number[]): number[];

  /**
   * Reads bytes from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number[]} The read bytes.
   */
  static readBytes(buffer: number[], position: number[]): number[];

  /**
   * Reads a string from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {string} The read string.
   */
  static readString(buffer: number[], position: number[]): string;

  /**
   * Reads a short integer from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number} The read short integer.
   */
  static readShort(buffer: number[], position: number[]): number;

  /**
   * Reads a float from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number} The read float.
   */
  static readFloat(buffer: number[], position: number[]): number;

  /**
   * Reads a double from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {number} The read double.
   */
  static readDouble(buffer: number[], position: number[]): number;

  /**
   * Reads a boolean from the buffer.
   * @param {number[]} buffer - The buffer to read from.
   * @param {number[]} position - The current reading position.
   * @returns {boolean} The read boolean.
   */
  static readBoolean(buffer: number[], position: number[]): boolean;

  /**
   * Converts a string to a UTF-8 array.
   * @param {string} str - The string to convert.
   * @returns {number[]} The UTF-8 array.
   */
  static toUTF8Array(str: string): number[];

  /**
   * Converts a UTF-8 array to a string.
   * @param {number[]} utf8 - The UTF-8 array to convert.
   * @returns {string} The converted string.
   */
  static fromUTF8Array(utf8: number[]): string;

  /**
   * Gets the size of a variable-length integer.
   * @param {number} value - The integer value.
   * @returns {number} The size of the variable-length integer.
   */
  static getVarIntSize(value: number): number;
}

export { ByteUtils, BufferData };
