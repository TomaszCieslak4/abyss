#include <SDL2/SDL.h>
#include <iostream>
#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif
#include <stdlib.h>
#include "./engine/util/vector.cpp"
#include <SDL2/SDL_image.h>

SDL_Window *window;
SDL_Renderer *renderer;
SDL_Surface *surface;

SDL_Surface *image;

void drawRandomPixels()
{
    Vec2 x(0, 0);

    if (SDL_MUSTLOCK(surface)) SDL_LockSurface(surface);

    Uint8 *pixels = (Uint8 *)surface->pixels;

    for (int i = 0; i < 1048576; i++)
    {
        char randomByte = rand() % 255;
        pixels[i] = randomByte;
    }

    if (SDL_MUSTLOCK(surface)) SDL_UnlockSurface(surface);

    SDL_Texture *screenTexture = SDL_CreateTextureFromSurface(renderer, surface);
    SDL_Texture *screenTexture2 = SDL_CreateTextureFromSurface(renderer, image);

    SDL_RenderClear(renderer);
    SDL_RenderCopy(renderer, screenTexture, NULL, NULL);
    // SDL_RenderCopy(renderer, screenTexture2, NULL, NULL);
    SDL_RenderPresent(renderer);

    SDL_DestroyTexture(screenTexture);
}

int main(int argc, char *argv[])
{
    SDL_Init(SDL_INIT_VIDEO);
    SDL_CreateWindowAndRenderer(512, 512, 0, &window, &renderer);
    surface = SDL_CreateRGBSurface(0, 512, 512, 32, 0, 0, 0, 0);

    std::string imagePath = "Resources/ANinja_Cow.png";
    image = IMG_Load(imagePath.c_str());

#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(drawRandomPixels, 0, 1);
#else
    while (1)
    {
        drawRandomPixels();
        SDL_Delay(16);
    }
#endif
}