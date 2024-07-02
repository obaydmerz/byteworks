# Byteworks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT) [![Pure Javascript](https://img.shields.io/badge/pure-javascript-yellow?style=for-the-badge&logo=javascript)](https://opensource.org/licenses/MIT)

Byteworks is a Node.js library designed for creating high-performance communication systems using a customized protocol. It provides efficient tools for handling buffers and packets, ensuring optimal performance in network communication.

## Installation

You can install Byteworks via github:

```bash
npm install obaydmerz/byteworks
```

## Usage

Here's a quick example of how to create a server and a client

```javascript
// Server
import { Server, Packet } from "byteworks";

const server = new Server({
  port: 25512,
  async authHandler(client, packet) {
    const token = await client.getCookie("loginToken");

    console.log("Client", client.id, "is trying to login using token ", token);

    // You can use packet to pass creds also
    // return packet.readString()

    return token == "12312385";
  },
});

server.on("logon", (client) => {
  const welcome = Packet.create(/*id*/ 12);
  welcome.writeString("Hello!");
  welcome.writeInt(15);
  welcome.writeBoolean(true);
  welcome.writeBoolean(false);
  welcome.writeInt(2024);
  client.send(welcome);
});
```

```javascript
// Client
import { Client } from "byteworks";

const client = new Client({
  address: "127.0.0.1",
  port: 25512,
  version: "1.0.1",
  cookies: {
    loginToken: "12312385",
  },
});

client
  .connect(/* You can send a packet here too, but it's id is ignored */)
  .catch((err) => {
    // Example of Handling Disconnection reasons
    if (err == DisconnectionReasons.BadVersion) {
      console.log("Shall i update my client?");
    } else if (err == DisconnectionReasons.AuthFailure) {
      console.log("Incorrect login token");
    }
  })
  .then((packet) => {
    console.log("Logon using id:", packet.readString());
  });

client.on(/*packet example*/ 12, (packet) => {
  // Example of extraction using string pattern
  const [ str, int, bool1, bool2, int2 ] = packet.extract("sibbi");

  // Or classically
  const foo = packet.readString();

  // BTW, if you tried them both, be sure
  // to place packet.seek(0) before readString() to reset the cursor!

  console.log(str, int2); // Hello! 2024
});
```

## Wiki and support 
For API and advanced usage, see the [Wiki](https://byteworkslib.gitbook.io/untitled/).
If you have any question post it in our [discord server](https://discord.gg/s7Rg4DHuej)

## License
This project is licensed under the MIT License. See the LICENSE file for details.
