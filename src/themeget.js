const axios = require('axios');
const clui = require('clui');
const { outputError } = require('./colorout');

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36 Edg/80.0.361.66'
};

// if errors occured, return undefined
const getColorThemeList = async () => {
  // const url =
  // 'https://api.github.com/repos/mbadolato/iTerm2-Color-Schemes/contents/windowsterminal';
  const url =
    'https://gitee.com/crawler995/iTerm2-Color-Schemes/tree/master/windowsterminal?_=1584328124997';
  const spinner = new clui.Spinner('Getting the color theme list...  ');

  try {
    spinner.start();
    const rawRepoInfoRes = await axios.get(url, { headers });
    spinner.stop();

    const regx = /data-path='windowsterminal\/(.+)\.json'/g;
    const colorThemeList = [];
    while (true) {
      const res = regx.exec(rawRepoInfoRes.data);
      if (res === null) break;
      colorThemeList.push(res[1]);
    }

    return colorThemeList;
  } catch (error) {
    spinner.stop();

    outputError('Get the color theme list error: ' + error);
    return undefined;
  }
};

// if errors occured, return undefined
const getDetailByColorThemeName = async colorThemeName => {
  // const url = `https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/windowsterminal/${colorThemeName}.json`;
  const url = `https://gitee.com/crawler995/iTerm2-Color-Schemes/raw/master/windowsterminal/${colorThemeName}.json`;
  const spinner = new clui.Spinner(`Getting detail of color theme "${colorThemeName}"...  `);

  try {
    spinner.start();
    const detailRes = await axios.get(url, { headers });
    spinner.stop();

    return detailRes.data;
  } catch (error) {
    spinner.stop();

    outputError(`Get the detail of color theme "${colorThemeName}" error: ${error}`);
    return undefined;
  }
};

module.exports = {
  getColorThemeList,
  getDetailByColorThemeName
};
