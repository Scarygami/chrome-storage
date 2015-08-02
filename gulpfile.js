'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var path = require('path');

var destDir = 'demo-app';

var elemDir = __dirname.split(path.sep).pop();

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  var element = gulp.src([
    './**',
    '!./bower_components/**',
    '!./demo/**',
    '!./demo-app/**',
    '!./node_modules/**',
    '!./test/**',
    '!./test-app/**',
    '!./bower.json',
    '!./gulpfile.js',
    '!./index.html',
    '!./package.json',
    '!./README.md'
  ], {nodir: true}).pipe($.if('*.html', $.crisper()))
    .pipe(gulp.dest(path.join(destDir, 'elements', elemDir)));

  var bower = gulp.src([
    'bower_components/**/*'
  ]).pipe($.if('*.html', $.crisper()))
    .pipe(gulp.dest(path.join(destDir, 'elements')));

  return merge(element, bower)
    .pipe($.size({title: 'copy'}));
});

gulp.task('copy:test', function () {
  var chromeApp = gulp.src([
    './test/chrome-app**'
  ], {nodir: true})
    .pipe(gulp.dest(destDir));

  var testFiles = gulp.src([
    './test/**',
    '!./test/chrome-app/**'
  ], {nodir: true})
    .pipe(gulp.dest(path.join(destDir, 'elements', elemDir, 'test')));

  return merge(chromeApp, testFiles)
    .pipe($.size({title: 'copy:test'}));
});

// Clean Output Directory
gulp.task('clean:test', del.bind(null, ['test-app']));
gulp.task('clean:demo', del.bind(null, ['demo-app']));


gulp.task('build:test', ['clean:test'], function (cb) {
  destDir = 'test-app';
  runSequence(
    'copy',
    'copy:test',
    cb
  );
});

gulp.task('build:demo', ['clean:demo'], function (cb) {
  destDir = 'demo-app';
  runSequence(
    'copy',
    cb
  );
});
