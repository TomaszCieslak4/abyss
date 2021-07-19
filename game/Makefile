all:
	emcc --bind ./src/main.cpp -o ./client/game.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
	emcc -D SERVER --bind ./src/main.cpp -o ./server/game.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html

build:
	emcc -O3 --bind ./src/main.cpp -o ./client/game.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
	emcc -O3 -D SERVER --bind ./src/main.cpp -o ./server/game.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
	cp ./client/game.js ../abyss/public/game.js
	cp ./client/game.wasm ../abyss/public/game.wasm
	cp ./server/game.js ../server/game.js
	cp ./server/game.wasm ../server/game.wasm