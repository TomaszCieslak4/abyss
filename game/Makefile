
# files=./src/main.cpp ./src/game.cpp ./src/sat.cpp

# files=$(shell find . -name "*.cpp")
files=./src/sat.cpp ./src/game.cpp ./src/utils.cpp ./src/main.cpp ./src/prefabs.cpp ./src/scene.cpp

CFLAGS= 


# all:
# 	emcc --bind $(files) -o ./client/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
# 	emcc -D SERVER --bind $(files) -o ./server/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html

# build:
# 	emcc -O3 --bind $(files) -o ./client/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
# 	emcc -O3 -D SERVER --bind $(files) -o ./server/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html

Ofiles= ./src/sat.o ./src/game.o ./src/utils.o ./src/main.o ./src/prefabs.o

server: $(Ofiles)
	emcc --bind -D SERVER ${CFLAGS} -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html -s WASM=1 -o ./server/index.html ./src/main.cpp

client: $(Ofiles)
	emcc --bind ${CFLAGS} -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html -s WASM=1 -o ./client/index.html $^

%.o: %.cpp
	emcc --bind -D SERVER ${CFLAGS} -c $< -o $@

clean:
	rm -f ./src/*.o 
