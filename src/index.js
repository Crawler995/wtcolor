#!/usr/bin/env node

const inquirer = require('inquirer');
const {
  outputSuccess,
  outputError,
  outputInfo,
  showColorboard
} = require('./colorout');
const {
  getColorThemeList,
  getDetailByColorThemeName
} = require('./themeget');
const {
  userSelectColorTheme,
  askUserIsSatisfied,
  askUserWtConfigFilePath
} = require('./ask');
const {
  getWtConfigFilePath,
  setWtColorTheme,
  saveConfigFilePathLocally
} = require('./wtsetting');

const run = async () => {
  const colorThemeList = await getColorThemeList();
  if(colorThemeList === undefined) {
    return;
  }

  let lastColorThemeIndex = 0;
  let wtConfigFilePath = '';

  while(true) {
    const { colorThemeName } = await userSelectColorTheme(colorThemeList, lastColorThemeIndex);
    const colorThemeDetail = await getDetailByColorThemeName(colorThemeName);
    if(colorThemeDetail === undefined) {
      return;
    }

    while(true) {
      if(wtConfigFilePath === '') {
        wtConfigFilePath = getWtConfigFilePath();
        if(wtConfigFilePath === '') {
          wtConfigFilePath = await (await askUserWtConfigFilePath()).wtConfigFilePath;
          saveConfigFilePathLocally(wtConfigFilePath);
        }
      }

      const isSuccess = setWtColorTheme(colorThemeDetail, wtConfigFilePath);
      if(isSuccess) {
        outputSuccess('Change the color theme successfully!')
        showColorboard();
        break;
      }

      wtConfigFilePath = '';
    }

    const { isUserSatisfied } = await askUserIsSatisfied();
    if(isUserSatisfied) {
      outputSuccess('Bye~ Have a nice day!')
      break;
    }

    lastColorThemeIndex = colorThemeList.indexOf(colorThemeName);
  }
};


run();
