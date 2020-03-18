const { outputError, outputInfo, outputSuccess, showColorboard } = require('../src/colorout');

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

describe('test colorout.js', () => {
  let consoleStub;

  const testConsoleLogContent = (outputFn, msg, output) => {
    outputFn(msg);
    expect(consoleStub.args[0][0]).to.be.equal(output);
  };

  beforeEach(() => {
    consoleStub = sinon.stub(console, 'log');
    sinon.replace(console, 'log', consoleStub);
  });

  afterEach(() => {
    sinon.restore();
    consoleStub.restore();
  });

  describe('outputInfo()', () => {
    it("should print blue text with prefix '!'", () => {
      testConsoleLogContent(outputInfo, 'test info', '\033[34m! test info\033[m');
    });
  });

  describe('outputError()', () => {
    it("should print red text with prefix '×'", () => {
      testConsoleLogContent(outputError, 'test error', '\033[31m× test error\033[m');
    });
  });

  describe('outputSuccess()', () => {
    it("should print green text with prefix '√'", () => {
      testConsoleLogContent(outputSuccess, 'test success', '\033[32m√ test success\033[m');
    });
  });

  describe('showColorboard()', () => {
    it("should print a colorboard with text 'gYw' in specific order", () => {
      const text = 'gYw';
      const foregrounds = [
        '    m',
        '   1m',
        '  30m',
        '1;30m',
        '  31m',
        '1;31m',
        '  32m',
        '1;32m',
        '  33m',
        '1;33m',
        '  34m',
        '1;34m',
        '  35m',
        '1;35m',
        '  36m',
        '1;36m',
        '  37m',
        '1;37m'
      ];
      const backgrounds = ['40m', '41m', '42m', '43m', '44m', '45m', '46m', '47m'];
      const header =
        '\n                 40m     41m     42m     43m     44m     45m     46m     47m\n';

      const writeStub = sinon.stub(process.stdout, 'write');
      sinon.replace(process.stdout, 'write', writeStub);

      showColorboard();

      const expectedCalledOnceArgs = [];

      expectedCalledOnceArgs.push(header);
      foregrounds.forEach(fg => {
        expectedCalledOnceArgs.push(' ' + fg + ' \033[' + fg.trim() + '  ' + text + '  ');
        backgrounds.forEach(bg => {
          expectedCalledOnceArgs.push(
            ' \033[' + fg.trim() + '\033[' + bg + '  ' + text + '  \033[0m'
          );
        });
      });

      const calledOnceArgs = writeStub.args.map(item => item[0]);

      sinon.restore();
      writeStub.restore();

      expect(expectedCalledOnceArgs).to.deep.equal(calledOnceArgs);
    });
  });
});
