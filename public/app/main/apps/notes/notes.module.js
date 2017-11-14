(function ()
{
    'use strict';

    angular
        .module('app.notes',
            [  
                'dx',
                'ckeditor',
                'app.notes.languages',
                'app.notes.packages',
                'paypal-button'
            ]
        )
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.notes', {
                abstract: true,
                url     : '/notes'
            })
            .state('app.notes.list', {
                url      : '/list',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/notes/views/list-view/notes.html',
                        controller : 'NotesController as vm'
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
                    languages: function(adminService) {
                        return adminService.getLanguages();
                    },
                    packages: function(adminService) {
                        return adminService.getPackages();
                    }
                },
                bodyClass: 'notes'
            })
            .state('app.notes.add', {
                url      : '/add',
                views    : {
                    'content@app': {
                        templateUrl: 'app/main/apps/notes/views/payment/payment.html',
                        controller : 'NotesController as vm'
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
                    },
                    languages: function(adminService) {
                        return adminService.getLanguages();
                    }
                },
                bodyClass: 'notes'
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/apps/notes');

        // Navigation
        // msNavigationServiceProvider.saveItem('apps', {
        //     title : 'Applications',
        //     group : true,
        //     weight: 1
        // });

        // Navigation
        msNavigationServiceProvider.saveItem('notes', {
            title : 'Apps',
            group : true,
            weight: 2
        });

        msNavigationServiceProvider.saveItem('notes.list', {
            title: 'Create Audio Note',
            state: 'app.notes.list',
            weight: 1,
            icon: 'icon-plus'
        });

    
    }
})();