const axios = require('axios');
const clui = require('clui');
const {
  outputError,
  outputInfo,
  outputSuccess
} = require('./colorout');

const getColorThemeList = () => {
  const url = 'https://api.github.com/repos/mbadolato/iTerm2-Color-Schemes/contents/windowsterminal';
  const spinner = new clui.Spinner('Getting the color theme list...  ');

  return new Promise(async (resolve, reject) => {
    try {
      spinner.start();
      const rawRepoInfoRes = await axios.get(url);
      spinner.stop();
  
      const colorThemeList = rawRepoInfoRes.data.map(item => item.name.substring(0, item.name.length - 5));
      resolve(colorThemeList);
    } catch (error) {
      spinner.stop();
      outputError('Get the color theme list error: ' + error);
      resolve(undefined);
    }
  });
};

const getDetailByColorThemeName = (colorThemeName) => {
  const url = `https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/windowsterminal/${colorThemeName}.json`;
  const spinner = new clui.Spinner(`Getting detail of color theme "${colorThemeName}"...  `);

  return new Promise(async (resolve, reject) => {
    try {
      spinner.start();
      const detailRes = await axios.get(url);
      spinner.stop();

      resolve(detailRes.data);
    } catch (error) {
      spinner.stop();
      outputError(`Get the detail of color theme "${colorThemeName}" error: ${error}`);
      resolve(undefined);
    }
  })
};

module.exports = {
  getColorThemeList,
  getDetailByColorThemeName
};