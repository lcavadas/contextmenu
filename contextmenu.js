/*global jQuery:true*/
(function () {
  var ev = new jQuery.Event('remove'),
    orig = jQuery.fn.remove;
  jQuery.fn.remove = function () {
    jQuery(this).trigger(ev);
    return orig.apply(this, arguments);
  };
})();

jQuery.contextmenuGlobalHandler = function () {
  jQuery('.cm-wrapper').remove();
};

jQuery.fn.contextmenu = function (options) {
  var _$this = jQuery(this);
  var _$menuContainer;
  var settings = jQuery.extend({
    offsetX: 0,
    offsetY: 0,
    boundsEl: this,
    options: function () {
      return [
        {
          display: '<span>option 1</span>',
          value: 'op 1'
        },
        {
          display: '<span>optioahsbdlajhsvdjhsvdln 2</span>',
          value: 'op 2',
          suboptions: [
            {
              display: '<span>option 2.1</span>',
              value: 'op 2.1'
            },
            {
              display: '<span>option 2.2</span>',
              value: 'op 2.2',
              suboptions: [
                {
                  display: '<span>option 2.2.1</span>',
                  value: 'op 2.2.1'
                },
                {
                  display: '<span>option 2.2.2</span>',
                  value: 'op 2.2.2'
                }
              ]
            }
          ]
        },
        {
          display: '<span>option 3</span>',
          value: 'op 3',
          suboptions: [
            {
              display: '<span>option 3.1</span>',
              value: 'op 3.1'
            },
            {
              display: '<span>option 3.2</span>',
              value: 'op 3.2'
            }
          ]
        }
      ]
    },
    cb: function (value) {
      window.console.log(value);
    },
    show: function () {
    },
    hide: function () {
    }
  }, options);
  var _invertedX;

  var _hide = function () {
    if (_$menuContainer) {
      _$menuContainer.remove();
    }
  };

  var _show = function (e) {
    e.preventDefault();
    e.stopPropagation();

    var options = settings.options();
    if (options.length === 0) {
      return;
    }

    var parentOffset = _$this.offset();
    jQuery('.cm-wrapper').remove();
    _$menuContainer = jQuery('<div class="cm-wrapper" style="visibility: hidden;width:' + settings.width + 'px;margin-left:' + (e.pageX - parentOffset.left + settings.offsetX) + 'px;margin-top:' + (e.pageY - parentOffset.top + settings.offsetY) + 'px"><ol class="cm-menu"></ol></div>');
    _$menuContainer.on("remove", function () {
      _invertedX = undefined;
      settings.hide.apply(this, arguments)
    });
    _$this.before(_$menuContainer);

    window.setTimeout(function () {
      _showMenu(_$menuContainer, 0);
    }, 1);

    _generateOptions(options, _$menuContainer, 1);

    settings.show();
  };

  var _showMenu = function ($menuContainer, depth, optionHeight, optionWidth) {
    var verticalEdge = $menuContainer.offset().top + $menuContainer.outerHeight();
    var horizontalEdge = $menuContainer.offset().left + $menuContainer.outerWidth();
    var verticalMax = jQuery(settings.boundsEl).offset().top + jQuery(settings.boundsEl).height();
    var horizontalMax = jQuery(settings.boundsEl).offset().left + jQuery(settings.boundsEl).width();

    if (verticalEdge > verticalMax) {
      var vpos = $menuContainer.css('margin-top');
      vpos = parseInt(vpos.substring(0, vpos.length - 2));
      $menuContainer.css('margin-top', (vpos - $menuContainer.outerHeight() + (optionHeight || 0)) + 'px');
    }

    console.log(depth, _invertedX);
    if (horizontalEdge > horizontalMax || depth > _invertedX) {
      var hpos = $menuContainer.css('margin-left');
      hpos = parseInt(hpos.substring(0, hpos.length - 2));
      $menuContainer.css('margin-left', (hpos - $menuContainer.outerWidth() - (optionWidth || 0)) + 'px');
      $menuContainer.addClass('inverted');
      _invertedX = _invertedX ? Math.min(_invertedX, depth) : depth;
    }

    $menuContainer.css('visibility', 'visible');
  };

  var _generateOptions = function (options, $menuContainer, depth) {
    var $menu = $menuContainer.find('ol');
    options.forEach(function (op) {
      var $option = jQuery('<li value="' + op.value + '">' + op.display + '</li>');
      $menu.append($option);
      var $subMenuContainer = $('<div class="cm-wrapper cm-wrapper-' + depth + '" style="visibility: hidden;"><ol class="cm-menu"></ol></div>');
      $menuContainer.append($subMenuContainer);

      $option.click(function (e) {
        settings.cb(op.value);
        if (!op.suboptions) {
          _hide();
        } else {
          e.stopPropagation();
        }
      });

      $option.hover(function () {
        _$menuContainer.find('.cm-wrapper-' + depth).not($subMenuContainer).css('visibility', 'hidden');
        _$menuContainer.find('.cm-wrapper-' + depth).not($subMenuContainer).find('.cm-wrapper').css('visibility', 'hidden');
        $subMenuContainer.css('margin-left', $menuContainer.outerWidth() - parseInt(_$menuContainer.css('border-right-width')));
        $subMenuContainer.css('margin-top', $option.position().top - $menuContainer.outerHeight() + parseInt(_$menuContainer.css('border-top-width')));
        $menu.find('li').removeClass('active');
        if (op.suboptions) {
          $option.addClass('active');
          _showMenu(
            $subMenuContainer,
            depth,
            $option.outerHeight() + parseInt(_$menuContainer.css('border-top-width')) + parseInt(_$menuContainer.css('border-bottom-width')),
            $option.outerWidth() + parseInt(_$menuContainer.css('border-left-width')) + parseInt(_$menuContainer.css('border-right-width'))
          );
        }
      });

      if (op.suboptions) {
        $option.addClass('submenu');
        _generateOptions(op.suboptions, $subMenuContainer, depth + 1);
      }
    });

  };

  var _init = function () {
    jQuery(document.body).unbind("click", jQuery.contextmenuGlobalHandler).bind("click", jQuery.contextmenuGlobalHandler);
    _$this.bind('contextmenu', function (e) {
      _show(e);
    });
  };
  _init();

  return {
    hide: _hide
  };
};
