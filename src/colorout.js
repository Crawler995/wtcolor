const outputInfo = info => {
  console.log('\033[34m! ' + info + '\033[m');
};

const outputError = err => {
  console.log('\033[31m× ' + err + '\033[m');
};

const outputSuccess = msg => {
  console.log('\033[32m√ ' + msg + '\033[m');
};

// Copied from https://github.com/mbadolato/iTerm2-Color-Schemes/blob/master/tools/screenshotTable.sh
const showColorboard = () => {
  const text = 'gYw';
  const foregrounds = [
    '    m',
    '   1m',
    '  30m',
    '1;30m',
    '  31m',
    '1;31m',
    '  32m',
    '1;32m',
    '  33m',
    '1;33m',
    '  34m',
    '1;34m',
    '  35m',
    '1;35m',
    '  36m',
    '1;36m',
    '  37m',
    '1;37m'
  ];
  const backgrounds = ['40m', '41m', '42m', '43m', '44m', '45m', '46m', '47m'];

  process.stdout.write(
    '\n                 40m     41m     42m     43m     44m     45m     46m     47m\n'
  );
  foregrounds.forEach(fg => {
    process.stdout.write(' ' + fg + ' \033[' + fg.trim() + '  ' + text + '  ');
    backgrounds.forEach(bg => {
      process.stdout.write(' \033[' + fg.trim() + '\033[' + bg + '  ' + text + '  \033[0m');
    });
    console.log('');
  });
  console.log('');
};

module.exports = {
  outputInfo,
  outputError,
  outputSuccess,
  showColorboard
};
