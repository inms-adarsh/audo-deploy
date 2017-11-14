(function ()
{
    'use strict';

    angular
        .module('app.auth.landing', ['dx'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.auth_landing', {
            url      : '/home',
            views    : {
                'main@'                          : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.auth_landing': {
                    templateUrl: 'app/main/auth/landing/landing.html',
                    controller : 'LandingController as vm'
                }
            },
            bodyClass: 'landing'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/auth/landing');

      
    }

})();