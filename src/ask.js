const inquirer = require('inquirer');

const userSelectColorTheme = (colorThemeList, defaultIndex) => {
  return inquirer.prompt([
    {
      name: 'colorThemeName',
      type: 'list',
      message: 'Choose a color theme and confirm it to preview:',
      choices: colorThemeList,
      pageSize: 10,
      default: defaultIndex
    }
  ]);
};

const askUserIsSatisfied = () => {
  return inquirer.prompt([
    {
      name: 'isUserSatisfied',
      type: 'confirm',
      message: 'Are you satisfied with this color theme?',
      default: false
    }
  ]);
};

const askUserWtConfigFilePath = () => {
  return inquirer.prompt([
    {
      name: 'wtConfigFilePath',
      type: 'input',
      message: 'You can input the config file absolute path manually: '
    }
  ]);
};

module.exports = {
  userSelectColorTheme,
  askUserIsSatisfied,
  askUserWtConfigFilePath
};
