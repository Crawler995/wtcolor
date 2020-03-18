const {
  getWtConfigFilePath,
  addSchemes,
  setScheme,
  setWtColorTheme,
  convertUserGivenPath,
  saveConfigFilePathLocally,
  deleteExistedMyConfigFile
} = require('../src/wtsetting');

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const path = require('path');
const os = require('os');
const mockFs = require('mock-fs');
const fs = require('fs');

const wtConfigFileDefaultPath = path.resolve(
  os.homedir(),
  'AppData\\Local\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\profiles.json'
);
const myConfigFilePath = path.resolve(os.homedir(), 'wtcolor.json');

describe('test wtsetting.js', () => {
  let stub;
  // can't stub colorout.outputError directly...
  // so stub console.log to replace it
  // because console.log must be invoked if colorout.outputError is invoked
  beforeEach(() => {
    stub = sinon.stub(console, 'log');
    sinon.replace(console, 'log', stub);
  });

  afterEach(() => {
    sinon.restore();
    stub.restore();
  });

  describe('getWtConfigFilePath()', () => {
    it('should return the default path if default path exists', () => {
      const dir = {};
      dir[wtConfigFileDefaultPath] = '';
      mockFs(dir);

      expect(getWtConfigFilePath()).to.be.equal(wtConfigFileDefaultPath);

      mockFs.restore();
    });

    it("should return user previous given path if default path doesn't exist", () => {
      const dir = {};
      const testPathInFile = 'C:\\\\test\\\\profiles.json';
      const expectedPath = 'C:\\test\\profiles.json';
      dir[myConfigFilePath] = '{ "wtConfigFilePath": "' + testPathInFile + '" }';
      mockFs(dir);

      expect(getWtConfigFilePath()).to.be.equal(expectedPath);

      mockFs.restore();
    });

    it("should return empty string and output error if default path and wtcolor config file don't exist", () => {
      mockFs({});

      expect(getWtConfigFilePath()).to.be.equal('');
      expect(stub.calledOnce).to.be.true;

      mockFs.restore();
    });
  });

  describe('addSchemes()', () => {
    it('should return false if the given configObj.schemes === undefined', () => {
      const colorThemeDetail = {
        name: 'testTheme',
        black: '#000000'
      };
      const configObj = {};

      expect(addSchemes(colorThemeDetail, configObj)).to.be.false;
    });

    it('should return true if the given colorThemeDetail already exists in the given configObj.schemes', () => {
      const colorThemeDetail = {
        name: 'testTheme',
        black: '#000000'
      };
      const configObj = {
        schemes: [
          {
            name: 'testTheme',
            black: '#000000'
          }
        ]
      };
      const expectedConfigObj = {
        schemes: [
          {
            name: 'testTheme',
            black: '#000000'
          }
        ]
      };

      expect(addSchemes(colorThemeDetail, configObj)).to.be.true;
      expect(configObj).to.deep.equal(expectedConfigObj);
    });

    it(
      'should return true and add the given colorThemeDetail to the given configObj.schemes ' +
        "if the above two tests aren't met",
      () => {
        const colorThemeDetail = {
          name: 'testTheme',
          black: '#000000'
        };
        const configObj = {
          schemes: []
        };

        const expectedConfigObj = {
          schemes: [colorThemeDetail]
        };

        expect(addSchemes(colorThemeDetail, configObj)).to.be.true;
        expect(configObj).to.deep.equal(expectedConfigObj);
      }
    );
  });

  describe('setScheme()', () => {
    it('should return false if the given configObj.profiles === undefined', () => {
      const colorThemeName = 'testTheme';
      const configObj = {};

      expect(setScheme(colorThemeName, configObj)).to.be.false;
    });

    it('should return false if the given configObj.profiles.list === undefined', () => {
      const colorThemeName = 'testTheme';
      const configObj = {
        profiles: {}
      };

      expect(setScheme(colorThemeName, configObj)).to.be.false;
    });

    it('should return true and set colorScheme of each item in configObj.profiles.list to the given colorThemeName', () => {
      const colorThemeName = 'testTheme';
      const configObj = {
        profiles: {
          list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
        }
      };

      const expectedConfigObj = {
        profiles: {
          list: [
            { name: 'Windows PowerShell', colorScheme: 'testTheme' },
            { name: 'cmd', colorScheme: 'testTheme' },
            { name: 'Azure Cloud Shell', colorScheme: 'testTheme' }
          ]
        }
      };

      expect(setScheme(colorThemeName, configObj)).to.be.true;
      expect(configObj).to.deep.equal(expectedConfigObj);
    });
  });

  describe('setWtColorTheme()', () => {
    it('should return false and output error if config file open failed', () => {
      mockFs({});

      expect(setWtColorTheme({}, '')).to.be.false;
      expect(stub.calledOnce).to.be.true;

      mockFs.restore();
    });

    it('should return false and output error if add schemes failed', () => {
      const dir = {};
      dir[wtConfigFileDefaultPath] = JSON.stringify({
        profiles: {
          list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
        }
      });
      mockFs(dir);

      expect(setWtColorTheme({ name: 'a' }, wtConfigFileDefaultPath)).to.be.false;
      expect(stub.calledOnce).to.be.true;

      mockFs.restore();
    });

    it('should return false and output error if set scheme failed', () => {
      const dir = {};
      dir[wtConfigFileDefaultPath] = JSON.stringify({
        profiles: {},
        schemes: []
      });
      mockFs(dir);

      expect(setWtColorTheme({ name: 'a' }, wtConfigFileDefaultPath)).to.be.false;
      expect(stub.calledOnce).to.be.true;

      mockFs.restore();
    });

    it('should return true and modify the config file', () => {
      const dir = {};
      dir[wtConfigFileDefaultPath] = JSON.stringify({
        profiles: {
          list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
        },
        schemes: []
      });
      mockFs(dir);

      const colorThemeDetail = { name: 'testColorTheme', black: '#000000' };
      const expectedConfigContent = {
        profiles: {
          list: [
            { name: 'Windows PowerShell', colorScheme: colorThemeDetail.name },
            { name: 'cmd', colorScheme: colorThemeDetail.name },
            { name: 'Azure Cloud Shell', colorScheme: colorThemeDetail.name }
          ]
        },
        schemes: [colorThemeDetail]
      };
      expect(setWtColorTheme(colorThemeDetail, wtConfigFileDefaultPath)).to.be.true;
      expect(JSON.parse(fs.readFileSync(wtConfigFileDefaultPath, 'utf8'))).to.deep.equal(
        expectedConfigContent
      );

      mockFs.restore();
    });
  });

  describe('convertUserGivenPath()', () => {
    it("should convert '\\' to '\\\\'", () => {
      expect(convertUserGivenPath('C:\\test\\profiles.json')).to.be.equal(
        'C:\\\\test\\\\profiles.json'
      );
    });
    it("shouldn't convert '\\\\' to another format", () => {
      expect(convertUserGivenPath('C:\\\\test\\\\profiles.json')).to.be.equal(
        'C:\\\\test\\\\profiles.json'
      );
    });
    it("shouldn't convert '/' to another format", () => {
      expect(convertUserGivenPath('C:/test/profiles.json')).to.be.equal('C:/test/profiles.json');
    });
  });

  describe('saveConfigFilePathLocally()', () => {
    it('should save the given path to my config file', () => {
      mockFs({});

      saveConfigFilePathLocally('C:\\test\\profiles.json');

      expect(JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8'))).to.deep.equal({
        wtConfigFilePath: 'C:\\test\\profiles.json'
      });

      mockFs.restore();
    });
  });

  describe('deleteExistedMyConfigFile()', () => {
    it('should delete existed my config file', () => {
      const dir = {};
      dir[myConfigFilePath] = '';
      mockFs(dir);

      expect(fs.existsSync(myConfigFilePath)).to.be.true;
      deleteExistedMyConfigFile();
      expect(!fs.existsSync(myConfigFilePath)).to.be.true;

      mockFs.restore();
    });

    it("should do nothing if my config file doesn't exist", () => {
      mockFs({});

      expect(fs.existsSync(myConfigFilePath)).to.be.false;
      deleteExistedMyConfigFile();
      expect(fs.existsSync(myConfigFilePath)).to.be.false;

      mockFs.restore();
    });
  });
});
