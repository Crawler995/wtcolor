const path = require('path');
const os = require('os');
const fs = require('fs');
const { parse, stringify } = require('comment-json');

const { outputError } = require('./colorout');

// const myConfigFilePath = path.resolve(os.homedir(), 'wtcolor.json');
const myConfigFilePath = './wtcolor.json'

const getWtConfigFilePath = () => {
  try {
    // get user given path
    const wtConfigFilePath = JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8'))
      .wtConfigFilePath;
    return wtConfigFilePath;
  } catch (error) { }

  const basePath = path.resolve(os.homedir(), 'AppData\\Local\\Packages');
  // https://docs.microsoft.com/en-US/windows/terminal/customize-settings/global-settings
  // The settings are stored in the file:
  // $env:LocalAppData\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json
  let wtDirPathArr = [];
  if (fs.existsSync(basePath))
    wtDirPathArr = fs
      .readdirSync(basePath)
      .filter(path => /^Microsoft\.WindowsTerminal_.+$/.test(path));

  if (wtDirPathArr.length === 0) {
    return '';
  }

  const defaultWtConfigFilePath = [
    path.resolve(basePath, `${wtDirPathArr[0]}\\LocalState\\settings.json`)
  ].find((p) => fs.existsSync(p)) || '';

  if (defaultWtConfigFilePath === '') {
    outputError('Find Windows Terminal config file failed!');
  }
  return defaultWtConfigFilePath;
};

const addSchemes = (colorThemeDetail, configObj) => {
  if (configObj.schemes === undefined) {
    return false;
  }
  const existSchemeNames = configObj.schemes.map(item => item.name);
  // the color theme will be set already exists
  if (existSchemeNames.indexOf(colorThemeDetail.name) > -1) {
    return true;
  }

  configObj.schemes = [colorThemeDetail];
  return true;
};

const setScheme = (colorThemeName, configObj) => {
  // profiles can be an array:
  // profiles: [...]
  // or an object like this:
  // profiles: { list: [...] }
  if (configObj.profiles === undefined) {
    return false;
  }

  const { profiles } = configObj;
  const type = Object.prototype.toString.call(profiles);

  if (type === '[object Object]') {
    if (profiles.list === undefined) {
      return false;
    }

    profiles.list.forEach(item => {
      item.colorScheme = colorThemeName;
    });
  } else if (type === '[object Array]') {
    configObj.profiles = profiles.map(item => ({
      ...item,
      colorScheme: colorThemeName
    }));
  } else {
    return false;
  }

  return true;
};

const setWtColorTheme = (colorThemeDetail, wtConfigFilePath) => {
  let fileContent = '';
  try {
    fileContent = fs.readFileSync(wtConfigFilePath, 'utf8');
  } catch (error) {
    outputError('Open config file failed! Please check the given path.');
    return false;
  }

  // the config file is 'JSON with Comment'
  // can't be parsed by JSON.parse()
  // so use 'comment-json'
  const configObj = parse(fileContent);

  if (!addSchemes(colorThemeDetail, configObj)) {
    outputError('No "schemes" found in the config file!');
    return false;
  }

  if (!setScheme(colorThemeDetail.name, configObj)) {
    outputError('No "list" found in the config file!');
    return false;
  }
  fs.writeFileSync(wtConfigFilePath, stringify(configObj, null, 4));
  return true;
};

const convertUserGivenPath = path => {
  return path.replace(/\\/g, '\\\\').replace(/\\\\\\\\/g, '\\\\');
};

const saveConfigFilePathLocally = userGivenWtConfigFilePath => {
  // if raw input is: C:\aaa\bbb\profiles.json
  // needs be converted to C:\\aaa\\bbb\\profiles.json
  userGivenWtConfigFilePath = convertUserGivenPath(userGivenWtConfigFilePath);
  fs.writeFileSync(myConfigFilePath, `{ "wtConfigFilePath": "${userGivenWtConfigFilePath}" }`);
};

const deleteExistedMyConfigFile = () => {
  if (fs.existsSync(myConfigFilePath)) {
    fs.unlinkSync(myConfigFilePath);
  }
};

module.exports = {
  getWtConfigFilePath,
  addSchemes,
  setScheme,
  setWtColorTheme,
  convertUserGivenPath,
  saveConfigFilePathLocally,
  deleteExistedMyConfigFile
};
