## cchat protocol specification

### Specification
#### Ver 1.0
##### What's in this version

Provide Key Exchange and basic message functionalities. Key exchange is defined.
Use JSON as default message format.

##### Types of messages:

###### Join

Direction: C->S

Definition: Anytime a client wants to join a chatroom, a join message is sent.
The message declares the client's identity and the chatroom it supposes to join.

    {
        ver:1,
        type:join,
        clientid:(SHA-1, in hex ASCII),
        chatroom:(SHA-1, in hex ASCII)
    }

###### Key neogotiation

    {
        ver: 1,
        type: keyxchg_1,
        roundleft: (REMAINING ROUNDS),
        changesecret: {true | false},
        keyintrmdt: (KEY INTERMEDIATE, in hex ASCII),
        prime: (P, in hex ASCII)
    }

Direction: S->C
Definition: Anytime the server wants to re-neogotiate the key, this mesage is sent.
When the client receives this message, it must perform (intermediate)^(secret) mod P. If
rounds left isn't 0, the client must return the result to the server. However, when this
field is 0, it means that the result of the computation can be used for key now.

When this message comes to the client, it always indicates that current key is invalid. Clients
should stop sending message in this situation.

If changesecret is set to be true, the client then MUST change its secret to a different one, then use the new secret to compute the intermediate.

    {
        ver: 1,
        type: keyxchg_2,
        roundleft: (REMAINING ROUNDS),
        keyintrmdt: (KEY INTERMEDIATE, in hex ASCII)
    }

Direction: C->S
Definition: When the client finished the computation of modular operation, this message
is sent to server. When Rounds left is 0, the client MUST leave Key Intermediate blank.

###### Leave 

Direction: C->S

Definition: Anytime a client wants to leave a chatroom, a leave message is sent.

    {
        ver: 1,
        type: leave
    }

###### Message

Direction: C->S S->C

Definition：The client sends a chat message to the server, or the server sends the chat message to a client.
The message field is encoded in base 64.

C->S:

    {
        ver: 1,
        type: message_0,
        content: (STRING)
    }

S->C:

    {
        ver: 1,
        type: message_1,
        content: (STRING)
    }

###### Error 

Direction: S->C

Definition: Anytime an error or an indication occurs, the client will receive an error message.

    {
        ver: 1,
        type: error,
        errcode: (ERROR CODE, in HEX ASCII),
        errdetail: (ERROR DETAIL)
    }

Error codes:

- 0x0: No error.
- 0x4: Duplicate client id, the client must change an id or it cannot join the chatroom.
- 0x5: Not in the chatroom yet.
- 0x6: You are kicked from the chatroom.
- 0x6: You are kicked from the server due to no join after connection.
- 0x8: Wrong message type.
- 0x10: Key neogotition is not finished, no futher message is allowed to be sent.
- 0xbeef: Unknown error.
