const fs = require('fs');
const PluginError = require('plugin-error');
const through = require('through2');

const PLUGIN_NAME = 'gulp-webp-retina-html';

/**
 * @param {Object} [options] Module options
 * @param {String[]} [options.extensions=['jpg', 'jpeg', 'png', 'gif']] File extensions to be processed
 * @param {Object} [options.retina={}] Retina image name templates for processing (e.g. {1: '', 2: '@2x', 4: '@4x'})
 * @param {String} [options.publicPath='.'] The root directory where the images are stored
 * @param {Boolean} [options.checkExists=false] Checking for file existence
 * @param {Boolean} [options.noWebp=false] If true, disables generate <source> tag with webp images
 * @param {Boolean} [options.noscriptFallback=false] If true, adds a <noscript> tag with a fallback image inside if using lazy loading of images with disabled JavaScript
 * @returns {*}
 */
module.exports = function(options) {
  const defaultOptions = {
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
    retina: {},
    publicPath: '.',
    checkExists: false,
    noWebp: false,
    noscriptFallback: false,
  };

  options = Object.assign(defaultOptions, options);

  const addWebp = (!options.noWebp && options.extensions.length > 0);
  const addRetina = (Object.keys(options.retina).length > 0);
  const supportedFormats = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'jfif': 'image/jpeg',
    'pjpeg': 'image/jpeg',
    'pjp': 'image/jpeg',
    'png': 'image/png',
    'apng': 'image/apng',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'cur': 'image/x-icon',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'avif': 'image/avif',
  };

  // console.log(`Options:`, options);
  // console.log(`addWebp: ${addWebp}`);
  // console.log(`addRetina: ${addRetina}`);

  return through.obj(function(file, encoding, callback) {

    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    try {
      // Checks if a file exists
      const fileExists = path => {
        if (!options.checkExists) return true;

        try {
          if (fs.existsSync(`${ options.publicPath }/${ path }`)) {
            return true;
          }
        }
        catch (err) {
          this.emit('error', new PluginError(PLUGIN_NAME, err));
        }

        return false;
      };

      // Generates a <picture> block
      const pictureRender = (mainImage, fallbackImage) => {

        let { imgPath: mainImgPath, imgExt: mainImgExt, imgTag: mainImgTag } = mainImage;
        let { imgPath: fallbackImgPath } = fallbackImage;

        let mainImgName = mainImgPath.replace(`.${ mainImgExt }`, ''); // image full path without extension
        let imgset = new Map();

        if (addWebp) {
          imgset.set('webp', []);

          let webpFiePath = `${ mainImgName }.webp`;

          if (fileExists(webpFiePath)) {
            imgset.get('webp').push(webpFiePath);
          }
        }

        if (addRetina) {
          imgset.set(mainImgExt, []);

          // Add fallback image path without retina suffix
          let retinaFiePath = `${ mainImgName }.${ mainImgExt }`;
          if (fileExists(retinaFiePath)) {
            imgset.get(mainImgExt).push(retinaFiePath);
          }

          // Clear imgset if retina 1x option is set
          if (options.retina[1] !== undefined) {
            imgset.get('webp').length = 0;
            imgset.get(mainImgExt).length = 0;
          }

          for (const prop in options.retina) {
            let webpFiePath = `${ mainImgName }${ options.retina[prop] }.webp`;
            let retinaFiePath = `${ mainImgName }${ options.retina[prop] }.${ mainImgExt }`;

            if (addWebp && mainImgExt !== 'webp' && fileExists(webpFiePath)) {
              imgset.get('webp').push(`${ mainImgName }${ options.retina[prop] }.webp ${ prop }x`);
            }

            if (fileExists(retinaFiePath)) {
              imgset.get(mainImgExt).push(`${ mainImgName }${ options.retina[prop] }.${ mainImgExt } ${ prop }x`);
            }
          }
        }

        // If the lazy-load data-src attribute is present, adds the corresponding scrset attribute
        let isLazy = ~mainImgTag.indexOf('data-src');
        let srcset = isLazy ? 'data-srcset' : 'srcset';

        // Adding <noscript> tag with an image, if `noscriptFallback` option is set
        let noscript = '';
        if (isLazy && options.noscriptFallback) {
          let srcPattern = /(<img[[?>]?.*]?)([^-]src=["']\S+["'])((?:"[^"]*"|'[^']*'|[^'">])*>)/gi;
          let fallbackImgTag = mainImgTag.replace(srcPattern, '$1$3').replace('data-src', 'src');
          noscript = `<noscript>${ fallbackImgTag }</noscript>\n`;
        }

        // If fallback src attribute is present
        let fallbackSrcset = fallbackImgPath ? ` srcset="${ fallbackImgPath }"` : '';

        let source = '';
        imgset.forEach((item, key) => {
          let scrsetPath = item.join(', ');
          if (scrsetPath) {
            source += `<source ${ srcset }="${ scrsetPath }"${ fallbackSrcset } type="${ supportedFormats[key] }">\n`;
          }
        });

        return (`${ noscript }<picture>\n${ source }${ mainImgTag }\n</picture>`);
      };

      let inPicture = false;

      let data = file.contents.toString().split('\n');
      data = data.map(function(line) {
        // inside/outside of tag <picture>
        if (~line.indexOf('<picture')) inPicture = true;
        if (~line.indexOf('</picture')) inPicture = false;

        // check image tag <img>
        if (~line.indexOf('<img') && !inPicture) {
          let srcPattern = /<img[[?>]?.*]?[^-]src=["'](\S+)["'](?:"[^"]*"|'[^']*'|[^'">])*>/gi;
          let dataSrcPattern = /<img[[?>]?.*]?data-src=["'](\S+)["'](?:"[^"]*"|'[^']*'|[^'">])*>/gi;
          let srcArr = srcPattern.exec(line);
          let dataSrcArr = dataSrcPattern.exec(line);

          let mainImageArr = dataSrcArr === null ? srcArr : dataSrcArr;
          let fallbackImageArr = dataSrcArr === null ? null : srcArr;

          if (!Array.isArray(mainImageArr) || mainImageArr.length < 2) {
            return line;
          }

          let mainImage = {};
          let fallbackImage = {};

          [mainImage['imgTag'], mainImage['imgPath']] = mainImageArr;
          mainImage['imgExt'] = ~mainImage['imgPath'].lastIndexOf('.')
            ? mainImage['imgPath'].split('.').pop().toLowerCase()
            : '';

          if (Array.isArray(fallbackImageArr) && fallbackImageArr.length >= 2) {
            [fallbackImage['imgTag'], fallbackImage['imgPath']] = fallbackImageArr;
            fallbackImage['imgExt'] = ~fallbackImage['imgPath'].lastIndexOf('.')
              ? fallbackImage['imgPath'].split('.').pop().toLowerCase()
              : '';
          }

          if (options.extensions.includes(mainImage['imgExt']) && (addWebp || addRetina)) {
            const newTag = pictureRender(mainImage, fallbackImage);
            return line.replace(mainImage['imgTag'], newTag);
          }
        }

        return line;
      });

      file.contents = new Buffer.from(data.join('\n'));
      this.push(file);
    }
    catch (err) {
      this.emit('error', new PluginError(PLUGIN_NAME, err));
    }

    callback();
  });
};