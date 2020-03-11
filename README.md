# wtcolor

 [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier) ![GitHub](https://img.shields.io/github/license/Crawler995/wtcolor?style=flat)[![codebeat badge](https://codebeat.co/badges/d5f78ecf-3239-460a-9855-852ca6faba38)](https://codebeat.co/projects/github-com-crawler995-wtcolor-master)

A tool that can change color theme of Windows Terminal conveniently and easily!

The default Windows Terminal is nothing like the one on the official video...How can we change its color theme easily? Use `wtcolor`.

The color theme comes from [mbadolato/iTerm2-Color-Schemes]( https://github.com/mbadolato/iTerm2-Color-Schemes ).

[![preview.gif](https://i.postimg.cc/xdKZDm8D/preview.gif)](https://postimg.cc/jWScyLyZ)

## Installation

```bash
npm install -g wtcolor
```

## Usage

```bash
# Use 'wtcolor' in Windows Terminal
wtcolor
```

## Key Point

1. The path of configuration file

   I found [the official documation](https://github.com/microsoft/terminal/blob/2d707f102bf27d455e15dcc6001337a8da6869c2/doc/user-docs/UsingJsonSettings.md) about this:

   > The settings are stored in the file `$env:LocalAppData\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\profiles.json`
   
   So I'm assuming that the configuration file path is the same as above no matter where you downloaded and installed it. **If not**, `wtcolor` gives you the chance to input the path manually. If the given path is correct, it will be saved locally and you don't have to input it again.
   
2. Parsing the configuration file

   The configuration file is `JSON with Comment` which isn't the standard `JSON` format and can't be parsed with `JSON.parse()`. Before `version 0.0.4`, I just removed the line comments simply and parsed it, which may caused bugs. In `version 0.0.5`, I changed to use `comment-json` which has the same interface as `JSON` and can parse `JSON with Comment` to parse the file.

3. Network error sometimes

   Just try it more times.

   The color theme comes from `Github`, so if you are in China the request may be blocked or slowed down by something. As you can see, the requests in my demo is also slowly.

## Thanks

All guys have used `wtcolor`! Hope for your feedback.

