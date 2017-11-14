(function ()
{
    'use strict';

    angular
        .module('app.notes.packages',
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
            .state('app.notes.packages', {
                abstract: true,
                url     : '/packages'
            })
            .state('app.notes.packages.list', {
                url      : '/list',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/notes/packages/views/list-view/packages.html',
                        controller : 'NotesPackagesController as vm'
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
                bodyClass: 'packages'
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/notes/packages');

        // Api
        msApiProvider.register('packages.dashboard', ['app/data/e-commerce/dashboard.json']);
        msApiProvider.register('packages.products', ['app/data/e-commerce/products.json']);
        msApiProvider.register('packages.product', ['app/data/e-commerce/product.json']);
        msApiProvider.register('packages.orders', ['app/data/e-commerce/orders.json']);
        msApiProvider.register('packages.statuses', ['app/data/e-commerce/statuses.json']);
        msApiProvider.register('packages.order', ['app/data/e-commerce/order.json']);

        // Navigation

        msNavigationServiceProvider.saveItem('notes.packages', {
            title: 'Packages',
            state: 'app.notes.packages.list',
            icon: 'icon-person-plus'
        });
    }
})();