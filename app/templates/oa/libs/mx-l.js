
(function($){
  var $win = $(window);
var $doc = $(document);
var scrollPos;
var OffCanvas = function(element, options) {
  this.$element = $(element);
  this.options = $.extend({}, OffCanvas.DEFAULTS, options);
  this.active = null;
  // this.bindEvents();
};
var UI = $.AMUI || {};
var $win = $(window);
var doc = window.document;
var $html = $('html');

UI.support = {};

UI.support.transition = (function() {
  var transitionEnd = (function() {
    var element = doc.body || doc.documentElement;
    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (element.style[name] !== undefined) {
        return transEndEventNames[name];
      }
    }
  })();

  return transitionEnd && {end: transitionEnd};
})();
OffCanvas.DEFAULTS = {
  duration: 300,
  effect: 'overlay' // {push|overlay}, push is too expensive
};

OffCanvas.prototype.open = function(relatedElement) {
  var _this = this;
  var $element = this.$element;

  if (!$element.length || $element.hasClass('mxin-active')) {
    return;
  }

  var effect = this.options.effect;
  var $html = $('html');
  var $body = $('body');
  var $bar = $element.find('.mxin-offcanvas-bar').first();
  var dir = $bar.hasClass('mxin-offcanvas-bar-flip') ? -1 : 1;

  $bar.addClass('mxin-offcanvas-bar-' + effect);

  scrollPos = {x: window.scrollX, y: window.scrollY};

  $element.addClass('mxin-active');

  $body.css({
    width: window.innerWidth,
    height: $win.height()
  }).addClass('mxin-offcanvas-page');

  if (effect !== 'overlay') {
    $body.css({
      'margin-left': $bar.outerWidth() * dir
    }).width(); // force redraw
  }

  $html.css('margin-top', scrollPos.y * -1);

  setTimeout(function() {
    $bar.addClass('mxin-offcanvas-bar-active').width();
  }, 0);

  $element.trigger('open.offcanvas.amui');

  this.active = 1;

  // Close OffCanvas when none content area clicked
  $element.on('click.offcanvas.amui', function(e) {
    var $target = $(e.target);

    if ($target.hasClass('mxin-offcanvas-bar')) {
      return;
    }

    if ($target.parents('.mxin-offcanvas-bar').first().length) {
      return;
    }
    e.stopImmediatePropagation();

    _this.close();
  });

  $html.on('keydown.offcanvas.amui', function(e) {
    (e.keyCode === 27) && _this.close();
  });
};
$.fn.emulateTransitionEnd = function(duration) {
  var called = false;
  var $el = this;

  $(this).one(UI.support.transition.end, function() {
    called = true;
  });

  var callback = function() {
    if (!called) {
      $($el).trigger(UI.support.transition.end);
    }
    $el.transitionEndTimmer = undefined;
  };
  this.transitionEndTimmer = setTimeout(callback, duration);
  return this;
};

OffCanvas.prototype.close = function(relatedElement) {
  var _this = this;
  var $html = $('html');
  var $body = $('body');
  var $element = this.$element;
  var $bar = $element.find('.mxin-offcanvas-bar').first();

  if (!$element.length || !this.active || !$element.hasClass('mxin-active')) {
    return;
  }

  $element.trigger('close.offcanvas.amui');

  function complete() {
    $body
      .removeClass('mxin-offcanvas-page')
      .css({
        width: '',
        height: '',
        'margin-left': '',
        'margin-right': ''
      });
    $element.removeClass('mxin-active');
    $bar.removeClass('mxin-offcanvas-bar-active');
    $html.css('margin-top', '');
    window.scrollTo(scrollPos.x, scrollPos.y);
    $element.trigger('closed.offcanvas.amui');
    _this.active = 0;
  }

  if (UI.support.transition) {
    setTimeout(function() {
      $bar.removeClass('mxin-offcanvas-bar-active');
    }, 0);

    $body.css('margin-left', '').one(UI.support.transition.end, function() {
      complete();
    }).emulateTransitionEnd(this.options.duration);
  } else {
    complete();
  }

  $element.off('click.offcanvas.amui');
  $html.off('.offcanvas.amui');
};


function Plugin(option, relatedElement) {
  var args = Array.prototype.slice.call(arguments, 1);

  return this.each(function() {
    var $this = $(this);
    var data = $this.data('amui.offcanvas');
    var options = $.extend({}, typeof option == 'object' && option);

    if (!data) {
      $this.data('amui.offcanvas', (data = new OffCanvas(this, options)));
      (!option || typeof option == 'object') && data.open(relatedElement);
    }

    if (typeof option == 'string') {
      data[option] && data[option].apply(data, args);
    }
  });
}

$.fn.offCanvas = Plugin;
}(jQuery))
