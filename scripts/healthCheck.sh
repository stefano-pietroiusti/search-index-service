# relies on receiving environment variable when called
# for serverless we need to have ${$1}CRON_SETTING present in env variables
set -e
ENVIRONMENT=$1
env=${ENVIRONMENT:-dev}

echo "About to run health check tests against ${env}"

export stage=${env}
eval  "export STAGE=\${${env}}"

npm run test:health
