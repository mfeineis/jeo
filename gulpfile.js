/*jshint esnext:true, maxlen:80 */
/*global require */

// Letting babel transform all required modules;
// this enables us to develop the library and 
// the specs with nicer ES6 syntax
require('babel/register');

var gulp = require('gulp');
//var zlib = require('zlib');

var babel = require('gulp-babel');
//var browserify = require('gulp-browserify');
//var concat = require('gulp-concat');
var docco = require('gulp-docco');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var rawRimraf = require('rimraf');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var stripCode = require('gulp-strip-code');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task('tests', function () {
    return gulp.src('./spec/**/*.spec.js')
        .pipe(babel())
        .pipe(jasmine({ verbose: true }));
});

gulp.task('docs', function () {
    return gulp.src('./src/**/*.js')
        .pipe(docco())
        .pipe(gulp.dest('./docs'));
});

gulp.task('clean', function (cb) {
    rawRimraf('./docs', cb);
});

var pjson = require('./package.json');

gulp.task('src', function () {
    return gulp.src('./src/**/*.js')
        .pipe(jshint())
        .pipe(replace('%%NAME%%', pjson.name))
        .pipe(replace('%%AUTHOR%%', pjson.author))
        .pipe(replace('%%LICENSE%%', pjson.license))
        .pipe(replace('%%REPOSITORY%%', pjson.repository))
        .pipe(replace('%%VERSION%%', pjson.version))
        .pipe(replace('%%YEAR%%', new Date().getFullYear()))
        .pipe(rename({
            suffix: '-debug'
        }))
        .pipe(sourcemaps.init())
        .pipe(babel())
        //.pipe(browserify())
        //.pipe(uglify({ preserveComments: 'some' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/latest'))
        .pipe(gulp.dest('./dist/' + pjson.version));
        //.pipe(zlib.createGzip())
        //.pipe(gulp.dest('./dist/latest'));
});

gulp.task('default', ['tests', 'docs', 'src'], function () {
    return gulp.src('./src/**/*.js')
        .pipe(jshint())
        .pipe(replace('%%NAME%%', pjson.name))
        .pipe(replace('%%AUTHOR%%', pjson.author))
        .pipe(replace('%%LICENSE%%', pjson.license))
        .pipe(replace('%%REPOSITORY%%', pjson.repository))
        .pipe(replace('%%VERSION%%', pjson.version))
        .pipe(replace('%%YEAR%%', new Date().getFullYear()))
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(stripCode({
            start_comment: 'DEBUG',
            end_comment: 'DEBUG-END'
        }))
        //.pipe(browserify())
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/latest'))
        .pipe(gulp.dest('./dist/' + pjson.version));
        //.pipe(zlib.createGzip())
        //.pipe(gulp.dest('./dist/latest'));
});
