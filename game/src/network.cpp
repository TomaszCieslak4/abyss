#ifndef NETWORK_H
#define NETWORK_H

#include <vector>

constexpr int PORT = 8001;

enum NetworkOp
{
    create,
    destroy,
    modify,
    setUser
};

extern std::vector<uint8_t> tempBuffer;
extern std::vector<uint8_t> inBuffer;
extern std::vector<uint8_t> outBuffer;

template <class T>
void bufferInsert(std::vector<uint8_t> &buffer, T data)
{
    for (int i = 0; i < sizeof(T); i++) buffer.push_back(reinterpret_cast<uint8_t *>(&data)[i]);
}

void sendBuffer(std::vector<uint8_t> &buffer)
{
#ifdef SERVER
    if (buffer.size() <= 8) return;

    EM_ASM({
        let user = new Uint32Array(Module.HEAPU8.buffer, $0, 8);

        for (let client of Module.socket.clients)
        {
            if (client.entityIndex == user[1] && client.entityVersion == user[0])
            {
                client.send(new Uint8Array(Module.HEAPU8.buffer, $0 + 8, $1 - 8));
            }
        }
    },
           buffer.data(), buffer.size());
#endif

#ifndef SERVER
    if (buffer.size() == 0) return;

    EM_ASM({
        Module.socket.send(new Uint8Array(Module.HEAPU8.buffer, $0, $1));
    },
           buffer.data(), buffer.size());
#endif
}

#endif