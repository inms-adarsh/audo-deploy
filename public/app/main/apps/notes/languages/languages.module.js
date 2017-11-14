(function ()
{
    'use strict';

    angular
        .module('app.notes.languages',
            [
                // 3rd Party Dependencies
                'dx'
            ]
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.notes.languages', {
                abstract: true,
                url     : '/languages'
            })
            .state('app.notes.languages.list', {
                url      : '/list',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/notes/languages/views/list-view/languages.html',
                        controller : 'NotesLanguagesController as vm'
                    }
                },
                 resolve : {
                    currentAuth: ["auth", function (auth) {
                        // returns a promisse so the resolve waits for it to complete
                        return auth.$requireSignIn();
                    }],
                    tenantInfo: function(auth, authService){
                        return authService.retrieveTenant();
                    },
                    settings: function(adminService) {
                        return adminService.getCurrentSettings();
                    }
                },
                bodyClass: 'languages'
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/notes/languages');

        // Api
        msApiProvider.register('languages.dashboard', ['app/data/e-commerce/dashboard.json']);
        msApiProvider.register('languages.products', ['app/data/e-commerce/products.json']);
        msApiProvider.register('languages.product', ['app/data/e-commerce/product.json']);
        msApiProvider.register('languages.orders', ['app/data/e-commerce/orders.json']);
        msApiProvider.register('languages.statuses', ['app/data/e-commerce/statuses.json']);
        msApiProvider.register('languages.order', ['app/data/e-commerce/order.json']);

        // Navigation

        msNavigationServiceProvider.saveItem('notes.languages', {
            title: 'Languages',
            state: 'app.notes.languages.list',
            icon: 'icon-person-plus'
        });
    }
})();