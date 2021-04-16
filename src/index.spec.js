const { expect } = require('chai');
const { handler } = require('./index');
const errorCodes = require('./exceptions/errorCodes');

describe('Unit test - index', () => {
  describe('handler', () => {
    it('will handle event GET /health and return correct response', async () => {
      const eventStub = {
        httpMethod: 'GET',
        resource: '/health'
      };

      const result = await handler(eventStub);
      expect(result).to.have.keys(['body', 'headers', 'statusCode', 'isBase64Encoded']);
      expect(JSON.parse(result.body).status).to.be.oneOf(['UP', 'WARNING']);
      expect(result.statusCode).to.equal(200);
      expect(result.headers).to.deep.equal({
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'private, no-store'
      });
    });
    it('will throw error on exception', async () => {
      try {
        await handler({});
        expect.fail('should have thrown InternalServerError exception');
      } catch (error) {
        expect(error.name).to.equal('InternalServerError');
        expect(error.code).to.equal(errorCodes.noHandlerMapping.code);
      }
    });
  });
});
