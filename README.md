# gulp-webp-retina-html

This is a modified version of the plugin [gulp-webp-html](https://www.npmjs.com/package/gulp-webp-html) and [gulp-webp-html-nosvg](https://www.npmjs.com/package/gulp-webp-html-nosvg).
Here was added support for retina images and PHP templates.


## Example
```html
// Input
<img src="/images/catalogImage.jpg" alt="<?php echo 'Image'; ?>">

// Output
<picture>
    <source srcset="/images/catalogImage.webp" type="image/webp">
    <source srcset="/images/catalogImage.jpg 1x, /images/catalogImage@2x.jpg 2x" type="image/jpeg">
    <img src="/images/catalogImage.jpg" alt="<?php echo 'Image'; ?>">
</picture>
```


## Supported extensions
- `.jpg`, `.jpeg`, `.jfif`, `.pjpeg`, `.pjp`
- `.png`, `.apng`
- `.gif`
- `.svg`
- `.webp`
- `.bmp`
- `.ico`, `.cur`
- `.tif`, `.tiff`
- `.avif`


## Install
```bash
npm i --save-dev gulp-webp-retina-html
```


## Usage
```javascript
let webpHtml = require('gulp-webp-retina-html');

gulp.task('html',function(){
    gulp.src('./assets/**/*.html')
        .pipe(webpHtml())
        .pipe(gulp.dest('./public/'))
});

// OR

gulp.task('html',function(){
    gulp.src('./assets/**/*.html')
        .pipe(webpHtml({
            extensions: ['jpg', 'jpeg', 'png', 'gif'],
            retina: {
                1: '',
                2: '@2x',
                3: '@3x',
                4: '@4x'
            },
            checkExists: true,
            noWebp: false,
            publicPath: '.'
        }))
        .pipe(gulp.dest('./public/'))
});
```


## Options

##### extensions

Type: `string[]`<br>
Default: `['jpg', 'jpeg', 'png', 'gif']`

Pass an array of extensions to specify files to process.

##### retina

Type: `object`<br>
Default: `{}`

Pass an object with name patterns for retina images. For example, {1: '', 2: '@2x'}.

##### checkExists

Type: `boolean`<br>
Default: `false`

If true, only files that exist in the directory, specified by the `src` attribute, will be added to the `<picture>` tag.

##### publicPath

Type: `string`<br>
Default: `.`

Public path where to check for image files specified in `src` attribute.

##### noWebp

Type: `boolean`<br>
Default: `false`

If true, disables generate `<source>` tag with webp images.

##### noscriptFallback

Type: `boolean`<br>
Default: `false`

If true, adds a `<noscript>` tag with a fallback image inside if using lazy loading of images with disabled JavaScript.

## Features
Doesn't modify `<img>` elements which are already inside `<picture>`