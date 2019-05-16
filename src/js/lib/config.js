requirejs.config({
    baseUrl: '/assets/js/',

    paths: {
        viewTpl: '/assets/template/'
    },

    map: {
        '*': {
            
        }
    },

    shim: {
        'jquery': {
            exports: 'jQuery'
        }
    }
});