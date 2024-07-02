import net from "net";
import { Packet, PacketStreamer } from "../packet.js";
import {
  CommonPackets,
  DisconnectionReasons,
  PROTOCOL_VERSION,
  SocketStates,
} from "../common.js";

import { EventEmitter } from "events";
import { delay } from "../utils.js";

class Client extends EventEmitter {
  address = "127.0.0.1";
  port = 25512;

  state = SocketStates.notconnected;

  meta = {
    version: "1.0.0",
  };

  cookies = {};

  constructor({
    address = "127.0.0.1",
    port = 25512,
    version = "1.0.0",
    cookies = {},
  } = {}) {
    super();

    this.address = address;
    this.port = port;

    this.meta.version = version;

    this.cookies = cookies;

    this.inbox = new PacketStreamer();
    this.inbox.listen((pkt) => this.#packetProcess(pkt));

    this.socket = new net.Socket();

    this.socket.on("data", (data) => {
      this.inbox.add(data);
    });

    this.socket.on("connect", async () => {
      this.emit("connect");

      // Handshake phase

      const handshakePacket = Packet.create(CommonPackets.Handshake);
      handshakePacket.writeInt(PROTOCOL_VERSION); // Example protocol version
      handshakePacket.writeString(this.meta.version); // Example version string
      handshakePacket.writeString(this.address + ":" + this.port); // Server address
      handshakePacket.writeInt(1); // Next state ( login )
      this.send(handshakePacket);

      //const encres = await this.ac

      await delay(100);

      // Login phase

      this.state = SocketStates.login;

      const loginPacket = Packet.create(CommonPackets.Login);
      if (this.loginPacket instanceof Packet) {
        loginPacket.concat(this.loginPacket);
        delete this.loginPacket;
      }

      this.send(loginPacket);
    });

    this.socket.on("close", () => {
      this.emit(
        "disconnect",
        this.willDisconnectPacket
          ? this.willDisconnectPacket.readInt()
          : DisconnectionReasons.Unknown
      );
    });

    this.socket.on("error", (err) => {
      this.emit("disconnect", DisconnectionReasons.NetError, err);
    });
  }

  #packetProcess(packet) {
    switch (packet.id) {
      case CommonPackets.LoginSuccess:
        if (this.state != SocketStates.login) return;
        this.state = SocketStates.ready;
        this.emit("logon", packet);
        break;

      case CommonPackets.CookieSet:
        this.cookies[packet.readString()] = packet.readString();
        break;
      case CommonPackets.CookieGet:
        this.send(
          Packet.create(CommonPackets.CookieReturn).writeString(
            this.cookies[packet.readString()] || ""
          )
        );
        break;
      case CommonPackets.Disconnect:
        this.willDisconnectPacket = packet;
        break;
      default:
        if (this.state != SocketStates.ready) return;
        this.emit(packet.id, packet);
    }
  }

  connect(loginPacket = undefined) {
    // loginPacket can be unneeded as it can be
    // majorly replaced by cookies

    return new Promise((resolve, reject) => {
      if (this.state !== SocketStates.notconnected) return;
      this.state = SocketStates.handshake;
      this.loginPacket = loginPacket; // temporary login packet
      this.socket.connect(this.port, this.address);

      this.on("logon", (packet) => {
        resolve(packet);
      });

      this.on("disconnect", (reasonint) => {
        reject(reasonint);
      });
    });
  }

  send(packet) {
    if (!(packet instanceof Packet)) return;
    this.socket.write(Buffer.from(packet.getData()));
  }
}

export { Client };
