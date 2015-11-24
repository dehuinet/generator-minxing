'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message', 
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('welcome to minxing'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'oa',
        value: 'includeOA',
        checked: true
      }, {
        name: 'hotview',
        value: 'includeHotView',
        checked: true
      }]
    }, {
      type: 'confirm',
      name: 'includeZepto',
      message: 'Would you like to include zepto?',
      default: true
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeOA = hasFeature('includeOA');
      this.includeHotView = hasFeature('includeHotView');
      this.includeZepto = answers.includeZepto;

      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.fs.copyTpl(
        this.templatePath('gulpfile.babel.js'),
        this.destinationPath('gulpfile.babel.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeOA: this.includeOA,
          includeHotView: this.includeHotView,
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'));
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeZepto) {
        bowerJson.dependencies['zepto'] = '~1.1.6';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    config: function () {
      this.fs.copy(
        this.templatePath('config.properties'),
        this.destinationPath('app/www/config.properties')
      );
    },

    plugin: function () {
      this.fs.copy(
        this.templatePath('plugin.properties'),
        this.destinationPath('app/plugin.properties')
      );
    },

    oa: function () {
      if (this.includeOA) {
        this.fs.copy(
          this.templatePath('oa'),
          this.destinationPath('app/www/oa')
        );
      }
    },

    hotview: function () {
      if (this.includeHotView) {
        this.fs.copy(
          this.templatePath('hotview'),
          this.destinationPath('app/www/hotview')
        );
      }
    },

    widget: function () {
      if (!this.includeOA && !this.includeHotView || (this.includeOA && this.includeHotView)) {
        this.fs.copy(
          this.templatePath('widget'),
          this.destinationPath('app/www/widget')
        );
      }
    },

    welcome: function () {
      this.fs.copy(
        this.templatePath('welcome'),
        this.destinationPath('app/www/welcome')
      );
    },

    debugGap: function () {
      this.fs.copy(
        this.templatePath('debugGap'),
        this.destinationPath('app/www/debugGap')
      );
    },

    html: function () {
      var bsPath;

      // path prefix for Bootstrap JS files
      if (this.includeOA || this.includeHotView) {
        bsPath = '/bower_components/';

      }
      if(this.includeOA){
        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('app/www/index.html'),
          {
            appname: this.appname,
            includeZepto: this.includeZepto,
            widget: true,
            oa: true,
            hotview: false,
            bsPath: bsPath,
            bsPlugins: [
              'affix',
              'alert',
              'dropdown',
              'tooltip',
              'modal',
              'transition',
              'button',
              'popover',
              'carousel',
              'scrollspy',
              'collapse',
              'tab'
            ]
          }
        );
      }
      if(this.includeHotView){
        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('app/www/index.html'),
          {
            appname: this.appname,
            includeZepto: this.includeZepto,
            widget: true,
            oa: false,
            hotview: true,
            bsPath: bsPath,
            bsPlugins: [
              'affix',
              'alert',
              'dropdown',
              'tooltip',
              'modal',
              'transition',
              'button',
              'popover',
              'carousel',
              'scrollspy',
              'collapse',
              'tab'
            ]
          }
        );
      }
      if(this.includeOA && this.includeHotView){
        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('app/www/index.html'),
          {
            appname: this.appname,
            includeZepto: this.includeZepto,
            widget: true,
            oa: true,
            hotview: true,
            bsPath: bsPath,
            bsPlugins: [
              'affix',
              'alert',
              'dropdown',
              'tooltip',
              'modal',
              'transition',
              'button',
              'popover',
              'carousel',
              'scrollspy',
              'collapse',
              'tab'
            ]
          }
        );
      }
      if(!this.includeOA && !this.includeHotView){
        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('app/www/index.html'),
          {
            appname: this.appname,
            includeZepto: this.includeZepto,
            widget: true,
            oa: false,
            hotview: false,
            bsPath: bsPath,
            bsPlugins: [
              'affix',
              'alert',
              'dropdown',
              'tooltip',
              'modal',
              'transition',
              'button',
              'popover',
              'carousel',
              'scrollspy',
              'collapse',
              'tab'
            ]
          }
        );
      }
    },
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    var howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/www/index.html'
    });
  }
});
