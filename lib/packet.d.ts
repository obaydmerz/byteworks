/**
 * @file packet.d.ts
 * @brief Packets
 */

import { BufferData, ByteUtils } from "./byteutils.js";
import { InvalidLengthError } from "./errors.js";

type AlterOptions = {
  down?: (data: number[]) => number[];
  up?: (data: number[]) => number[];
};

const alterOptions: AlterOptions;

/**
 * Class representing a PacketStreamer.
 * Manages the streaming of packets by handling chunks of data and notifying listeners when a complete packet is available.
 */
declare class PacketStreamer {
  private listeners: ((packet: Packet) => void)[];
  private #estimatedLength: number;
  private internalBuffer: BufferData;

  constructor();

  /**
   * Adds a chunk of data to the internal buffer and processes it to extract packets.
   * @param {number[]} chunk - The chunk of data to add.
   */
  add(chunk: number[]): void;

  /**
   * Registers a listener to be called when a complete packet is available.
   * @param {(packet: Packet) => void} cb - The callback function to register as a listener.
   */
  listen(cb: (packet: Packet) => void): void;
}

/**
 * Class representing a Packet.
 * Extends BufferData and provides methods to create and process packets.
 */
declare class Packet extends BufferData {
  id: number;

  constructor();

  /**
   * Gets the length of the packet.
   * @returns {number} The length of the packet.
   */
  get length(): number;

  /**
   * Creates a new Packet with the specified ID.
   * @param {number} [id=0] - The ID of the packet.
   * @returns {Packet} The created Packet instance.
   */
  static create(id?: number): Packet;

  /**
   * Creates a Packet from the given byte array.
   * @param {number[]} bytes - The byte array to create the Packet from.
   * @param {object} [options] - Options for processing the Packet.
   * @param {boolean} [options.checkLength=true] - Whether to check the length of the Packet.
   * @param {boolean} [options.checkAlterLength=true] - Whether to check the altered length of the Packet.
   * @param {AlterOptions} [options.alter=alterOptions] - Options for altering the data.
   * @returns {Packet} The created Packet instance.
   * @throws {InvalidLengthError} If the lengths do not match.
   */
  static from(
    bytes: number[],
    options?: {
      checkLength?: boolean;
      checkAlterLength?: boolean;
      alter?: AlterOptions;
    }
  ): Packet;

  /**
   * Gets the data of the Packet, optionally altering it.
   * @param {object} [options] - Options for altering the data.
   * @param {AlterOptions} [options.alter=alterOptions] - Options for altering the data.
   * @returns {number[]} The data of the Packet.
   */
  getData(options?: { alter?: AlterOptions }): number[];
}

export { Packet, PacketStreamer };
