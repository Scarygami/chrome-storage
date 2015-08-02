'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var path = require('path');

var elemDir = __dirname.split(path.sep).pop();

// Copy custom element and dependencies
var copyTask = function (destDir) {
  var element = gulp.src([
    './**',
    '!./bower_components/**',
    '!./chrome-app/**',
    '!./demo-app/**',
    '!./node_modules/**',
    '!./test-app/**',
    '!./bower.json',
    '!./gulpfile.js',
    '!./index.html',
    '!./package.json',
    '!./README.md'
  ], {nodir: true}).pipe($.if('*.html', $.crisper()))
    .pipe(gulp.dest(path.join(destDir, 'components', elemDir)));

  var bower = gulp.src([
    'bower_components/**/*'
  ]).pipe($.if('*.html', $.crisper()))
    .pipe(gulp.dest(path.join(destDir, 'components')));

  return merge(element, bower)
    .pipe($.size({title: 'copy'}));
};

gulp.task('copy:test', copyTask.bind(null, 'test-app'));
gulp.task('copy:demo', copyTask.bind(null, 'demo-app'));

// Create Chrome App to test/demo the custom element
var createAppTask = function (type, destDir) {
  return gulp.src([
    './chrome-app/**'
  ], {nodir: true})
    .pipe($.replace('_element_', elemDir))
    .pipe($.replace('_type_', type))
    .pipe(gulp.dest(destDir));
};

gulp.task('app:test', createAppTask.bind(null, 'test', 'test-app'));
gulp.task('app:demo', createAppTask.bind(null, 'demo', 'demo-app'));

// Clean Output Directory
gulp.task('clean:test', del.bind(null, ['test-app']));
gulp.task('clean:demo', del.bind(null, ['demo-app']));

gulp.task('build:test', ['clean:test'], function (cb) {
  runSequence(
    'copy:test',
    'app:test',
    cb
  );
});

gulp.task('build:demo', ['clean:demo'], function (cb) {
  runSequence(
    'copy:demo',
    'app:demo',
    cb
  );
});
