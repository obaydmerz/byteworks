/* There is three packet modes
S-->C server to client
S<--C client to server
S<->C both
*/

/**
 * Current Packet Order
 * 
 * S<--C Handshake
 * if nextstatus is query it ends here
 * 
 * S-->C Set Encryption RSA
 * S<--C Encryption Success ( contains client rsa public key ) or Failure ( which disables )
 * 
 * S<--C Login
 */

//import { RSAEncryptor } from "./alterpacket.js";

export const CommonPackets = {
  /**
   * S<--C
   *
   * Handshake packet is used to determine if the client is able to communicate
   * through this protocol, and contains some useful informations
   *
   * LAYOUT:
   * INT: byteworks protocol version ( used to determine compatibility )
   * STRING: custom version ( server knows what to do with it )
   * STRING: used ip and port to connect to server seperated by ":" or a dns name
   * INT: Next status ( login=1 or query=2 )
   */
  Handshake: 8,
  /**
   * S-->C
   *
   * Query packet is used to return some interesting info from the server
   *
   * ! LAYOUT OVERRIDABLE !:
   * STRING: custom version
   * STRING: json or anything else
   */
  Query: 1,
  /**
   * S<--C
   *
   * Login packet is sent by the client so the server knows when to approve it
   *
   * ! LAYOUT OVERRIDABLE !
   * STRING: token
   */
  Login: 2,
  /**
   * S-->C
   *
   * Sent to inform client it was accepted
   *
   * ! LAYOUT OVERRIDABLE !:
   * STRING: client id / name
   * INT: Keep-alive minimum time in ms
   */
  LoginSuccess: 3,
  /**
   * S-->C
   *
   * Sent to inform client it will disconnect
   *
   * Layout:
   * INT: Reason
   */
  Disconnect: 4,
  /**
   * S-->C
   *
   * Sets a cookie on the client
   *
   * Layout:
   * STRING: Cookie
   * STRING: Value
   */
  CookieSet: 5,
  /**
   * S-->C
   *
   * Tells the client to return a cookie
   *
   * Layout:
   * STRING: Cookie
   */
  CookieGet: 6,
  /**
   * S<--C
   *
   * Returns a cookie
   *
   * Layout:
   * STRING: Value
   */
  CookieReturn: 7,
  /**
   * S-->C
   * 
   * Demands encryption setup and provides the client
   * with the public key of the server
   * 
   * Layout:
   * STRING: Public key
   */
  EncryptionRequest: 9,
  /**
   * S<--C
   * 
   * Confirmation
   * If public key is populated, encryption is enabled
   * 
   * If public key is empty, encryption is disabled
   * 
   * Layout:
   * STRING: Public key
   */
  EncryptionResult: 10,
};

export const DisconnectionReasons = {
  // May be overriden by the server
  NetError: -1,
  BadProtocolVersion: 1,
  BadVersion: 2,
  AckTimeout: 3,
  Unknown: 4,
  AuthFailure: 5,
  Timeout: 6, // A general timeout
  ProcedureFailure: 7,
};

export const SocketStates = {
  notconnected: -1, // generally client-side
  handshake: 0,
  login: 1,
  ready: 2,
};

export const PROTOCOL_VERSION = 1;

//export const COMMON_ALTERERS = [RSAEncryptor];

// Common Timeout types
// - First packet ( handshake ) = 1s
// - Login = 1s
