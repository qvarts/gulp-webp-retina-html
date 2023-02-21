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
 * @returns {*}
 */
module.exports = function (options) {
	const defaultOptions = {
		extensions: ['jpg', 'jpeg', 'png', 'gif'],
		retina: {},
		publicPath: '.',
		checkExists: false,
    noWebp: false,
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

	return through.obj(function (file, encoding, callback) {

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
					if (fs.existsSync(`${options.publicPath}/${path}`)) {
					  return true;
					}
				} catch(err) {
					this.emit('error', new PluginError(PLUGIN_NAME, err));
				}

				return false;
			}

			// Generates a <picture> block
			const pictureRender = (imgPath, imgExt, imgTag) => {
				
				let imgName = imgPath.replace(`.${imgExt}`, ''); // image full path without extension
				let imgset = new Map();

				if (addWebp) {
					imgset.set('webp', []);

					let webpFiePath = `${imgName}.webp`;

					if (fileExists(webpFiePath)) {
						imgset.get('webp').push(webpFiePath);
					}
				}

				if (addRetina) {
					imgset.set(imgExt, []);

          // Add fallback image path without retina suffix
          let retinaFiePath = `${imgName}.${imgExt}`;
          if (fileExists(retinaFiePath)) {
            imgset.get(imgExt).push(retinaFiePath);
          }

          // Clear imgset if retina 1x option is set
          if (options.retina[1] !== undefined) {
            imgset.get('webp').length = 0;
            imgset.get(imgExt).length = 0;
          }

					for (const prop in options.retina) {
						let webpFiePath = `${imgName}${options.retina[prop]}.webp`;
						let retinaFiePath = `${imgName}${options.retina[prop]}.${imgExt}`;

						if (addWebp && imgExt !== 'webp' && fileExists(webpFiePath)) {
							imgset.get('webp').push(`${imgName}${options.retina[prop]}.webp ${prop}x`);
						}

						if (fileExists(retinaFiePath)) {
							imgset.get(imgExt).push(`${imgName}${options.retina[prop]}.${imgExt} ${prop}x`);
						}
					}
				}

				// If the lazy-load data-src attribute is present, adds the corresponding scrset attribute
				let srcset = ~imgTag.indexOf('data-src') ? "data-srcset" : "srcset";
				
				let source = '';
				imgset.forEach((item, key) => {
					let scrsetPath = item.join(', ');
					if (scrsetPath) {
						source += `<source ${srcset}="${scrsetPath}" type="${supportedFormats[key]}">\n`;
					}
				});

				return (`<picture>\n${source}${imgTag}\n</picture>`)
			};

			let inPicture = false;

			const data = file.contents
				.toString()
				.split('\n')
				.map(function (line) {
					// inside/outside of tag <picture>
					if (~line.indexOf('<picture')) inPicture = true;
					if (~line.indexOf('</picture')) inPicture = false;

					// check image tag <img>
					if (~line.indexOf('<img') && !inPicture) {
						let Re = /<img[[?>]?.*]?src=["'](\S+)["'](?:"[^"]*"|'[^']*'|[^'">])*>/gi
						let regexpArray = Re.exec(line);

            if (!Array.isArray(regexpArray) || regexpArray.length < 2) {
              return line;
            }

						let [imgTag, imgPath] = regexpArray;
						let imgExt = ~imgPath.lastIndexOf(".") ? imgPath.split(".").pop().toLowerCase() : '';

						if (options.extensions.includes(imgExt) && (addWebp || addRetina)) {
							const newTag = pictureRender(imgPath, imgExt, imgTag);
							return line.replace(imgTag, newTag);
						}
					}
					
					return line;
				}).join('\n');

			file.contents = new Buffer.from(data);
			this.push(file);
		} catch (err) {
			this.emit('error', new PluginError(PLUGIN_NAME, err));
		}

		callback();
	})
}