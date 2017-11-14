(function () {
    'use strict';

    angular
        .module('app.notes.languages')
        .factory('NotesLanguageService', languageService);

    /** @ngInject */
    function languageService($firebaseArray, $firebaseObject, $q, authService, auth, msUtils, firebaseUtils, dxUtils, config) {
        var tenantId = authService.getCurrentTenant();
        // Private variables

        var service = {
            formOptions: formOptions,
            saveLanguage: saveLanguage,
            updateLanguage: updateLanguage,
            deleteLanguage: deleteLanguage,
            fetchLanguageList: fetchLanguageList
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
                validationGroup: "languageData",
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
         * @returns {Object} Language Form data
         */
        function saveLanguage(languageObj) {
            var ref = rootRef.child('tenant-notes-languages');
            languageObj.user = auth.$getAuth().uid;
            if (!languageObj.date) {
                languageObj.date = new Date();
            }
            languageObj.date = languageObj.date.toString();
            return firebaseUtils.addData(ref, languageObj);
        }

        /**
         * Fetch language list
         * @returns {Object} Language data
         */
        function fetchLanguageList() {
            var ref = rootRef.child('tenant-notes-languages').orderByChild('deactivated').equalTo(null);
            return firebaseUtils.fetchList(ref);
        }

        /**
         * Fetch language list
         * @returns {Object} Language data
         */
        function updateLanguage(key, languageData) {
            var ref = rootRef.child('tenant-notes-languages').child(key['$id']);
            return firebaseUtils.updateData(ref, languageData);
        }

        /**
         * Delete Language
         * @returns {Object} language data
         */
        function deleteLanguage(key) {
            var ref = rootRef.child('tenant-notes-languages').child(key['$id']);
            return firebaseUtils.updateData(ref, { deactivated: false });
        }

    }
}());