## How To Use O365_SNAPSHOT_INDEX_UPSERT and O365_SNAPSHOT_INDEX_DELETE

Updates the {stage}-office365-consumption-snapshot index by action

```javascript
  // needs aws-sdk to invoke the lambda
  const AWS = require('aws-sdk');

  /*
   * FuntionName - the lambda name specified in the serverless file
   * InvocationType - 'RequestResponse'
   * Payload -
      {
          action: 'O365_SNAPSHOT_INDEX_UPSERT',
          clientId: 'acc_d0e92616-64b2-4a56-8605-d01105fef86c',
          partnerId: 'ac_8e8a6fed-a7c4-44e6-aacb-e36e80581d17',
          lastProcessed: '2019-06-18T03:15:21.015Z',
          dashboardViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365DashboardView.json',
          recommendationsViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365RecommendationsView.json',
          usersViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365UsersView.json'
      }
   */

  const buildParams = payload => ({
    FunctionName: `${global.config.<microservice>.stage}-search-index-service`,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload)
  });

  /*
   * Needs to instantiate the class to use the invoke function.
   */
  const getLambdaService = region => new AWS.Lambda({
    region
  });

  /*
   * Since lambda invoke is an asynchronous process.
   * There are 2 ways to execute lambda invoke, through Promises or async, await.
   */
  const invoke = payload =>
    Promise.resolve()
      .then(getLambdaService)
      .then(lambda => lambda.invoke(buildParams(payload)).promise())

  const upsert365ConsumptionSnapshot = () => invoke({
          action: 'O365_SNAPSHOT_INDEX_UPSERT',
          clientId: 'acc_d0e92616-64b2-4a56-8605-d01105fef86c',
          partnerId: 'ac_8e8a6fed-a7c4-44e6-aacb-e36e80581d17',
          lastProcessed: '2019-06-18T03:15:21.015Z',
          dashboardViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365DashboardView.json',
          recommendationsViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365RecommendationsView.json',
          usersViewPath:
            'dev/acc_d0e92616-64b2-4a56-8605-d01105fef86c/4912736e-c304-4683-b6dd-3e683bb6fe09-office365UsersView.json'
      });

  const delete365ConsumptionSnapshot = () => invoke({
          action: 'O365_SNAPSHOT_INDEX_DELETE',
          clientId: 'acc_d0e92616-64b2-4a56-8605-d01105fef86c',
          partnerId: 'ac_8e8a6fed-a7c4-44e6-aacb-e36e80581d17'
      });

  //expose the public function
  module.exports = {
    upsert365Consumption,
    delete365ConsumptionSnapshot
  };

```

Error Codes:

```javascript
  elasticSearchError: { code: 115006, message: 'Failed to complete the requested action on the search index' }
```
