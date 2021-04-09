#ifndef NETWORK_H
#define NETWORK_H

enum NetworkOp
{
    create,
    destroy,
    modify,
    setUser
};

extern std::vector<uint8_t> packets;
extern int packetsSize;

#endif