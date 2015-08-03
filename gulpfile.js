'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var path = require('path');
var tinylr = require('tiny-lr');

// Get folder name (that should match the name of the element)
var elemDir = __dirname.split(path.sep).pop();

// Copy and prepare custom element
var copyTask = function (type, destDir, live) {

  // Scripts necessary for WCT that need to be loaded explicitely for Chrome Apps
  var wctScripts = [
    '<script src="../../stacky/lib/parsing.js"></script>',
    '<script src="../../stacky/lib/formatting.js"></script>',
    '<script src="../../stacky/lib/normalization.js"></script>',
    '<script src="../../async/lib/async.js"></script>',
    '<script src="../../lodash/lodash.js"></script>',
    '<script src="../../mocha/mocha.js"></script>',
    '<script src="../../chai/chai.js"></script>',
    '<script src="../../sinonjs/sinon.js"></script>',
    '<script src="../../sinon-chai/lib/sinon-chai.js"></script>',
    '<script src="../../accessibility-developer-tools/dist/js/axs_testing.js"></script>',
    '<script src="prepare_wct.js"></script>'
  ];

  var copy = gulp.src([
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
    '!./README.md',
    '!./LICENSE'
  ], {nodir: true}).pipe($.if('*.html', $.crisper()));

  if (live) {
    // Insert live-reload script into main demo/test files
    copy = copy.pipe(
      $.if(
        '**/index.html',
        $.insertLines({
          before: /<\/head>/,
          lineBefore: '<script src="../../chrome-app-livereload/livereload.js?host=localhost&amp;port=35729"></script>'
        })
      )
    );
  }

  if (type === 'test') {
    // Insert WCT Scripts in test files
    copy = copy.pipe(
      $.if(
        '**/test/*.html',
        $.insertLines({
          before: /<script\ src="..\/..\/web-component-tester\/browser.js/,
          lineBefore: wctScripts.join('\n')
        })
      )
    );
  }

  copy = copy.pipe(
    gulp.dest(path.join(destDir, 'components', elemDir))
  );

  return copy.pipe($.size({title: 'copy:app'}));
};

gulp.task('copy:test', copyTask.bind(null, 'test', 'test-app', false));
gulp.task('copy:demo', copyTask.bind(null, 'demo', 'demo-app', false));
gulp.task('copy-live:test', copyTask.bind(null, 'test', 'test-app', true));
gulp.task('copy-live:demo', copyTask.bind(null, 'demo', 'demo-app', true));

// copy and prepare dependencies
var bowerTask = function (destDir) {
  return gulp.src([
    'bower_components/**/*'
  ]).pipe($.if('*.html', $.crisper()))
    .pipe(gulp.dest(path.join(destDir, 'components')));
};

gulp.task('bower:test', bowerTask.bind(null, 'test-app'));
gulp.task('bower:demo', bowerTask.bind(null, 'demo-app'));

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


// Setup tiny-lr and watch for changes to rebuild the apps
var watchTask = function (type, destDir) {
  var lr = tinylr();
  lr.listen(35729);

  gulp.watch(['./*', './' + type + '/*'], ['copy-live:' + type]);
  gulp.watch(['./chrome-app/**'], ['app:' + type]);
  gulp.watch(['bower_components/**'], ['bower:' + type]);

  gulp.watch([destDir + '/**'], $.batch({timeout: 500}, function (events, cb) {
    var paths = [];
    events.on('data', function (evt) {
      paths.push(evt.path);
    }).on('end', function () {
      lr.changed({
        body: {
          files: paths
        }
      });
      cb();
    });
  }));
};

gulp.task('watch:test', watchTask.bind(null, 'test', 'test-app'));
gulp.task('watch:demo', watchTask.bind(null, 'demo', 'demo-app'));

// Clean Output Directory
gulp.task('clean:test', del.bind(null, ['test-app']));
gulp.task('clean:demo', del.bind(null, ['demo-app']));


// Main Gulp tasks
gulp.task('build:test', ['clean:test'], function (cb) {
  runSequence(
    ['copy:test', 'bower:test'],
    'app:test',
    cb
  );
});

gulp.task('build:demo', ['clean:demo'], function (cb) {
  runSequence(
    ['copy:demo', 'bower:demo'],
    'app:demo',
    cb
  );
});

gulp.task('live:test', ['clean:test'], function (cb) {
  runSequence(
    ['copy-live:test', 'bower:test'],
    'app:test',
    'watch:test',
    cb
  );
});

gulp.task('live:demo', ['clean:demo'], function (cb) {
  runSequence(
    ['copy-live:demo', 'bower:demo'],
    'app:demo',
    'watch:demo',
    cb
  );
});