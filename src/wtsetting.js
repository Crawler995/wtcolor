const path = require('path');
const os = require('os');
const fs = require('fs');

const {
  outputError,
  outputInfo
} = require('./colorout');

const myConfigFilePath = path.resolve(os.homedir(), 'wtcolor.json');

const getWtConfigFilePath = () => {
  const basePath = path.resolve(os.homedir(), 'AppData\\Local\\Packages');
  const wtDirPathArr = fs.readdirSync(basePath).filter(path => /^Microsoft\.WindowsTerminal_.+$/.test(path));
  if(wtDirPathArr.length === 0) {
    try {
      const wtConfigFilePath = JSON.parse(fs.readFileSync(myConfigFilePath, 'utf8')).wtConfigFilePath;
      return wtConfigFilePath;
    } catch (error) {
      outputError('Find Windows Terminal config file failed!');
      return '';
    }
  }

  return path.resolve(basePath, `${wtDirPathArr[0]}\\LocalState\\profiles.json`);
};

const addSchemes = (colorThemeDetail, configObj) => {
  if(configObj.schemes === undefined) {
    return false;
  }
  const existSchemeNames = configObj.schemes.map(item => item.name);
  if(existSchemeNames.indexOf(colorThemeDetail.name) > -1) {
    return true;
  }
  configObj.schemes = [colorThemeDetail];
  return true;
};

const setScheme = (colorThemeName, configObj) => {
  if(configObj.profiles === undefined || configObj.profiles.list === undefined) {
    return false;
  }

  configObj.profiles.list.forEach(item => {
    item.colorScheme = colorThemeName;
  });
  return true;
};

const removeLineComment = (fileContent) => {
  return fileContent.replace(/(?<!:)\/\/[^\n]*/g, '');
};

const setWtColorTheme = (colorThemeDetail, wtConfigFilePath) => {
  let fileContent = '';
  try {
    fileContent = fs.readFileSync(wtConfigFilePath, 'utf8');
  } catch (error) {
    outputError('Open config file failed! Please check the given path.');
    return false;
  }
  fileContent = removeLineComment(fileContent);
  const configObj = JSON.parse(fileContent);

  if(!addSchemes(colorThemeDetail, configObj)) {
    outputError('No "schemes" found in the config file!');
    return false;
  }

  if(!setScheme(colorThemeDetail.name, configObj)) {
    outputError('No "list" found in the config file!');
    return false;
  }
  fs.writeFileSync(wtConfigFilePath, JSON.stringify(configObj, null, 4));
  return true;
};

const saveConfigFilePathLocally = (wtConfigFilePath) => {
  wtConfigFilePath = wtConfigFilePath.replace(/\\/g, '\\\\').replace(/\\\\\\\\/g, '\\\\');
  fs.writeFileSync(myConfigFilePath, `{ \"wtConfigFilePath\": \"${wtConfigFilePath}\" }`);
}

module.exports = {
  getWtConfigFilePath,
  setWtColorTheme,
  saveConfigFilePathLocally
};