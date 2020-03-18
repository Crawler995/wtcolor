const { getColorThemeList, getDetailByColorThemeName } = require('../src/themeget');

const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');

describe('test themeget.js', () => {
  describe('getColorThemeList()', () => {
    it('should return undefind and output error if some other errors occured', done => {
      const axiosStub = sinon.stub(axios, 'get').rejects({});
      const consoleStub = sinon.stub(console, 'log');

      getColorThemeList().then(res => {
        expect(res).to.be.equal(undefined);
        expect(consoleStub.calledOnce).to.be.true;

        axiosStub.restore();
        consoleStub.restore();
        done();
      });
    });

    it('should return color theme names array', done => {
      const axiosStub = sinon.stub(axios, 'get').resolves({
        status: 200,
        data: `
          data-path='windowsterminal/MoonLight.json'
          data-path='windowsterminal/Sunrise.json'
          data-path='windowsterminal/Loneliness.json'
        `
      });
      const consoleStub = sinon.stub(console, 'log');

      getColorThemeList().then(res => {
        expect(res).to.deep.equal(['MoonLight', 'Sunrise', 'Loneliness']);

        axiosStub.restore();
        consoleStub.restore();
        done();
      });
    });
  });

  describe('getDetailByColorThemeName()', () => {
    it('should return undefind and output error if some other errors occured', done => {
      const axiosStub = sinon.stub(axios, 'get').rejects({});
      const consoleStub = sinon.stub(console, 'log');

      getDetailByColorThemeName('testThemeName').then(res => {
        expect(res).to.be.equal(undefined);
        expect(consoleStub.calledOnce).to.be.true;

        axiosStub.restore();
        consoleStub.restore();
        done();
      });
    });

    it('should return color theme detail', done => {
      const colorThemeDetail = {
        name: 'MoonLight',
        black: '#000000'
      };
      const axiosStub = sinon.stub(axios, 'get').resolves({
        status: 200,
        data: colorThemeDetail
      });
      const consoleStub = sinon.stub(console, 'log');

      getDetailByColorThemeName('testThemeName').then(res => {
        expect(res).to.deep.equal(colorThemeDetail);

        axiosStub.restore();
        consoleStub.restore();
        done();
      });
    });
  });
});
