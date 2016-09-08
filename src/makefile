
CC=g++
CFLAGS=-c -Wall
LDFLAGS=

SOURCES=x-ray-kernel.cpp
OBJECTS=$(SOURCES:.cpp=.o)
EXECUTABLE=x-ray-kernel

all: $(SOURCES) $(EXECUTABLE)

$(EXECUTABLE): $(OBJECTS)
    $(CC) $(LDFLAGS) $(OBJECTS) -o $@

.cpp.o:
    $(CC) $(CFLAGS) $< -o $@