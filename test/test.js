'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const webpHtml = require("../");

const expectedTestsPath = 'expected';

const createVinyl = (filename, contents) => {
    const base = path.join(__dirname, 'src');
    const filePath = path.join(base, filename);

    return new Vinyl({
        cwd: __dirname,
        base,
        path: filePath,
        contents: contents || fs.readFileSync(filePath),
    });
};
const normaliseEOL = (str) => str.toString('utf8').replace(/\r\n/g, '\n');

describe('Tests', () => {
    it('should pass file when it isNull()', (done) => {
        const stream = webpHtml();
        const emptyFile = {
            isNull: () => true,
        };
        stream.on('data', (data) => {
            assert.deepEqual(data, emptyFile);
            done();
        });
        stream.write(emptyFile);
    });

    it('should emit error when file isStream()', (done) => {
        const stream = webpHtml();
        const streamFile = {
            isNull: () => false,
            isStream: () => true,
        };
        stream.on('error', (err) => {
            assert.equal(err.message, 'Streaming not supported');
            done();
        });
        stream.write(streamFile);
    });

    it('should compile an empty html file', (done) => {
        const htmlFile = createVinyl('empty.html');
        const stream = webpHtml();

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'empty.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'empty.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile html file with webp image support', (done) => {
        const htmlFile = createVinyl('webp.html');
        const stream = webpHtml({
            publicPath: __dirname
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'webp.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'webp.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile html file with retina image support', (done) => {
        const htmlFile = createVinyl('retina.html');
        const stream = webpHtml({
            retina: {
                1: '',
                2: '@2x',
                3: '@3x',
                4: '@4x'
            },
            publicPath: __dirname,
            checkExists: true
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'retina.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'retina.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile html file without checking if image files exist', (done) => {
        const htmlFile = createVinyl('nocheck.html');
        const stream = webpHtml({
            retina: {
                2: '@2x'
            },
            checkExists: false
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'nocheck.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'nocheck.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile html file with webp and retina image support for jpeg or jpg files only', (done) => {
        const htmlFile = createVinyl('only_jpeg_jpg.html');
        const stream = webpHtml({
            extensions: ['jpeg', 'jpg'],
            retina: {
                2: '@2x'
            },
            publicPath: __dirname,
            checkExists: false
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'only_jpeg_jpg.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'only_jpeg_jpg.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile html file with webp and retina image support for all supported image types', (done) => {
        const htmlFile = createVinyl('check_all.html');
        const stream = webpHtml({
            extensions: ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'apng', 'gif', 'svg', 'webp',
                'bmp', 'ico', 'cur', 'tif', 'tiff', 'avif'],
            retina: {
                1: '',
                2: '@2x',
            },
            publicPath: __dirname,
            checkExists: false
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'check_all.html');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'check_all.html'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });

    it('should compile php file with webp and retina image support and php code included in img tag', (done) => {
        const htmlFile = createVinyl('php_includes.php');
        const stream = webpHtml({
            retina: {
                2: '@2x',
            },
            publicPath: __dirname,
            checkExists: false
        });

        stream.on('data', (updatedFile) => {
            assert.ok(updatedFile);
            assert.ok(updatedFile.path);
            assert.ok(updatedFile.relative);
            assert.ok(updatedFile.contents);
            assert.equal(path.basename(updatedFile.path), 'php_includes.php');
            const actual = fs.readFileSync(path.join(__dirname, expectedTestsPath, 'php_includes.php'), 'utf8');
            assert.equal(String(normaliseEOL(updatedFile.contents)), normaliseEOL(actual));
            done();
        });
        stream.write(htmlFile);
    });
});
