# Pull Request Commit Checklist

## One commit per pull request

This give us the benefit to have a clear and concise git history that clearly and easily documents the changes done and the reasons why.

This is not against "commit early and commit often", you just need to squash the commits into a single commit and do a force push when creating the pull request.

See [Git Tips](https://accordo.atlassian.net/wiki/spaces/RS/pages/158990337/Git+Tips) for how to use `Amend Commit` to maintain one commit

## Always rebased on origin/master

Rebased on origin/master makes sure all the test runs against the latest code

## Commit message format

Follow [Conventional Commits](https://www.conventionalcommits.org/)

```
<JIRA TicketId> <type>: [optional scope]: <description>
[empty line]
[optional body]
```

example:

```
AIT2-3632 feat: for unknown plans, only log when have plan name and skuIds

* feat: only log error at global index level if it doesn't have an error code
* test: updated plan map tests to check logging
```

# Contract First Development

## Define/update the API contract in `docs/swagger.yml` before the code change

-   It enables QA, Frontend, Backend working in parallell
-   You can edit/verify the `swagger.yml` in [Swagger Editor](https://editor.swagger.io/)
-   Follow the [REST API Convention](https://accordo.atlassian.net/wiki/spaces/EN/pages/72124651/REST+API+design)
-   Define both success and error response

## Define the AWS Step Function contract in `docs/steps.md`

example: [steps.md](https://bitbucket.org/accordogroup/consumption-service/src/master/docs/steps.md)

# Pull Request Quality Measures

## Pass the pull request build

It covers:

-   Eslint check
-   NPM package vulnerabilities check
-   Unit test, line and branch coverage > 90%
-   Integration test
-   Component test

# Error Handling & Logging

## Use Custom Errors

Use [Custom Errors](https://bitbucket.org/accordogroup/webapi-helper/src/master/src/exceptions/) from [webapi-helper](https://bitbucket.org/accordogroup/webapi-helper/src/master/)

-   Custom Error map to HTTP status code in `src/handlers`
-   Custom Error extends from default Error, it can set errorCode and errorDetails
-   Keep the stack trace for debugging

Custom Error Http Status Code Mapping

```javascript
RedirectionError: 301;
ValidationError: 400;
AuthenticationError: 401;
NotFoundError: 404;
UnknownHttpMethodError: 405;
ConflictError: 409;
InternalServerError: 500;
Error: 500; // defualt Error also map to 500
BadGatewayError: 502;
UpstreamServerError: 503;
```

Example:

```javascript
throw new BadGatewayError(errorMessage, errorCode, errorDetails);
```

## Define Custom Error Code & Message

Define custom error code and message in `src/exceptions/errorCodes.js`

-   Double check the error code range is not used by other Microservices
-   Add error code in [Error Codes Page](https://accordo.atlassian.net/wiki/spaces/RS/pages/186417295/Error+codes) for PO, QA and other teams reference
-   Frontend can use errorCode as language key for the error

Define error code example

```javascript
/**
 * Placeholder for customized error codes
 *
 * 162001 - 163000
 */
module.exports = {
  ...
  badStateForAction: { code: 162022, message: 'Unable to perform action due to wrong state' },
  ...
};

```

Use the error code when throw a custom error

```javascript
throw new InternalServerError(errorCodes.badStateForAction.message, errorCodes.badStateForAction.code, {
    authState: this.office365.authState,
    wantedAuthState: authStates.ACCESS_GRANTED,
    orgId: this.id
});
```

## Gateway Module Error Handling

Module in `src/gateways` folder encapsulates access to an external system or resource.

-   Catch resource not found error, rethrow as NotFoundError
-   Catch other resource error, rethrow as BadGatewayError
-   Log the original error with key infomation for debugging
-   Include innerError and debug info in rethrowed custom error

Example:

```javascript
const getAssessment = async assessmentId => {
    const request = {
        method: 'GET',
        url: `https://${global.config.apiPrefix}api.accordo.io/assessments/${assessmentId}`,
        json: true
    };

    try {
        const response = await rp(request);
        return response;
    } catch (error) {
        error.details = {
            assessmentId
        };
        logHelper.error('assessmentAPI_getAssessment', error);

        if (error.statusCode === 404) {
            throw new exceptions.NotFoundError(
                errorCodes.assessmentNotFound.message,
                errorCodes.assessmentNotFound.code,
                { innerError: error.message, assessmentId }
            );
        }

        throw new exceptions.BadGatewayError(
            errorCodes.assessmentAPIError.message,
            errorCodes.assessmentAPIError.code,
            { innerError: error.message, assessmentId }
        );
    }
};
```

## No console.log()

Use the [logHelper](https://bitbucket.org/accordogroup/webapi-helper/src/master/src/utils/logHelper.js) from [webapi-helper](https://bitbucket.org/accordogroup/webapi-helper/src/master/), it ensures the logging format is coninsistent in [Rapid7](https://insight.rapid7.com/login)

## Use logHelper.info() to log info

Usage:

```javascript
/**
 * @param {string} tag - convention: module_function_extraInfo
 * @param {object|string|array} details
 */
logHelper.info(tag, details);
```

Example:

```javascript
logHelper.info('office365PriceRepo_getBySkuIdOrPlanName_unknownPlan', { skuId, planName });
```

## Use logHelper.error() to log error

Usage:

```javascript
/**
 * @param {string} tag - convention: module_function
 * @param {Error} error - instanceof Error
 * @param {object} event - [optional] Lambda event
 */
logHelper.error(tag, error, event);
```

Example:

```javascript
// in 'src/gateways/assessmentAPI.js'
logHelper.error('assessmentAPI_getAssessment', error);

// in 'src/handlers/webapi/consumptionController.js'
logHelper.error('consumptionController_getState', error, event);
```

# Coding Practice & Convention

## Require modules by folders, opposed to the files directly

When developing a module in a folder, place an index.js file that exposes the module's internals so every consumer will pass through it. This serves as an 'interface' to your module and eases future changes without breaking the contract

Otherwise: Changing the internal structure of files or the signature may break the interface with clients

Example

```javascript
// Do
const { Office365UsersViewEntity } = require('../office365Users');

// Avoid
const Office365UsersViewEntity = require('../office365Users/Office365UsersViewEntity');
```

## Add JSDoc for for all public functions in the module

https://devdocs.io/jsdoc/

-   Add [@param type](https://devdocs.io/jsdoc/tags-param)
-   Add [@returns type](https://devdocs.io/jsdoc/tags-returns)

## [Folder] Handlers

We use handler resolver pattern to handle multiple events in one Lambda, event/resolver mapping is defined in `src/handlers`

-   Extract minimum data from Lambda event in handler and pass into domain service `src/domains/featureName/featureService.js`
-   Keep Lambda context only in handler, this not only draws a clean separation of concerns but also significantly eases mocking and testing the system
-   Add API Gateway event handler in `src/handlers/webapi/xyzController`
-   Add none API Gateway event handler in `src/handlers/actions/xyzHandler`, e.g. Step Function Step, Cloud Watch Scheduler

## API Gateway Event Handler

-   Endpoints share the same feature can goes into the same `controller`
-   Use `webapi-helper` [response helper](https://bitbucket.org/accordogroup/webapi-helper/src/master/src/utils/response.js) to handle success and error response

Response helper example:

```javascript
const getConsumptionDocument = async event => {
    try {
        const result = await consumptionService.getConsumptionDocument(R.path(['pathParameters', 'orgId'], event));
        return response.getSuccessfulLambdaProxyResponse({
            httpMethod: event.httpMethod,
            result
        });
    } catch (error) {
        logHelper.log('consumptionController_getConsumptionDocument', error, event);
        return response.getFailureLambdaProxyResponse({ error });
    }
};
```

## None API Gateway Event Handler

-   Endpoints share the same feature can goes into the same `handler`
-   Success response just need to return the value, no need to use response helper
-   Error response just let the Error bubble up to the index.js

## [Folder] Gateways

Module in `src/gateways` folder encapsulates access to an external system or resource.

-   Keep all internal/external services request in `src/gateways` significantly eases mocking and testing the system
-   Follow the _Gateway Module Error Handling_
-   Avoid businiess login in gateways module, it should handle by module in `src/domains`

## [Folder] Domains
