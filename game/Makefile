# all:
# 	emcc --bind -c ./engine/core/test.cpp -o main.o -s -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS='["_main", "_update", "_onMouseDown", "_onMouseMove", "_onMouseUp", "_onKeyDown", "_onKeyUp"]' -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'
# 	emcc --bind main.o -o main.html -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS='["_main", "_update", "_onMouseDown", "_onMouseMove", "_onMouseUp", "_onKeyDown", "_onKeyUp"]' -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

all:
	emcc --bind -c ./engine/core/test.cpp -o main.o -s ALLOW_MEMORY_GROWTH=1
	emcc --bind main.o -o main.html -s ALLOW_MEMORY_GROWTH=1 

source:
	emcc Source.cpp -s USE_SDL=2 -s FULL_ES2=1 -o test.html  -I /home/jumf22/glm-0.9.9.8/glm/ -O3 -s ALLOW_MEMORY_GROWTH=1 -s USE_SDL_IMAGE=2 -s USE_SDL_TTF=2 -s SDL2_IMAGE_FORMATS="['png']" -s EXPORTED_FUNCTIONS="['_main']" -std=c++11 -Werror -s WARN_ON_UNDEFINED_SYMBOLS=1  -s NO_EXIT_RUNTIME=1 -s AGGRESSIVE_VARIABLE_ELIMINATION=1