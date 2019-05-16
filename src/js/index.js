define([
    'viewTpl/indexTpl'
], function (indexTpl) {
    'use strict';
    var app = {
        init() {
            this.renderDom();
           
        },

        renderDom() {
            var self = this;
            $.getJSON('/assets/data/url.json', function (res) {
                $('#demoList').html(indexTpl(res));
                self.event();
            })
        },

        event() {
            var chooseDemo = '[data-action="chooseDemo"]'
            $(document).off('click.chooseDemo.animation').on('click.chooseDemo.animation', chooseDemo, function (e) {
                var demoSrc = $(this).attr('data-src');
                $(chooseDemo).removeClass('active')
                $(this).addClass('selected active');
                $('iframe').attr('src', '/assets/example/' + demoSrc);
            });

            $(chooseDemo).eq(0).click()
        }
    }

    return app;
});