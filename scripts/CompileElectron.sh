#!/bin/bash

# Moves to the working dir
cd $(dirname "${BASH_SOURCE[0]}") &&
cd .. &&

# Deletes any previously compiled code
rm -rf build/electron/ &&

# Compiles the typescript of the project
tsc --outDir build/electron/application &&

# Compiles the scss of the project
node-sass --include-path scss src/styles/Main.scss build/electron/resources/main.css &&

# Copies the electron integration code
cp -r src/electron/ build/ &&
cp -r src/resources/ build/electron/