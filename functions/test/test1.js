const chai = require('chai');
const mocha = require('mocha');
const sinon = require('sinon');
const auth = require('../auth');

const { assert } = chai;
const { describe, it } = mocha;

describe('Auth', () => {
  it('should return 401 when not authenticated', () => {
    const inReq = { header: sinon.stub().returns(null) };
    const send = sinon.spy();
    const inResp = {
      status: () => ({ send }),
    };
    const statusSpy = sinon.spy(inResp, 'status');
    auth.secureRequest(inReq, inResp, sinon.fake());
    assert.isTrue(inReq.header.called);
    assert.isTrue(statusSpy.called);
    assert.isTrue(send.called);
    assert.equal(statusSpy.getCall(0).args[0], 401, '401 unauthorised should be returned when no authorization header supplied');
    assert.equal(typeof send.getCall(0).args[0].error, 'string', 'Error message should be sent in response as a string');
  });
  it('should throw error when single value parsed in authorization header', () => {
    const inReq = { header: sinon.stub().returns('1234567890') };
    const send = sinon.spy();
    const inResp = {
      status: () => ({ send }),
    };
    const statusSpy = sinon.spy(inResp, 'status');
    auth.secureRequest(inReq, inResp, sinon.fake());
    assert.isTrue(inReq.header.called);
    assert.isTrue(statusSpy.called);
    assert.isTrue(send.called);
    assert.equal(statusSpy.getCall(0).args[0], 401, '401 unauthorised should be returned when no authorization header supplied');
    assert.equal(send.getCall(0).args[0].error, 'Authorization header not set correctly');
  });
  it('should throw error when invalid provider sent', () => {
    const inReq = { header: sinon.stub().returns('fake 1234567890') };
    const send = sinon.spy();
    const inResp = {
      status: () => ({ send }),
    };
    const statusSpy = sinon.spy(inResp, 'status');
    auth.secureRequest(inReq, inResp, sinon.fake());
    assert.isTrue(inReq.header.called);
    assert.isTrue(send.called, 'possibly not called because it thought fake was valid?');
    assert.equal(send.getCall(0).args[0].error, 'Unknown authentication provider specified');
    assert.isTrue(statusSpy.called);
    assert.equal(statusSpy.getCall(0).args[0], 401, '401 unauthorised should be returned when no authorization header supplied');
  });
  it('should return test user', () => {
    const inReq = { header: sinon.stub().returns('facebook 1234567890') };
    const send = sinon.spy();
    const inResp = {
      status: () => ({ send }),
    };
    const statusSpy = sinon.spy(inResp, 'status');
    auth.secureRequest(inReq, inResp, user => send(user)).then(() => {
      assert.isTrue(inReq.header.called);
      assert.isTrue(send.called, 'possibly not called because it thought fake was valid?');
      assert.equal(send.getCall(0).args[0].userId, 'usr-1234567890');
    });
    assert.isFalse(statusSpy.called, 'possibly detected an error?');
  });
});
