#!/usr/bin/env bash

set -e
echo beforeAll

#Make backups of the databases.
FILE=gameReview.db
if test -f "$FILE"; then
    cp gameReview.db gameReviewBackup.db
    rm -rf gameReview.db
fi

