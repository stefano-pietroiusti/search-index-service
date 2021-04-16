const R = require('ramda');
const {
  utils: { logHelper }
} = require('@accordo-feed/webapi-helper');
const { config } = require('./utils');
const configVarNames = require('../config.json');
const { applyWebapiHandler } = require('./handlers/webapi');
const { applyActionHandler } = require('./handlers/actions');
const { applyErrorHandler } = require('./handlers/errorHandler');

/**
 * Entry handler for webapi and action handlers
 *
 * @returns response from webapi or action handler
 * @throws error if no handler found, or if action fails
 */
const handler = async event => {
  try {
    await config.getAndSetConfig(process.env.stage, configVarNames);
    logHelper.log('index_handler', { dateTime: new Date().toISOString(), event });
    const foundHandler = R.cond([...applyWebapiHandler(event), ...applyActionHandler(event), [R.T, applyErrorHandler]]);
    return await foundHandler(event);
  } catch (error) {
    logHelper.log('index_handler', error, event);
    throw error;
  }
};

exports.handler = handler;
