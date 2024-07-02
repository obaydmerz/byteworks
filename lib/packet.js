import { BufferData, ByteUtils } from "./byteutils.js";
import { InvalidLengthError } from "./errors.js";

const alterOptions = {
  down: null,
  up: null,
};

// A Non altered Packet :
// Length: VarInt = ID Length + Data length
// ID: VarInt = id of packet
// Data: ByteArray ( until end, contains all data you need )

// A altered Packet :
// Length: VarInt = Length of (VarInt)(Rest Length) + Rest altered length
// Rest Length: VarInt = Rest Unaltered length
// Rest : ByteArray : Rest of data ( altered) {
//    ID: VarInt = id of packet
//    Data: ByteArray ( until end, contains all data you need )
// }

// That means length is the length of whole buffer - the length of it

class PacketStreamer {
  listeners = [];

  #estimatedLength = -1;

  constructor() {
    this.internalBuffer = new BufferData(); // Internal buffer to manage data
  }

  add(chunk) {
    this.internalBuffer.concat(chunk);

    while (true) {
      if (this.#estimatedLength == -1) {
        if (this.internalBuffer.bufferLength < 1) {
          break; // Not enough data to read length
        }

        this.internalBuffer.seek(0);
        const len = this.internalBuffer.readInt();

        if (len > 0) {
          this.#estimatedLength = len;
        } else {
          break;
        }
      }

      const totalLength =
        ByteUtils.getVarIntSize(this.#estimatedLength) + this.#estimatedLength;

      if (this.internalBuffer.bufferLength >= totalLength) {
        const packetData = this.internalBuffer.data.slice(0, totalLength);
        this.internalBuffer.data = this.internalBuffer.data.slice(totalLength); // Remove processed packet from buffer

        const packet = Packet.from(packetData);
        this.listeners.forEach((cb) => cb(packet));
        this.#estimatedLength = -1; // Reset for next packet
      } else {
        break; // Not enough data to process further
      }
    }
  }

  listen(cb) {
    if (typeof cb == "function") this.listeners.push(cb);
  }
}

class Packet extends BufferData {
  id = 0;

  constructor() {
    super();
  }

  get length() {
    return ByteUtils.getVarIntSize(this.id) + this.bufferLength;
  }

  static create(id = 0) {
    let packet = new Packet();
    packet.id = id;
    return packet;
  }

  static from(
    bytes,
    { checkLength = true, checkAlterLength = true, alter = alterOptions } = {}
  ) {
    alter = typeof alter == "object" ? alter : alterOptions;
    const alterEnabled = typeof alter.down == "function";

    let bdata = new BufferData(bytes);
    let length = bdata.readInt(); // Always length VarInt is present

    if (checkLength) {
      let allLengthExcludingLength =
        bdata.bufferLength - ByteUtils.getVarIntSize(length);

      if (allLengthExcludingLength != length) {
        throw new InvalidLengthError(
          allLengthExcludingLength,
          length,
          "checking length ( dealter " +
            (alterEnabled ? "enabled" : "disabled") +
            ")"
        );
      }
    }

    let payloadBytes = [];

    if (alterEnabled) {
      // Dealtering data is enabled
      const unalteredPayloadLength = bdata.readInt();

      payloadBytes = alter.down(bdata.readRestBytes());

      if (checkAlterLength) {
        if (payloadBytes.length != unalteredPayloadLength) {
          throw new InvalidLengthError(
            payloadBytes.length,
            unalteredPayloadLength,
            "checking length"
          );
        }
      }
    } else {
      // No hard work
      payloadBytes = bdata.readRestBytes();
    }

    let packet = new Packet();
    packet.data = payloadBytes;
    packet.id = packet.readShort();
    return packet;
  }

  getData({ alter = alterOptions } = {}) {
    alter = typeof alter == "object" ? alter : alterOptions;
    const alterEnabled = typeof alter.up == "function";

    let length = 0;

    let idPrefixedData = new BufferData();
    idPrefixedData.writeShort(this.id); // Add the packet id
    idPrefixedData.concat(this.data); // Add Data

    let data = new BufferData();

    if (alterEnabled) {
      // altering data is enabled
      const unalteredLength = idPrefixedData.bufferLength;
      let rest = alter.up(idPrefixedData.data);

      length = ByteUtils.getVarIntSize(unalteredLength) + rest.length;

      data.writeInt(length); // Length
      data.writeInt(unalteredLength); // Data length
      data.concat(rest); // Rest altered
    } else {
      length = idPrefixedData.bufferLength;

      data.writeInt(length); // Length
      data.concat(idPrefixedData); // Directly
    }

    return data.data;
  }
}

export { Packet, PacketStreamer };
