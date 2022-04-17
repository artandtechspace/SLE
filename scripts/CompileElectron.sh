#!/bin/bash

# Moves to the working dir
cd $(dirname "${BASH_SOURCE[0]}")
cd ..

# Deletes any previously compiled code
rm -rf build/electron/

# Compiles the project
tsc --outDir build/electron/application

# Copies the electron integration code
cp -r src/electron/ build/