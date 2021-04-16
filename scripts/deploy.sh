#!/bin/bash
# relies on receiving environment variable when called
set -e

ENVIRONMENT=$1

# branch and build info
export GIT_BRANCH=${BITBUCKET_BRANCH:-n/a}
export GIT_COMMIT=$(git rev-parse HEAD | cut -c1-7)

source ./scripts/tag.sh
export GIT_TAG=${BUILD_TAG:-n/a}
export SLS_DEBUG=*

# debug
echo "about to deploy for '${ENVIRONMENT}' for tag '${GIT_TAG}' on commit '${GIT_COMMIT}'"

# serverless deploy
npm run deploy -- --stage ${ENVIRONMENT} --force
