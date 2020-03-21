# vue-audio-better

[![npm](https://img.shields.io/badge/npm-v1.1.2-blue)](https://www.npmjs.com/package/vue-audio-better) [![vue2](https://img.shields.io/badge/vue-2.x-green)](https://vuejs.org/)

> Easy to create custom audio player components for Vue.js.

> A progress bar with soul.

> 一个有灵魂的进度条。

> 简单、有趣的 audio 组件，非常感谢您的 star.

## Overview

![demo](https://upload-images.jianshu.io/upload_images/14529741-470e99c10ca2103d.png?imageMogr2/auto-orient/strip|imageView2/2/w/372/format/webp)

## Installation

```bash
npm install  vue-audio-better --save
```

## Update

Modify README.md

## Setup

### Bundler (Webpack, Rollup)

```js
// in your entrypoint
import Vue from 'vue'
import VueAudio from 'vue-audio-better'

Vue.use(VueAudio)
```

## Usage

### Required Markup

```js

  <vue-audio
    src="https://example.com/some_audio.mp3"
  ></vue-audio>

```

## Props

### `width`

Type: `Number` - Default: `500`

Audio width

### `src`

Type: `String` - Required

An string of audio file url

### `html5`

Type: `Boolean` - Default: `false`

Whether to force HTML5 Audio

### `loop`

Type: `Boolean` - Default: `false`

Whether to start the playback again
automatically after it is done playing

### `preload`

Type: `Boolean` - Default: `true`

Whether to start downloading the audio
file when the component is mounted

### `autoplay`

Type: `Boolean` - Default: `false`

Whether to start the playback
when the component is mounted

### `formats`

Type: `String[]` - Default: `[]`

Howler.js automatically detects your file format from the extension,
but you may also specify a format in situations where extraction won't work
(such as with a SoundCloud stream)

### `xhrWithCredentials`

Type: `Boolean` - Default: `false`

Whether to enable the `withCredentials` flag on XHR requests
used to fetch audio files when using Web Audio API ([see reference](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials))

## Development

### Build

Bundle the js to the `dist` folder:

```bash
npm run build
```

## Acknowledgements

[howler.js](https://github.com/goldfire/howler.js)
[vue-howler](https://github.com/mickdekkers/vue-howler)

## License

[MIT](http://opensource.org/licenses/MIT)
