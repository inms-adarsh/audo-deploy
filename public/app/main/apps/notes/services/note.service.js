(function () {
    'use strict';

    angular
        .module('app.notes')
        .factory('noteService', noteService);

    /** @ngInject */
    function noteService($rootScope, $firebaseArray, $firebaseObject, $q, authService, auth, firebaseUtils, dxUtils, config) {
        var tenantId = authService.getCurrentTenant(),
            quantityList = [{
                id: 0,
                quantity: 6
            }, {
                id: 1,
                quantity: 10
            }, {
                id: 2,
                quantity: 20
            }];
        // Private variables

        var service = {
            saveNote: saveNote,
            updateNote: updateNote,
            fetchNoteList: fetchNoteList,
            deleteNote: deleteNote
        };

        return service;
        /**
         * Save form data
         * @returns {Object} Note Form data
         */
        function saveNote(noteObj) {
            var ref = rootRef.child('tenant-notes').child(tenantId);
            
            noteObj.user = auth.$getAuth().uid;
            if (!noteObj.date) {
                noteObj.date = new Date();
            }
            noteObj.date = noteObj.date.toString();            
            return firebaseUtils.addData(ref, noteObj);
            //updateKegQuantity();
        }

        function updateKegQuantity() {
            fetchNoteList().then(function (data) {
                data.forEach(function (note) {
                    var ref = rootRef.child('tenant-kegs').child(tenantId).orderByChild('beerSelected').equalTo(note.beerSelected);
                    firebaseUtils.fetchList(ref).then(function (data) {
                        updateDb(data, quantityList[note.quantity].quantity);
                    });
                });
            });

        }


        function hasMin(data, attrib) {
            return data.reduce(function (prev, curr) {
                return prev[attrib] < curr[attrib] ? prev : curr;
            });
        }
        function updateDb(data, quantity) {
            var smallestBrew = hasMin(data, 'LtrsBalanced');
            var ref = rootRef.child('tenant-kegs').child(tenantId).child(smallestBrew['$id']);
            if (smallestBrew.LtrsBalanced < quantity) {
                firebaseUtils.updateData(ref, { 'LtrsBalanced': 0 });
                var index = getIndexByArray(data, 'LtrsBalanced', smallestBrew.LtrsBalanced);
                data.splice(index, 1);
                updateDb(data, quantity - smallestBrew.LtrsBalanced);
            } else {
                var balance = smallestBrew.LtrsBalanced - quantity;
                firebaseUtils.updateData(ref, { 'LtrsBalanced': balance });
            }

        }

        function getIndexByArray(data, key, value) {
            for (var i = 0; i < data.length; i++) {
                if (data[i][key] == value) {
                    return i;
                }
            }
            return -1;
        }

        /**
         * Fetch note list
         * @returns {Object} Note data
         */
        function fetchNoteList() {
            var ref = rootRef.child('tenant-notes').child(tenantId).orderByChild('deactivated').equalTo(null);
            return firebaseUtils.fetchList(ref);
        }

        /**
         * Fetch note list
         * @returns {Object} Note data
         */
        function updateNote(key, noteData) {
            var mergeObj = {};
            mergeObj['tenant-notes/' + tenantId + '/' + key['$id']] = noteData;
            mergeObj['tenant-customer-note-records/' + tenantId + '/' + noteData.customerSelected + '/records/' + key['$id']] = noteData;
            firebaseUtils.updateData(rootRef, mergeObj).then(function (key) {
                var ref = rootRef.child('tenant-customer-note-records').child(tenantId).child(noteData.customerSelected).child('records').orderByChild('deactivated').equalTo(null);
                firebaseUtils.getListSum(ref, 'balancedQuantity').then(function (data) {
                    var mergeObj = {};
                    mergeObj['tenant-customer-note-records/' + tenantId + '/' + noteData.customerSelected + '/balancedQuantity'] = data;
                    firebaseUtils.updateData(rootRef, mergeObj);
                });
            });
            //updateKegQuantity();
        }

        /**
         * Delete Note
         * @returns {Object} note data
         */
        function deleteNote(key) {
            var mergeObj = {};
            mergeObj['tenant-notes/' + tenantId + '/' + key['$id'] + '/deactivated'] = false;
            mergeObj['tenant-customer-note-records/' + tenantId + '/' + key.customerSelected + '/records/' + key['$id'] + '/deactivated'] = false;
            //mergeObj['tenant-note-records-deactivated/'+ tenantId + '/' + key['$id']] = key;
            firebaseUtils.updateData(rootRef, mergeObj).then(function () {
                var ref = rootRef.child('tenant-customer-note-records').child(tenantId).child(key.customerSelected).child('records').orderByChild('deactivated').equalTo(null);
                firebaseUtils.getListSum(ref, 'balancedQuantity').then(function (data) {
                    var mergeObj = {};
                    mergeObj['tenant-customer-note-records/' + tenantId + '/' + key.customerSelected + '/balancedQuantity'] = data;
                    firebaseUtils.updateData(rootRef, mergeObj);
                });
            });
            //updateKegQuantity();
        }

    }
}());