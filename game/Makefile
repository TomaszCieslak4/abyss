all:
	emcc -c main.cpp -o main.o -s USE_SDL=2 -lSDL --preload-file Resources -s USE_SDL_IMAGE=2 -s ALLOW_MEMORY_GROWTH=1 --use-preload-plugins -s SDL2_IMAGE_FORMATS='["bmp","png"]' -s GL_UNSAFE_OPTS=0
	emcc main.o -o main.html -s USE_SDL=2 -lSDL --preload-file Resources -s USE_SDL_IMAGE=2 -s ALLOW_MEMORY_GROWTH=1 --use-preload-plugins -s SDL2_IMAGE_FORMATS='["bmp","png"]' -s GL_UNSAFE_OPTS=0