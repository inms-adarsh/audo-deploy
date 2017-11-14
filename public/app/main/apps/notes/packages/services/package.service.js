(function () {
    'use strict';

    angular
        .module('app.notes.packages')
        .factory('NotesPackageService', packageService);

    /** @ngInject */
    function packageService($firebaseArray, $firebaseObject, $q, authService, auth, msUtils, firebaseUtils, dxUtils, config) {
        var tenantId = authService.getCurrentTenant();
        // Private variables

        var service = {
            formOptions: formOptions,
            savePackage: savePackage,
            updatePackage: updatePackage,
            deletePackage: deletePackage,
            fetchPackageList: fetchPackageList
        };

        var quantityList = [{
            id: 0,
            quantity: 6
        }, {
            id: 1,
            quantity: 10
        }, {
            id: 2,
            quantity: 20
        }];

        return service;

        //////////

        /**
         * Return form Item Configuration
         * @returns {Object} Item configuration
         */
        function formOptions() {
            var formOptionsItems = {
                minColWidth: 233,
                colCount: "auto",
                labelLocation: "top",
                validationGroup: "packageData",
                items: [{
                    dataField: 'name',
                    caption: 'Name',
                    validationRules: [{
                        type: 'required',
                        message: 'Name is required'
                    }],
                }, {
                    dataField: 'phone',
                    caption: 'Phone',
                    validationRules: [{
                        type: 'required',
                        message: 'Phone number is required'
                    }],
                    editorType: 'dxNumberBox'
                }, {
                    dataField: 'email',
                    caption: 'Email',
                    validationRules: [{
                        type: 'email',
                        message: 'Please enter valid e-mail address'
                    }]
                }, {
                    dataField: 'source',
                    caption: 'Source'
                }, {
                    dataField: 'date',
                    caption: 'Date',
                    editorType: 'dxDateBox',
                    validationRules: [{
                        type: 'required',
                        message: 'Field is required'
                    }],
                    editorOptions: {
                        width: '100%',
                        onInitialized: function (e) {
                            e.component.option('value', new Date());
                        }
                    }

                }]
            };
            return formOptionsItems;
        }


        /**
         * Save form data
         * @returns {Object} Package Form data
         */
        function savePackage(packageObj) {
            var ref = rootRef.child('tenant-notes-packages');
            packageObj.user = auth.$getAuth().uid;
            if (!packageObj.date) {
                packageObj.date = new Date();
            }
            packageObj.date = packageObj.date.toString();
            return firebaseUtils.addData(ref, packageObj);
        }

        /**
         * Fetch package list
         * @returns {Object} Package data
         */
        function fetchPackageList() {
            var ref = rootRef.child('tenant-notes-packages').orderByChild('deactivated').equalTo(null);
            return firebaseUtils.fetchList(ref);
        }

        /**
         * Fetch package list
         * @returns {Object} Package data
         */
        function updatePackage(key, packageData) {
            var ref = rootRef.child('tenant-notes-packages').child(key['$id']);
            return firebaseUtils.updateData(ref, packageData);
        }

        /**
         * Delete Package
         * @returns {Object} package data
         */
        function deletePackage(key) {
            var ref = rootRef.child('tenant-notes-packages').child(key['$id']);
            return firebaseUtils.updateData(ref, { deactivated: false });
        }

    }
}());