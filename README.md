# Search Index Service

<!-- Add Description -->

## Deploy indices

Add mapping as a file ./indices/stage-alias-v1.0.0.index.json
Add version history to ./indices/alias.versions.json

### Senarios

-   No index
    -   Creates new index
-   Existing index but different shard count
    -   Creates new index and merge indices
-   Existing index and same shard count
    -   Updates index mapping

#### Run deploy script

```bash
export stage_ES_Deployment_ClientCloudId=stage_ES_Deployment_ClientCloudId
export stage_ES_Deployment_Username=stage_ES_Deployment_Username
export stage_ES_Deployment_Password=stage_ES_Deployment_Password

./scripts/deploy-index.sh stage alias version
```

## API Documentation

[swagger](https://bitbucket.org/accordogroup/search-index-service/src/master/docs/swagger.yml?at=master&fileviewer=file-view-default)

## Error Codes Reference

[master source](https://bitbucket.org/accordogroup/search-index-service/src/master/src/exceptions/errorCodes.js?at=master&fileviewer=file-view-default)

## Get Started

-   npm 8.11.1 is expected.

```
npm i
npm run lint
npm t
```

## Build & Deploy

Bitbucket Pipeline definitions [./bitbucket-pipelines.yml](bitbucket-pipelines.yml)

**Deploy to all environments**

-   Triggered when pull request is merged to `master` branch
-   Manual trigger required when deploying to UAT and Prod

**Deploy feature branch to dev environment**

-   Go to Bitbucket Branches page
-   Click the "..." on the right side of the feature branch you want to deploy
-   Select "Run pipeline for branch"
-   Select custom: `deploy-to-dev`

## Run Test

`npm test` run unit, integration and component test  
`npm run test:unit` run unit test  
`npm run test:integration` run integration test  
`npm run test:component` run component test

### Smoke Test

```sh
npm run test:smoke
# ENV defaults to uat; TAG to smoke, but can be passed in

npm run test:smoke <ENV> <TAG>
# ENV = uat | prod
# TAG = smoke, end2end, featureName
```

## Config

When request goes into Lambda service, all configs load from AWS Secret Manager and save into `global.config` based on fields mapping in `config.json`

We are using convention based config and only store the environment difference in AWS Secret Manager, for example

```
dev api base url: https://dev-api.accordo.io/
uat api base url: https://uat-api.accordo.io/
prod api base url: https://api.accordo.io/
```

we only need to store

```
{ "apiPrefix": "dev-" } in dev secret manager
{ "apiPrefix": "uat-" } in uat secret manager
{ "apiPrefix": "" } in prod secret manager

and add 'apiPrefix' in config.json
```

to access above config in code use `global.config.apiPrefix`

Developers have access to Dev and Uat Secret Manager, talk to the Tech Lead if you need to add new config on production Secret Manager
