(function () {
    'use strict';

    angular
        .module('app.notes.languages')
        .controller('NotesLanguagesController', LanguagesController);

    /** @ngInject */
    function LanguagesController($state, $scope, msUtils, $mdDialog, $document, $q, $compile, NotesLanguageService, dxUtils, authService, firebaseUtils) {
        var vm = this,
            tenantId = authService.getCurrentTenant();;
        
        // Methods
        vm.addDialog = addDialog;
        vm.editDialog = editDialog;
        init();
        //////////

        vm.deleteRow = function deleteRow(key) {
            var ref = rootRef.child('tenant-language-notes-records').child(tenantId).child(key).child('records').orderByChild(key).equalTo(null);
            firebaseUtils.fetchList(ref).then(function (data) {
                if (data.length > 0) {
                    DevExpress.ui.notify("Can not delete the record");
                }
            })
        };

        vm.languageDataSource = new DevExpress.data.CustomStore();

        function init() {
            var gridOptions = dxUtils.createGrid(),
                languageGridOptions = {
                    dataSource: {
                        load: function () {
                            var defer = $q.defer();
                            NotesLanguageService.fetchLanguageList().then(function (data) {
                                defer.resolve(data);
                            });
                            return defer.promise;
                        },
                        insert: function (languageObj) {
                            NotesLanguageService.saveLanguage(languageObj);
                        },
                        update: function (key, languageObj) {
                            NotesLanguageService.updateLanguage(key, languageObj);
                        },
                        remove: function (key) {
                            NotesLanguageService.deleteLanguage(key);
                        }
                    },
                    summary: {
                        totalItems: [{
                            column: 'name',
                            summaryType: 'count'
                        }]
                    },
                    columns: [{
                        dataField: 'name',
                        caption: 'Name',
                        validationRules: [{
                            type: 'required',
                            message: 'Name is required'
                        }]
                    }, {
                        dataField: 'code',
                        caption: 'Code',
                        validationRules: [{
                            type: 'required',
                            message: 'Code is required'
                        }]
                    }],
                    export: {
                        enabled: true,
                        fileName: 'Notes Languages',
                        allowExportSelectedData: true
                    },
                    editing: {
                        allowAdding: true,
                        allowUpdating: true,
                        allowDeleting: true,
                        mode: 'batch'
                    },
                    onRowRemoving: function(e) {
                        var d = $.Deferred();
                        var ref = rootRef.child('tenant-language-notes-records').child(tenantId).child(e.data.$id).child('records').orderByChild('deactivated').equalTo(null);
                        firebaseUtils.fetchList(ref).then(function (data) {
                            if (data.length > 0) {
                                d.reject("Can not delete the record");
                            } else {
                                d.resolve();
                            }
                        });
                        e.cancel = d.promise();
                    }                    
                };

            vm.languageGridOptions = angular.extend(gridOptions, languageGridOptions);
        }

        /**
        * Add New Row
        */
        function addDialog(ev) {
            $mdDialog.show({
                controller: 'LanguageDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/admin/languages/views/dialogs/language-dialog.html',
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    dialogData: {
                        dialogType: 'add'
                    }
                }
            });
        }

        /**
         * Edit Dialog
         */
        function editDialog(ev, formView, formData) {
            $mdDialog.show({
                controller: 'LanguageDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/languages/views/dialogs/add-edit/edit-dialog.html',
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    dialogData: {
                        chartData: vm.data,
                        dialogType: 'edit',
                        formView: formView,
                        formData: formData
                    }
                }
            });
        }

    }
})();