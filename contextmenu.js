/*global jQuery:true*/
(function() {
    var ev = new jQuery.Event('remove'),
        orig = jQuery.fn.remove;
    jQuery.fn.remove = function() {
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
        width: 80,
        boundsEl: this,
        options: [
            {
                display: '<span>option 1</span>',
                value: 'op 1'
            },
            {
                display: '<span>option 2</span>',
                value: 'op 2'
            }
        ],
        cb: function (value) {
            window.console.log(value);
        },
        show: function () {
        },
        hide: function () {
        }
    }, options);

    var _hide = function () {
        if (_$menuContainer) {
            _$menuContainer.remove();
        }
    };

    var _show = function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (settings.options.length === 0) {
            return;
        }

        var parentOffset = _$this.offset();
        jQuery('.cm-wrapper').remove();
        _$menuContainer = jQuery('<div class="cm-wrapper" style="visibility: hidden;width:' + settings.width + 'px;margin-left:' + (e.pageX - parentOffset.left + settings.offsetX) + 'px;margin-top:' + (e.pageY - parentOffset.top + settings.offsetY) + 'px"><ol class="cm-menu"></ol></div>');
        _$menuContainer.on("remove", settings.hide);
        var _$menu = _$menuContainer.find('ol');
        _$this.before(_$menuContainer);

        window.setTimeout(function () {
            var verticalEdge = _$menuContainer.offset().top + _$menuContainer.outerHeight();
            var horizontalEdge = _$menuContainer.offset().left + _$menuContainer.outerWidth();
            var verticalMax = jQuery(settings.boundsEl).offset().top + jQuery(settings.boundsEl).height();
            var horizontalMax = jQuery(settings.boundsEl).offset().left + jQuery(settings.boundsEl).width();

            if (verticalEdge > verticalMax) {
                var vpos = _$menuContainer.css('margin-top');
                vpos = parseInt(vpos.substring(0, vpos.length - 2));
                _$menuContainer.css('margin-top', (vpos - _$menuContainer.outerHeight()) + 'px');
            }

            if (horizontalEdge > horizontalMax) {
                var hpos = _$menuContainer.css('margin-left');
                hpos = parseInt(hpos.substring(0, hpos.length - 2));
                _$menuContainer.css('margin-left', (hpos - _$menuContainer.outerWidth()) + 'px');
            }

            _$menuContainer.css('visibility', 'visible');
        }, 1);

        settings.options.forEach(function (op) {
            var _$option = jQuery('<li value="' + op.value + '">' + op.display + '</li>');
            _$menu.append(_$option);
            _$option.click(function () {
                settings.cb(op.value);
                _hide();
            });
        });

        settings.show();
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
