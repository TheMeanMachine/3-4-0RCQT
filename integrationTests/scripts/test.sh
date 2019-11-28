#!/usr/bin/env bash

echo integrationTests running

# [ ! -d "node_modules" ] && echo "INSTALLING MODULES" && npm install
node_modules/.bin/jest --runInBand --detectOpenHandles integrationTests/*

