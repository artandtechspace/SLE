#!/bin/bash

# Moves to the working dir
cd $(dirname "${BASH_SOURCE[0]}") &&
cd .. &&

electron build/electron/setup/