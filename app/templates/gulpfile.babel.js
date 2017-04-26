// generated on <%= date %> using <%= name %> <%= version %>
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var Q = require('q');
var request = require('request');
var zip = require('gulp-zip');
var fs = require('fs')
var publishConfig = require('./publish.json');

//将www下面的文件自动打包成.zip压缩包
gulp.task('zip', () => {
    return gulp.src(['app/**', 'app/plugin.properties'])
      .pipe(zip('www.zip'))
      .pipe(gulp.dest('dist'));
});

//发布(将dist文件夹下面的www.zip进行上传到服务器)
gulp.task('publish',function() {
  var delay = Q.defer();
  //获取配置文件的一些参数
  var app_id = publishConfig.app_id;
  var server_url = publishConfig.url;
  var access_token = publishConfig.access_token;
  var description = publishConfig.description;
  var mandatory_upgrade = publishConfig.mandatory_upgrade;
  var formData = {
    app_version_file: fs.createReadStream('dist/www.zip'),
    app_id: app_id,
    description: description,
    mandatory_upgrade: mandatory_upgrade
  };
  var options = {
    url: server_url + '/client_upload_app',
    headers: {
      'AUTHORIZATION': 'bearer ' + access_token
    },
    formData: formData
  };
  request.post(options , function(err, r, body) {
    if (!err && r && r.statusCode === 200) {
      console.log(JSON.parse(body).message)
      delay.resolve(body);
    } else {
      console.log(JSON.parse(body).error)
      delay.reject();
    }
  });
  return delay.promise;
});
gulp.task('styles', () => {
  return gulp.src('app/www/styles/*.css')
    .pipe($.sourcemaps.init())
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true})); 
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
<% if (testFramework === 'mocha') { -%>
    mocha: true
<% } else if (testFramework === 'jasmine') { -%>
    jasmine: true
<% } -%>
  }
};

gulp.task('lint', lint('app/www/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/www/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/www/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/www/*.*',
    '!app/www/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app/www/'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/www/*.html',
    'app/www/scripts/**/*.js',
    'app/www/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/www/styles/**/*.css', ['styles']);
  gulp.watch('app/www/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': 'app/www/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
