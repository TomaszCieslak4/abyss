#include <iostream>
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <stdlib.h>
#include "./engine/core/scene.cpp"
#include "./engine/core/test.cpp"

void drawRandomPixels()
{
}

int main(int argc, char *argv[])
{
    // start();

    // #ifdef __EMSCRIPTEN__
    //     // emscripten_set_main_loop(loop, 0, 1);
    // #else
    //     while (1)
    //     {
    //         drawRandomPixels();
    //     }
    // #endif
}