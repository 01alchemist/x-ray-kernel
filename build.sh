#!/usr/bin/env bash
emcc src/x-ray-kernel.cpp -o bin/x-ray-kernel.js -s EXPORTED_FUNCTIONS="['_newScene']" -s TOTAL_MEMORY=167772160 -s USE_PTHREADS=0 -s SIMD=0
#emcc src/x-ray-kernel.cpp -o bin/x-ray-kernel.js -s EXPORTED_FUNCTIONS="['_newScene']" -s TOTAL_MEMORY=167772160 -s USE_PTHREADS=1 -s SIMD=1
#emcc -O2 src/x-ray-kernel.cpp -o bin/x-ray-kernel.js -s EXPORTED_FUNCTIONS="['_newScene']" -s TOTAL_MEMORY=167772160 -s USE_PTHREADS=1 -s SIMD=1