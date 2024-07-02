class BufferData {
  data = [];
  #_readingPosition = [0]; // Position wrapped in an array to mimic passing by reference

  get bufferLength() {
    return this.data.length;
  }

  constructor(data, initialReadingPosition = 0) {
    if (Array.isArray(data)) {
      this.data = data;
    }

    if (typeof initialReadingPosition == "number") {
      this.#_readingPosition = [initialReadingPosition];
    }
  }

  concat(other = []) {
    if (other instanceof BufferData) {
      other = other.data;
    }

    this.data.push(...other);
    return this;
  }

  seek(position) {
    this.#_readingPosition[0] = position;
    return this;
  }

  moveCursor(position) {
    this.#_readingPosition[0] = this.#_readingPosition[0] + position;
    return this;
  }

  // Write methods
  write(value) {
    ByteUtils.write(value, this.data);
    return this;
  }

  writeInt(value) {
    ByteUtils.writeInt(value, this.data);
    return this;
  }

  writeLong(value) {
    ByteUtils.writeLong(value, this.data);
    return this;
  }

  writeString(value) {
    ByteUtils.writeString(value, this.data);
    return this;
  }

  writeShort(value) {
    ByteUtils.writeShort(value, this.data);
    return this;
  }

  writeFloat(value) {
    ByteUtils.writeFloat(value, this.data);
    return this;
  }

  writeDouble(value) {
    ByteUtils.writeDouble(value, this.data);
    return this;
  }

  writeBoolean(value) {
    ByteUtils.writeBoolean(value, this.data);
    return this;
  }

  // Read methods

  /**
   * Pattern reader
   * Pattern is like s,l,i
   * and returns an array
   *
   * s: string
   * l: long
   * i: int
   * b: boolean
   * d: data/bytes
   * h: short
   * f: float
   * x: double
   */
  extract(pattern = "sss") {
    if (typeof pattern !== "string") return [];
    pattern = pattern.toLowerCase().split("");

    let result = [];

    for (const x of pattern) {
      switch (x) {
        case "s":
          result.push(this.readString());
          break;
        case "l":
          result.push(this.readLong());
          break;
        case "i":
          result.push(this.readInt());
          break;
        case "b":
          result.push(this.readBoolean());
          break;
        case "d":
          result.push(this.readBytes());
          break;
        case "h":
          result.push(this.readShort());
          break;
        case "f":
          result.push(this.readFloat());
          break;
        case "x":
          result.push(this.readDouble());
          break;
        default:
          break;
      }
    }

    return result;
  }

  readInt() {
    return ByteUtils.readInt(this.data, this.#_readingPosition);
  }

  readLong() {
    return ByteUtils.readLong(this.data, this.#_readingPosition);
  }

  readBytesByLength(length = 1) {
    return ByteUtils.readBytesByLength(
      this.data,
      length,
      this._readingPosition
    );
  }

  readRestBytes() {
    return ByteUtils.readRestBytes(this.data, this.#_readingPosition);
  }

  readBytes() {
    return ByteUtils.readBytes(this.data, this.#_readingPosition);
  }

  readString() {
    return ByteUtils.readString(this.data, this.#_readingPosition);
  }

  readShort() {
    return ByteUtils.readShort(this.data, this.#_readingPosition);
  }

  readFloat() {
    return ByteUtils.readFloat(this.data, this.#_readingPosition);
  }

  readDouble() {
    return ByteUtils.readDouble(this.data, this.#_readingPosition);
  }

  readBoolean() {
    return ByteUtils.readBoolean(this.data, this.#_readingPosition);
  }
}

class ByteUtils {
  static write(value, buffer) {
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        ByteUtils.writeInt(value, buffer);
      } else {
        ByteUtils.writeDouble(value, buffer);
      }
    } else if (typeof value === "string") {
      ByteUtils.writeString(value, buffer);
    } else if (typeof value === "boolean") {
      ByteUtils.writeBoolean(value, buffer);
    }
  }

  static writeInt(value, buffer) {
    do {
      let temp = value & 0b01111111;
      value >>= 7;
      if (value !== 0) temp |= 0b10000000;
      buffer.push(temp);
    } while (value !== 0);
  }

  static writeLong(value, buffer) {
    do {
      let temp = value & 0b01111111;
      value >>= 7;
      if (value !== 0) temp |= 0b10000000;
      buffer.push(temp);
    } while (value !== 0);
  }

  static writeString(value, buffer) {
    let stringBytes = ByteUtils.toUTF8Array(value);
    ByteUtils.writeInt(stringBytes.length, buffer);
    buffer.push(...stringBytes);
  }

  static writeShort(value, buffer) {
    buffer.push((value >> 8) & 0xff);
    buffer.push(value & 0xff);
  }

  static writeFloat(value, buffer) {
    let bytes = new Uint8Array(Float32Array.from([value]).buffer);
    buffer.push(...bytes);
  }

  static writeDouble(value, buffer) {
    let bytes = new Uint8Array(Float64Array.from([value]).buffer);
    buffer.push(...bytes);
  }

  static writeBoolean(value, buffer) {
    buffer.push(value ? 1 : 0);
  }

  static readInt(buffer, position) {
    let result = 0;
    let shift = 0;
    let b;
    do {
      b = buffer[position[0]++];
      result |= (b & 0x7f) << shift;
      shift += 7;
    } while (b & 0x80);
    return result;
  }

  static readLong(buffer, position) {
    let result = 0;
    let shift = 0;
    let b;
    do {
      b = buffer[position[0]++];
      result |= (b & 0x7f) << shift;
      shift += 7;
    } while (b & 0x80);
    return result;
  }

  static readBytesByLength(buffer, length, position) {
    let bytes;
    if (length != -1) bytes = buffer.slice(position[0], position[0] + length);
    else bytes = buffer.slice(position[0]);
    position[0] += length;
    return bytes;
  }

  static readRestBytes(buffer, position) {
    return ByteUtils.readBytesByLength(buffer, -1, position);
  }

  static readBytes(buffer, position) {
    let length = ByteUtils.readInt(buffer, position);
    return ByteUtils.readBytesByLength(buffer, length, position);
  }

  static readString(buffer, position) {
    return ByteUtils.fromUTF8Array(ByteUtils.readBytes(buffer, position));
  }

  static readShort(buffer, position) {
    let value = (buffer[position[0]++] << 8) | buffer[position[0]++];
    return value;
  }

  static readFloat(buffer, position) {
    let bytes = ByteUtils.readBytesByLength(buffer, 4, position);
    let value = new Float32Array(new Uint8Array(bytes).buffer)[0];
    position[0] += 4;
    return value;
  }

  static readDouble(buffer, position) {
    let bytes = ByteUtils.readBytesByLength(buffer, 8, position);
    let value = new Float64Array(new Uint8Array(bytes).buffer)[0];
    position[0] += 8;
    return value;
  }

  static readBoolean(buffer, position) {
    let value = buffer[position[0]++] !== 0;
    return value;
  }

  static toUTF8Array(str) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(
          0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f)
        );
      } else {
        i++;
        charcode =
          0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(
          0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f)
        );
      }
    }
    return utf8;
  }

  static fromUTF8Array(utf8) {
    let str = "";
    let i = 0;
    while (i < utf8.length) {
      let byte1 = utf8[i++];
      if (byte1 < 0x80) {
        str += String.fromCharCode(byte1);
      } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
        let byte2 = utf8[i++];
        str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
      } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
        let byte2 = utf8[i++];
        let byte3 = utf8[i++];
        str += String.fromCharCode(
          ((byte1 & 0xf) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
        );
      } else {
        let byte2 = utf8[i++];
        let byte3 = utf8[i++];
        let byte4 = utf8[i++];
        let codepoint =
          ((byte1 & 0x7) << 18) |
          ((byte2 & 0x3f) << 12) |
          ((byte3 & 0x3f) << 6) |
          ((byte4 & 0x3f) - 0x10000);
        str += String.fromCharCode(
          (codepoint >> 10) + 0xd800,
          (codepoint & 0x3ff) + 0xdc00
        );
      }
    }
    return str;
  }

  static getVarIntSize(value) {
    let size = 0;
    do {
      size++;
      value >>= 7;
    } while (value !== 0);
    return size;
  }
}

export { ByteUtils, BufferData };
