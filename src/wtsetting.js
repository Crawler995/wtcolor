const path = require('path');
const os = require('os');
const fs = require('fs');
const { parse, stringify } = require('comment-json');

const { outputError } = require('./colorout');

const myConfigFilePath = path.resolve(os.homedir(), 'wtcolor.json');

const getWtConfigFilePath = () => {
  const basePath = path.resolve(os.homedir(), 'AppData\\Local\\Packages');
  // https://github.com/microsoft/terminal/blob/2d707f102bf27d455e15dcc6001337a8da6869c2/doc/user-docs/UsingJsonSettings.md
  // The settings are stored in the file:
  // $env:LocalAppData\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\profiles.json
  let wtDirPathArr = [];
  if (fs.existsSync(basePath))
    wtDirPathArr = fs
      .readdirSync(basePath)
      .filter(path => /^Microsoft\.WindowsTerminal_.+$/.test(path));

  if (wtDirPathArr.length === 0) {
    try {
      // get user given path
      const wtConfigFilePath = JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8'))
        .wtConfigFilePath;
      return wtConfigFilePath;
    } catch (error) {
      outputError('Find Windows Terminal config file failed!');
      return '';
    }
  }

  return path.resolve(basePath, `${wtDirPathArr[0]}\\LocalState\\profiles.json`);
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
