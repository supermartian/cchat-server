## cchat protocol specification

### Note

All data transmission is in websocket binary mode.

### Specification
#### Ver 0.1
##### What's in this version

Provide basic chatroom functionalities. Encryption is not introduced.

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
- 0xbeef: Unknown error.
