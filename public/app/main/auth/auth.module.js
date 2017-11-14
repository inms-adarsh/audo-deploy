(function ()
{
    'use strict';

    angular
        .module('app.auth', [
            'app.auth.login',
            'app.auth.register',
            'app.auth.forgot-password',
            'app.auth.lock',
            'app.auth.landing'
        ])
        .config(config);

    /** @ngInject */
    function config(msNavigationServiceProvider)
    {
        
    }
})();