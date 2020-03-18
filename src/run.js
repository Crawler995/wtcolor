const { outputSuccess, showColorboard } = require('./colorout');
const { getColorThemeList, getDetailByColorThemeName } = require('./themeget');
const { userSelectColorTheme, askUserIsSatisfied, askUserWtConfigFilePath } = require('./ask');
const {
  getWtConfigFilePath,
  setWtColorTheme,
  saveConfigFilePathLocally,
  deleteExistedMyConfigFile
} = require('./wtsetting');

const getWtConfigFilePathDefaultOrFromUser = async wtConfigFilePath => {
  if (wtConfigFilePath === '') {
    wtConfigFilePath = getWtConfigFilePath();
    // can't find in the default path or user given path is wrong
    // ask user to try getting the correct path
    if (wtConfigFilePath === '') {
      wtConfigFilePath = await (await askUserWtConfigFilePath()).wtConfigFilePath;
    }
  }
  return wtConfigFilePath;
};

const trySettingWtColorTheme = (colorThemeDetail, wtConfigFilePath) => {
  const isSuccess = setWtColorTheme(colorThemeDetail, wtConfigFilePath);
  if (isSuccess) {
    saveConfigFilePathLocally(wtConfigFilePath);
    outputSuccess('Change the color theme successfully!');
    showColorboard();
  }

  return isSuccess;
};

const run = async () => {
  const colorThemeList = await getColorThemeList();
  if (colorThemeList === undefined) {
    return;
  }

  let lastColorThemeIndex = 0;
  let wtConfigFilePath = '';

  while (true) {
    const { colorThemeName } = await userSelectColorTheme(colorThemeList, lastColorThemeIndex);
    const colorThemeDetail = await getDetailByColorThemeName(colorThemeName);
    if (colorThemeDetail === undefined) {
      return;
    }

    // get the Windows Terminal config file path
    while (true) {
      wtConfigFilePath = await getWtConfigFilePathDefaultOrFromUser(wtConfigFilePath);
      const isSuccess = trySettingWtColorTheme(colorThemeDetail, wtConfigFilePath);

      if (isSuccess) {
        break;
      }
      // if set color theme failed, it means the config path is wrong
      // so retry
      wtConfigFilePath = '';
      // if the config file which saved user incorrect given path exists and don't delete it now
      // it will occur a endless loop
      deleteExistedMyConfigFile();
    }

    const { isUserSatisfied } = await askUserIsSatisfied();
    if (isUserSatisfied) {
      outputSuccess('Bye~ Have a nice day!');
      break;
    }

    lastColorThemeIndex = colorThemeList.indexOf(colorThemeName);
  }
};

module.exports = {
  getWtConfigFilePathDefaultOrFromUser,
  trySettingWtColorTheme,
  run
};
