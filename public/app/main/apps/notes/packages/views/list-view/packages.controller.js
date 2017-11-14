(function () {
    'use strict';

    angular
        .module('app.notes.packages')
        .controller('NotesPackagesController', PackagesController);

    /** @ngInject */
    function PackagesController($state, $scope, msUtils, $mdDialog, $document, $q, $compile, NotesPackageService, dxUtils, authService, firebaseUtils) {
        var vm = this,
            tenantId = authService.getCurrentTenant();;

        // Methods
        vm.addDialog = addDialog;
        vm.editDialog = editDialog;
        init();
        //////////

        vm.deleteRow = function deleteRow(key) {
            var ref = rootRef.child('tenant-package-notes-records').child(tenantId).child(key).child('records').orderByChild(key).equalTo(null);
            firebaseUtils.fetchList(ref).then(function (data) {
                if (data.length > 0) {
                    DevExpress.ui.notify("Can not delete the record");
                }
            })
        };

        vm.packageDataSource = new DevExpress.data.CustomStore();

        function init() {
            var gridOptions = dxUtils.createGrid(),
                packageGridOptions = {
                    dataSource: {
                        load: function () {
                            var defer = $q.defer();
                            NotesPackageService.fetchPackageList().then(function (data) {
                                defer.resolve(data);
                            });
                            return defer.promise;
                        },
                        insert: function (packageObj) {
                            NotesPackageService.savePackage(packageObj);
                        },
                        update: function (key, packageObj) {
                            NotesPackageService.updatePackage(key, packageObj);
                        },
                        remove: function (key) {
                            NotesPackageService.deletePackage(key);
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
                    }, {
                        dataField: 'noOfWords',
                        caption: 'Count',
                        validationRules: [{
                            type: 'required',
                            message: 'Count is required'
                        }]
                    }, {
                        dataField: 'price',
                        caption: 'Price',
                        validationRules: [{
                            type: 'required',
                            message: 'Price is required'
                        }]
                    }],
                    export: {
                        enabled: true,
                        fileName: 'Notes Packages',
                        allowExportSelectedData: true
                    },
                    editing: {
                        allowAdding: true,
                        allowUpdating: true,
                        allowDeleting: true,
                        mode: 'batch'
                    },
                    onRowRemoving: function (e) {
                        var d = $.Deferred();
                        var ref = rootRef.child('tenant-package-notes-records').child(tenantId).child(e.data.$id).child('records').orderByChild('deactivated').equalTo(null);
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

            vm.packageGridOptions = angular.extend(gridOptions, packageGridOptions);
        }

        /**
        * Add New Row
        */
        function addDialog(ev) {
            $mdDialog.show({
                controller: 'PackageDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/admin/packages/views/dialogs/package-dialog.html',
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
                controller: 'PackageDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/apps/packages/views/dialogs/add-edit/edit-dialog.html',
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