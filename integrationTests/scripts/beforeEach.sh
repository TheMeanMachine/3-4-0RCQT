#!/usr/bin/env bash

set -e
echo beforeEach
#Delete the database files.
FILE=gameReview.db
if test -f "$FILE"; then
    rm -rf gameReview.db
fi