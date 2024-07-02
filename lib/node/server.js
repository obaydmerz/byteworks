import net from "net";
import { EventEmitter } from "events";
import { makeid } from "../utils.js";
import crypto from "crypto";
import { Packet, PacketStreamer } from "../packet.js";
import {
  CommonPackets,
  DisconnectionReasons,
  PROTOCOL_VERSION,
  SocketStates,
} from "../common.js";

class SocketClient {
  state = SocketStates.handshake; // common status
  id = null; // unique id
  inbox = null; // a PacketStreamer
  assignedServer = null; // a Server
  assignedSocket = null; // a net.Socket

  acknowledges = [];
  timeouts = {};

  meta = {
    version: null,
    usedip: null,

    rsa_public: null,
  };

  constructor() {
    this.inbox = new PacketStreamer();
    this.inbox.listen((pkt) => this.#packetProcess(pkt));
  }

  #packetProcess(packet) {
    switch (packet.id) {
      default:
        if (this.assignedServer.meta.logIncoming) console.log("<--", packet.id);

        // Acknowledges can access packets even before login
        for (const ack of this.acknowledges) {
          if (ack[0] == packet.id) {
            this.acknowledges.splice(this.acknowledges.indexOf(ack), 1);
            ack[1](packet);
            return;
          }
        }
        if (this.state != SocketStates.ready) return;
        this.assignedServer.emit(packet.id, packet);
    }
  }

  setCookie(name, value) {
    this.send(
      Packet.create(CommonPackets.CookieSet)
        .writeString(name)
        .writeString(value)
    );
  }

  async getCookie(name) {
    this.send(Packet.create(CommonPackets.CookieGet).writeString(name));
    return (await this.ack(CommonPackets.CookieReturn)).readString();
  }

  timeout(
    key = 1,
    duration = 1000,
    reason = DisconnectionReasons.Timeout,
    additionalCallback = null
  ) {
    // duration=0 will actually clearTimeout

    clearTimeout(this.timeouts[key]);

    if (duration > 0) {
      const original = (this.timeouts[key] = setTimeout(() => {
        if (this.timeouts[key] != original) return; // It's removed or modified

        this.disconnect(reason);
        if (typeof additionalCallback == "function") additionalCallback(reason);
      }, duration));
    } else {
      delete this.timeouts[key];
    }
  }

  ack(pid, timeout = 1000) {
    if (typeof pid != "number") return;

    return new Promise((resolve, reject) => {
      if (timeout)
        this.timeout(pid, timeout, DisconnectionReasons.AckTimeout, reject);

      this.acknowledges.push([
        pid,
        (packet) => {
          resolve(packet);
          if (timeout) this.timeout(pid, 0);
        },
      ]);
    });
  }

  // Sends a packet
  send(packet) {
    if (!(packet instanceof Packet)) return;
    if (this.assignedServer.meta.logOutcoming) console.log("-->", packet.id);
    this.assignedSocket.write(
      Buffer.from(
        packet.getData({
          /* alter: {
            up: (bytes) => {
              if (this.meta.rsa_public) {
                return [
                  ...crypto.publicEncrypt(
                    this.meta.rsa_public,
                    Buffer.from(bytes)
                  ),
                ];
              }

              return bytes;
            },
          }, */
        })
      )
    );
  }

  disconnect(reason) {
    this.assignedServer.disconnect(this, reason);
  }
}

class Server extends EventEmitter {
  net = null;
  #clients = [];

  _authHandler = null;
  _queryFunction = null;

  meta = {
    logIncoming: false,
    logOutcoming: false,

    rsa_public: null,
    rsa_private: null,
  };

  constructor({
    port = 25512,
    authHandler = async (client, packet) => true,
    queryFunction = (client) => {},
    logIncoming = false,
    logOutcoming = false,
  } = {}) {
    super();
    this.#createServer();

    this._authHandler = authHandler;
    this._queryFunction = queryFunction;

    this.meta.logIncoming = logIncoming;
    this.meta.logOutcoming = logOutcoming;

    this.net.listen(port);
  }

  #createServer() {
    this.#generateKeyPair();

    this.net = net.createServer(async (socket) => {
      const client = new SocketClient();

      client.assignedServer = this;
      client.assignedSocket = socket;
      client.id = makeid(10);

      this.#clients.push(client);

      this.emit("connect", client);

      socket.on("error", () => {});

      socket.on("close", () => {
        this.disconnect(client); // forces clean-up
      });

      socket.on("data", (data) => {
        client.inbox.add(data);
      });

      try {
        // Handshake phase
        const handshake = await client.ack(CommonPackets.Handshake, 1000);
        const [bwv, version, ip, next] = handshake.extract("issi");
        if (bwv != PROTOCOL_VERSION)
          return this.disconnect(
            client,
            DisconnectionReasons.BadProtocolVersion
          );
        client.meta.version = version;
        client.meta.usedip = ip;
        if (next == 2) {
          client.send(
            Packet.create(CommonPackets.Query).concat(this._queryFunction())
          );
          return this.disconnect(client); // close it!
        } else {
          client.state = SocketStates.login;
        }

        // Encryption configuration phase
        // TODO: to complete
        /* client.send(
          Packet.create(CommonPackets.EncryptionRequest).writeString(
            this.meta.rsa_public
          )
        );

        const encresult = await client.ack(
          CommonPackets.EncryptionResult,
          1000
        );

        client.meta.rsa_public = encresult.readString(); */

        const res = await this._authHandler(
          client,
          await client.ack(CommonPackets.Login, 1000)
        );

        if (res === true) {
          client.state = SocketStates.ready;
          client.send(
            Packet.create(CommonPackets.LoginSuccess)
              .writeString(client.id)
              .writeInt(1000)
          );
          this.emit("logon", client);
        } else {
          this.disconnect(
            client,
            typeof res === "number" ? res : DisconnectionReasons.AuthFailure
          );
        }
      } catch (error) {
        this.disconnect(client, DisconnectionReasons.ProcedureFailure);
        console.log(error);
      }
    });
  }

  disconnect(client, reason = DisconnectionReasons.Unknown) {
    if (client instanceof SocketClient && this.#clients.includes(client)) {
      client.timeouts = {}; // Clear all timeouts

      this.#clients.splice(this.#clients.indexOf(client), 1);

      if (!client.assignedSocket.closed) {
        client.send(Packet.create(CommonPackets.Disconnect).writeInt(reason));
      }

      client.assignedSocket.destroy();
    }
  }

  #generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    this.meta.rsa_public = publicKey;
    this.meta.rsa_private = privateKey;
  }
}

export { Server };
