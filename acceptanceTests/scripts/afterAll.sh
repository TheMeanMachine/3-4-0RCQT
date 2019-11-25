#!/usr/bin/env bash

set -e
echo afterAll
#Delete the databases that were used for the acceptance testing.
FILE=gameReview.db
if test -f "$FILE"; then
    rm -rf website.db
fi
#Restore the databases from before the acceptance tests were run, and delete the backups.
FILE=gameReviewBackup.db
if test -f "$FILE"; then
    cp gameReviewBackup.db gameReview.db
    rm -rf gameReviewBackup.db
fi


