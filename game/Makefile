all:
	emcc --bind ./src/main.cpp -o ./client/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
	emcc -D SERVER --bind ./src/main.cpp -o ./server/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html

build:
	emcc -O3 --bind ./src/main.cpp -o ./client/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
	emcc -O3 -D SERVER --bind ./src/main.cpp -o ./server/index.html -s ALLOW_MEMORY_GROWTH=1 --shell-file shell.html
