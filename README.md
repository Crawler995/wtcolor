# wtcolor

[![Build Status](https://travis-ci.com/Crawler995/wtcolor.svg?branch=master)](https://travis-ci.com/Crawler995/wtcolor) [![codecov](https://codecov.io/gh/Crawler995/wtcolor/branch/master/graph/badge.svg)](https://codecov.io/gh/Crawler995/wtcolor) ![GitHub](https://img.shields.io/github/license/Crawler995/wtcolor?style=flat) [![codebeat badge](https://codebeat.co/badges/d5f78ecf-3239-460a-9855-852ca6faba38)](https://codebeat.co/projects/github-com-crawler995-wtcolor-master)

A tool that can change color theme of Windows Terminal conveniently and easily!

The default Windows Terminal is nothing like the one on the official video...How can we change its color theme easily? Use `wtcolor`.

The color theme comes from [mbadolato/iTerm2-Color-Schemes]( https://github.com/mbadolato/iTerm2-Color-Schemes ).

![](https://pic.downk.cc/item/5e718dcae83c3a1e3a993495.gif)

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
   

## Thanks

All guys have used `wtcolor`! Hope for your feedback.

