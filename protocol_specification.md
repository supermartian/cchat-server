## cchat protocol specification

### Note

All data transmission is in websocket binary mode.

### Specification
#### Ver 0.2
##### What's in this version

Provide Key Exchange and basic message functionalities. Encryption is still not introduced.

##### General Specification

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    |Ver= 1 |Padding| Type          |Length         | Data 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Ver: 4bits, Current protocol version. 0x1.

Padding: 4bits, 0x0.

Type: 8bits, the type of the message.

Length: 8bits, the length of the whole message. Count by 32bits (1 word).

Data: Message payload.

##### Types of messages:

###### Join

Direction: C->S

Definition: Anytime a client wants to join a chatroom, a join message is sent.
The message declares the client's identity and the chatroom it supposes to join.

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+
    |Ver= 1 |Padding| Type = 0x1    |Length         | Client's ID(SHA-1, 320bits, in hex ascii) | Chatroom's ID(SHA-1, 320bits, in hex ascii) |
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

###### Key neogotiation

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+-+
    |Ver= 1 |Padding| Type = 0x10   | NUMBER P 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-

Direction: S->C
Definition: The server sends this message to indicate the number P for modular
computation. (g^x mod p)

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+-+
    |Ver= 1 |Padding| Type = 0x11   | Rounds left | Key Intermediate  |
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-

Direction: S->C
Definition: Anytime the server wants to re-neogotiate the key, this mesage is sent.
When the client receives this message, it must perform (intermediate)^(secret) mod P. If
rounds left isn't 0, the client must return the result to the server. However, when this
field is 0, it means that the result of the computation can be used for key now.

When this message comes to the client, it always indicates that current key is invalid. Clients
should stop sending message in this situation.

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+-+
    |Ver= 1 |Padding| Type = 0x12   | Rounds left | Key Intermediate  |
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+--+-+-+-+-+-

Direction: C->S
Definition: When the client finished the computation of modular operation, this message
is sent to server. When Rounds left is 0, the client MUST leave Key Intermediate blank.

###### Leave 

Direction: C->S

Definition: Anytime a client wants to leave a chatroom, a leave message is sent.

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    |Ver= 1 |Padding| Type = 0x2    |Length         |
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

###### Message

Direction: C->S S->C

Definition：The client sends a chat message to the server, or the server sends the chat message to a client.

C->S:

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-
    |Ver= 1 |Padding| Type = 0x4    |Length         | Message content 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-

S->C:

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-
    |Ver= 1 |Padding| Type = 0x5    |Length         | Message content 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-


###### Error 

Direction: S->C

Definition: Anytime an error or an indication occurs, the client will receive an error message.

    0                   1                   2                   3   
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 ..........
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-
    |Ver= 1 |Padding| Type = 0xfe    |Length         | Error Code(16bits) 
    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-

Error codes:

- 0x0: No error.
- 0x4: Duplicate client id, the client must change an id or it cannot join the chatroom.
- 0x5: Not in the chatroom yet.
- 0x6: You are kicked from the chatroom.
- 0x6: You are kicked from the server due to no join after connection.
- 0x8: Wrong message type.
- 0x10: Key neogotition is not finished, no futher message is allowed to be sent.
- 0xbeef: Unknown error.
