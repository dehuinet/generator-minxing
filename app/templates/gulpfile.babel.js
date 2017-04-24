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
var path = require('path');
var gulp = require('gulp');
var fs = require('fs');
var eslint = require('gulp-eslint');
var postcss = require('gulp-postcss');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var header = require('gulp-header');
var nano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var rename = require('gulp-rename');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var coveralls = require('gulp-coveralls');
var   connect = require('gulp-connect');
var tap = require('gulp-tap');
var pkg = require('./package.json');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var yargs = require('yargs')
    .options({
        'w': {
            alias: 'watch',
            type: 'boolean'
        },
        's': {
            alias: 'server',
            type: 'boolean'
        },
        'p': {
            alias: 'port',
            type: 'number'
        }
    }).argv;
var dist = __dirname + '/dist';
var option = {base: 'app/www/widget'};
gulp.task('static', function () {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
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
gulp.task('build:style', function (){
    var banner = [
        '/*!',
        ' * WeUI v<%= pkg.version %> (<%= pkg.homepage %>)',
        ' * Copyright <%= new Date().getFullYear() %> Tencent, Inc.',
        ' * Licensed under the <%= pkg.license %> license',
        ' */',
        ''].join('\n');
    gulp.src('app/www/widget/styles/style/mx.less', option)
        .pipe(sourcemaps.init())
        .pipe(less().on('error', function (e) {
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(dist))
        .pipe(browserSync.reload({stream: true}))
        .pipe(nano({
            zindex: false,
            autoprefixer: false
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(gulp.dest(dist));
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
gulp.task('build:example:assets', function (){
    gulp.src('app/www/widget/**/*.?(png|jpg|gif|js)', option)
        .pipe(gulp.dest(dist))
        .pipe(connect.reload())
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('build:example:style', function (){
    gulp.src('app/www/widget/styles/style/example.less', option)
        .pipe(less().on('error', function (e){
            console.error(e.message);
            this.emit('end');
        }))
        .pipe(postcss([autoprefixer(['iOS >= 7', 'Android >= 4.1'])]))
        .pipe(nano({
            zindex: false,
            autoprefixer: false
        }))
        .pipe(gulp.dest(dist))
        .pipe(connect.reload())
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('build:example:html', function (){
    gulp.src('app/www/widget/index.html',option)
        .pipe(tap(function (file){
            var dir = path.dirname(file.path);
            var contents = file.contents.toString();
            contents = contents.replace(/<link\s+rel="import"\s+href="(.*)">/gi, function (match, $1){
                var filename = path.join(dir, $1);
                var id = path.basename(filename, '.html');
                var content = fs.readFileSync(filename, 'utf-8');
                return '<script type="text/html" id="tpl_'+ id +'">\n'+ content +'\n</script>';
            });
            file.contents = new Buffer(contents);
        }))
        .pipe(gulp.dest(dist))
        .pipe(connect.reload())
        .pipe(browserSync.reload({stream: true}));
});
gulp.task('build:example', ['build:example:assets', 'build:example:style', 'build:example:html']);

gulp.task('release', ['build:style', 'build:example']);
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
gulp.task('server', function () {
    yargs.p = yargs.p || 9000;
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        ui: {
            port: yargs.p + 1,
            weinre: {
                port: yargs.p + 2
            }
        },
        port: yargs.p,
    });
})
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
gulp.task('default', ['watch','release'], function () {
    if (yargs.s) {
        gulp.start('server');
    }

    if (yargs.w) {
        gulp.start('watch');
    }
});