const { run, getWtConfigFilePathDefaultOrFromUser, trySettingWtColorTheme } = require('../src/run');

const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const mockFs = require('mock-fs');
const nock = require('nock');
const inquirer = require('inquirer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const colorThemeListUrl = [
  'https://gitee.com',
  '/crawler995/iTerm2-Color-Schemes/tree/master/windowsterminal?_=1584328124997'
];
// const colorThemeDetailUrl = [
//   'https://raw.githubusercontent.com',
//   /\/mbadolato\/iTerm2-Color-Schemes\/master\/windowsterminal\/.+\.json/
// ];
const colorThemeDetailUrl = [
  'https://gitee.com',
  /\/crawler995\/iTerm2-Color-Schemes\/raw\/master\/windowsterminal\/.+\.json/
];
const wtConfigFileDefaultPath = path.resolve(
  os.homedir(),
  'AppData\\Local\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\profiles.json'
);
const myConfigFilePath = path.resolve(os.homedir(), 'wtcolor.json');

const getColorThemeListData = `
data-path='windowsterminal/MoonLight.json'
data-path='windowsterminal/Sunrise.json'
data-path='windowsterminal/Loneliness.json'
`;

const getColorThemeDetailData = {
  name: 'MoonLight',
  black: '#000000'
};

describe('test index.js', () => {
  let consoleStub;
  let promptStub;

  beforeEach(() => {
    consoleStub = sinon.stub(console, 'log');
    sinon.replace(console, 'log', consoleStub);
    promptStub = sinon.stub(inquirer, 'prompt');
  });
  afterEach(() => {
    promptStub.restore();
    sinon.restore();
    consoleStub.restore();
  });

  describe('getWtConfigFilePathDefaultOrFromUser()', () => {
    it(
      'should try getting wtconfig file path if original wtconfig file path' +
        ' is empty and wtconfig file is in the default path',
      done => {
        const dir = {};
        dir[wtConfigFileDefaultPath] = '';
        mockFs(dir);

        getWtConfigFilePathDefaultOrFromUser('').then(res => {
          expect(res).to.be.equal(wtConfigFileDefaultPath);
          mockFs.restore();
          done();
        });
      }
    );

    it(
      'should ask user for wtconfig file path if original wtconfig file path' +
        " is empty and wtconfig file isn't in the default path",
      done => {
        mockFs({});
        const userAnswer = 'C:\\test\\profiles.json';
        promptStub.callsFake(
          arr =>
            new Promise(resolve => {
              switch (arr[0].name) {
                case 'wtConfigFilePath':
                  resolve({
                    wtConfigFilePath: userAnswer
                  });
                  break;
                default:
                  resolve({});
                  break;
              }
            })
        );

        getWtConfigFilePathDefaultOrFromUser('').then(res => {
          expect(promptStub.calledOnce).to.be.true;
          expect(res).to.be.equal(userAnswer);

          mockFs.restore();
          done();
        });
      }
    );

    it("should return the same path if original wtconfig file path isn't empty", done => {
      getWtConfigFilePathDefaultOrFromUser('test').then(res => {
        expect(promptStub.called).to.be.false;
        expect(res).to.be.equal('test');
        done();
      });
    });
  });

  describe('trySettingWtColorTheme()', () => {
    it('should save config file path locally and output success if set color scheme successfully', () => {
      const dir = {};
      dir[wtConfigFileDefaultPath] = JSON.stringify({
        profiles: {
          list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
        },
        schemes: []
      });
      mockFs(dir);

      const writeStub = sinon.stub(process.stdout, 'write');
      trySettingWtColorTheme(getColorThemeDetailData, wtConfigFileDefaultPath);
      writeStub.restore();

      expect(JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8'))).to.deep.equal({
        wtConfigFilePath: wtConfigFileDefaultPath
      });
      expect(consoleStub.called).to.be.true;
      expect(JSON.parse(fs.readFileSync(wtConfigFileDefaultPath, 'utf8'))).to.deep.equal({
        profiles: {
          list: [
            { name: 'Windows PowerShell', colorScheme: getColorThemeDetailData.name },
            { name: 'cmd', colorScheme: getColorThemeDetailData.name },
            { name: 'Azure Cloud Shell', colorScheme: getColorThemeDetailData.name }
          ]
        },
        schemes: [getColorThemeDetailData]
      });

      mockFs.restore();
    });
  });

  it('should return if get color theme list failed', done => {
    const axiosStub = sinon.stub(axios, 'get').rejects({});

    run().then(res => {
      expect(res).to.be.undefined;
      axiosStub.restore();
      done();
    });

    axiosStub.restore();
  });

  it('should return if get color theme detail failed', done => {
    nock(colorThemeListUrl[0])
      .get(colorThemeListUrl[1])
      .reply(200, getColorThemeListData);
    nock(colorThemeDetailUrl[0])
      .get(colorThemeDetailUrl[1])
      .reply(403, {});

    promptStub.callsFake(
      arr =>
        new Promise(resolve => {
          switch (arr[0].name) {
            case 'colorThemeName':
              resolve({
                colorThemeName: 'MoonLight'
              });
              break;
            default:
              resolve({});
              break;
          }
        })
    );

    run().then(res => {
      expect(res).to.be.undefined;
      nock.cleanAll();
      done();
    });
  });

  it("should be successful if wtconfig file isn't in the default path but user gives correct path immediately", done => {
    nock(colorThemeListUrl[0])
      .get(colorThemeListUrl[1])
      .reply(200, getColorThemeListData);
    nock(colorThemeDetailUrl[0])
      .get(colorThemeDetailUrl[1])
      .reply(200, getColorThemeDetailData);

    const dir = {};
    const userGivenPath = 'C:\\test\\profiles.json';
    dir[userGivenPath] = JSON.stringify({
      profiles: {
        list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
      },
      schemes: []
    });
    mockFs(dir);

    promptStub.callsFake(
      arr =>
        new Promise(resolve => {
          switch (arr[0].name) {
            case 'colorThemeName':
              resolve({ colorThemeName: 'MoonLight' });
              break;
            case 'wtConfigFilePath':
              resolve({ wtConfigFilePath: userGivenPath });
              break;
            case 'isUserSatisfied':
              resolve({ isUserSatisfied: true });
              break;
            default:
              resolve({});
              break;
          }
        })
    );

    const writeStub = sinon.stub(process.stdout, 'write');
    run().then(() => {
      writeStub.restore();
      expect(JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8')).wtConfigFilePath).to.be.equal(
        userGivenPath
      );
      expect(JSON.parse(fs.readFileSync(userGivenPath, 'utf8'))).to.deep.equal({
        profiles: {
          list: [
            { name: 'Windows PowerShell', colorScheme: getColorThemeDetailData.name },
            { name: 'cmd', colorScheme: getColorThemeDetailData.name },
            { name: 'Azure Cloud Shell', colorScheme: getColorThemeDetailData.name }
          ]
        },
        schemes: [getColorThemeDetailData]
      });
      expect(
        consoleStub.args.map(item => item[0]).filter(item => item.includes('Bye~ Have a nice day!'))
          .length
      ).to.equal(1);
      nock.cleanAll();
      mockFs.restore();
      done();
    });
  });

  it('should be successful if user reinput wtconfig file path and reselect color theme for several times', done => {
    nock(colorThemeListUrl[0])
      .get(colorThemeListUrl[1])
      .reply(200, getColorThemeListData);
    nock(colorThemeDetailUrl[0])
      .get(colorThemeDetailUrl[1])
      .reply(200, { name: 'Loneliness', black: '#000000' })
      .persist(true);

    const dir = {};
    const userGivenPaths = [
      'C:\\test\\profiles.json',
      'C:\\test1\\profiles.json',
      'C:\\test2\\profiles.json'
    ];
    dir[userGivenPaths[2]] = JSON.stringify({
      profiles: {
        list: [{ name: 'Windows PowerShell' }, { name: 'cmd' }, { name: 'Azure Cloud Shell' }]
      },
      schemes: []
    });
    mockFs(dir);

    let selectTimes = 0;
    let inputTimes = 0;
    const themeNames = ['MoonLight', 'Sunrise', 'Loneliness'];
    promptStub.callsFake(
      arr =>
        new Promise(resolve => {
          switch (arr[0].name) {
            case 'colorThemeName':
              resolve({ colorThemeName: themeNames[selectTimes++] });
              break;
            case 'wtConfigFilePath':
              resolve({ wtConfigFilePath: userGivenPaths[inputTimes++] });
              break;
            case 'isUserSatisfied':
              resolve({ isUserSatisfied: selectTimes === 3 });
              break;
            default:
              resolve({});
              break;
          }
        })
    );

    const writeStub = sinon.stub(process.stdout, 'write');
    run().then(() => {
      writeStub.restore();
      expect(JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8')).wtConfigFilePath).to.be.equal(
        userGivenPaths[2]
      );
      expect(JSON.parse(fs.readFileSync(userGivenPaths[2], 'utf8'))).to.deep.equal({
        profiles: {
          list: [
            { name: 'Windows PowerShell', colorScheme: 'Loneliness' },
            { name: 'cmd', colorScheme: 'Loneliness' },
            { name: 'Azure Cloud Shell', colorScheme: 'Loneliness' }
          ]
        },
        schemes: [{ name: 'Loneliness', black: '#000000' }]
      });
      expect(inputTimes).to.be.equal(3);
      expect(selectTimes).to.be.equal(3);
      expect(
        consoleStub.args.map(item => item[0]).filter(item => item.includes('Bye~ Have a nice day!'))
          .length
      ).to.equal(1);
      nock.cleanAll();
      mockFs.restore();
      done();
    });
  });
});
