#!/bin/bash
# relies on having variable GIT_COMMIT, BITBUCKET_BUILD_NUMBER, GIT_BRANCH in env vars
set -e

# use describe not tag, as tag looks at all tags which have the commit - ie every tagged commit after the searched one that has it in its history
# describe can fail normally when there are no tags, so we dont want the script to stop at this point
echo "getting deploy tag..."
BUILD_TAG=$(git describe --match 'build-*' --tags --exact-match $GIT_COMMIT) || true

# to avoid dangle tag after PR merged, only tag the build on stable branch
if [[ (-z ${BUILD_TAG}) && (${GIT_BRANCH} == "master") ]]; then
  echo "No build tag found for commit on stable branch, creating..."
  BUILD_TAG="build-${BITBUCKET_BUILD_NUMBER}"
  git tag ${BUILD_TAG} ${GIT_COMMIT}
  git push origin --tags
fi

echo "set deploy tag to ${TAG}"
