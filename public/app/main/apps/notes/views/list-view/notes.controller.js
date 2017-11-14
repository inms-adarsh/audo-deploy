(function () {
    'use strict';

    angular
        .module('app.notes')
        .controller('NotesController', NotesController);

    /** @ngInject */
    function NotesController($state, $scope, $timeout, $compile, $mdDialog, $q, $document, authService, firebaseUtils, config, msUtils, dxUtils, noteService, languages, packages) {
        var vm = this,
            formInstance,
            dataGridInstance,
            cartFormInstance;

        // Data
        // Methods
        init();
        //////////

        function init() {
            vm.noteGridOptions = gridOptions('vm.notes', $scope.customers);
        }

        $scope.popupOptions = {
            contentTemplate: "info",
            showTitle: true,
            width: '500px',
            height: 'auto',
            title: "Add Audio Note",
            dragEnabled: false,
            closeOnOutsideClick: true,
            bindingOptions: {
                visible: "visiblePopup"
            },
            onHidden: function () {
                resetValues();
            }
        };

        $scope.cartPopupOptions = {
            contentTemplate: "cart",
            showTitle: true,
            width: '500px',
            height: 'auto',
            title: "Buy More Words",
            dragEnabled: false,
            closeOnOutsideClick: true,
            bindingOptions: {
                visible: "visibleCartPopup"
            },
            onHidden: function () {
                resetCartValues();
            }
        };

        function resetValues() {
            formInstance.resetValues();
        }

        function resetCartValues() {
            cartFormInstance.resetCartValues();
        }

        $scope.buttonOptions = {
            text: "Translate",
            type: "success",
            useSubmitBehavior: true,
            validationGroup: "customerData",
            onClick: function (e) {
                submitForm(e).then(function () {
                    $scope.visiblePopup = false;
                });
            }
        };

        $scope.purchaseBtnOptions = {
            text: "Purchase",
            type: "success",
            useSubmitBehavior: true,
            validationGroup: "cartData",
            onClick: function (e) {
                submitPurchaseForm(e).then(function () {
                    $scope.visibleCartPopup = false;
                });
            }
        };


        $scope.saveNewBttonOptions = {
            text: "Preview (Upto 100 Chars)",
            type: "info",
            icon: 'music',
            useSubmitBehavior: true,
            validationGroup: "customerData",
            onClick: function (e) {
                submitForm(e);
            }
        };

        function submitForm(e) {
            var defer = $q.defer();
            var result = e.validationGroup.validate();
            if (result.isValid == true) {
                var formData = formInstance.option('formData');
                var noteObj = angular.copy(formData);
                var content = CKEDITOR.instances.editor1.getData();
                
                function rep(re, str) {
					content = content.replace(re, str);
				}
				
				rep(/<br.*?\/>/gi, " ");
				rep(/<span [^>]*class="([^">]+)" [^>]*data-rate="([^">]+)">(.*?)<\/span>/gi, '<prosody rate="$2">$3</prosody>');
				rep(/<span [^>]*class="([^">]+)" [^>]*data-pitch="([^">]+)">(.*?)<\/span>/gi, '<prosody pitch="$2">$3</prosody>');
                rep(/<span [^>]*class="([^">]+)" [^>]*data-volume="([^">]+)">(.*?)<\/span>/gi, '<prosody volume="$2">$3</prosody>');
                rep(/<span [^>]*class="([^">]+)" [^>]*data-say="([^">]+)">(.*?)<\/span>/gi, '<say-as interpret-as="$2">$3</say-as>');
                rep(/<span [^>]*title="emphasis: ([^">]+)">(.*?)<\/span>/gi, '<emphasis level="$1">$2</emphasis>');
                
                noteObj.description = '<speak>'+ content +'</speak>';
                noteService.saveNote(noteObj).then(function () {
                    init();
                    dataGridInstance.refresh();
                    resetValues();
                    defer.resolve();
                });
            }
            return defer.promise;
        }

        function submitPurchaseForm(e) {
            var defer = $q.defer();
            var result = e.validationGroup.validate();
            if (result.isValid == true) {
                var formData = cartFormInstance.option('formData');
                var purchaseData = angular.copy(formData);
                noteService.buyCredits(purchaseData).then(function () {
                    init();
                    dataGridInstance.refresh();
                    resetValues();
                    defer.resolve();
                });
            }
            return defer.promise;
        }

        /**
         * Bulk buy form
         * @param {*} customerList 
         * @param {*} beerList 
         */
        vm.bulkgridForm = {
            colCount: 1,
            onContentReady: function (e) {
                formInstance = e.component;
            },
            validationGroup: "customerData",
            items: [{
                dataField: 'date',
                label: {
                    text: 'Date'
                },
                editorType: 'dxDateBox',
                editorOptions: {
                    width: '100%',
                    onInitialized: function (e) {
                        e.component.option('value', new Date());
                    },
                    visible: false
                },
                validationRules: [{
                    type: 'required',
                    message: 'Date is required'
                }],
                visible: false
            }, {
                dataField: 'title',
                caption: 'Title',
                dataType: 'string',
                validationRules: [{
                    type: 'required',
                    message: 'Title is required'
                }]
            }, {
                dataField: 'language',
                label: {
                    text: 'Selected Language'
                },
                name: 'selectedLang',
                editorType: 'dxSelectBox',
                editorOptions: {
                    dataSource: languages,
                    displayExpr: "name",
                    valueExpr: "code",
                    searchExpr: ["name"],
                    onSelectionChanged: function (data) {
                        if (data.selectedItem && data.selectedItem.$id) {
                            formInstance.getEditor('voice').option('dataSource', data.selectedItem.voices);
                        }
                    }
                },
                validationRules: [{
                    type: 'required',
                    message: 'Please select a language'
                }]
            }, {
                dataField: 'voice',
                label: {
                    text: 'Select a voice'
                },
                name: 'voice',
                editorType: 'dxSelectBox',
                editorOptions: {
                    dataSource: [],
                    displayExpr: "Id",
                    valueExpr: "Name",
                    searchExpr: ["Name"]
                },
                validationRules: [{
                    type: 'required',
                    message: 'Please select a voice'
                }]
            }, {
                label: {
                    text: 'Content'
                },
            template: '<div ckeditor="options" ng-model="content" ready="onReady()"></div>'
            }]
        };

        $scope.options = {
            language: 'en'
          };
        
        $scope.packages = packages;
        vm.cartForm = {
            colCount: 1,
            onInitialized: function (e) {
                cartFormInstance = e.component;
            },
            validationGroup: "cartData",
            items: [{
                dataField: 'date',
                label: {
                    text: 'Date'
                },
                editorType: 'dxDateBox',
                editorOptions: {
                    width: '100%',
                    onInitialized: function (e) {
                        e.component.option('value', new Date());
                    },
                    visible: false
                },
                validationRules: [{
                    type: 'required',
                    message: 'Date is required'
                }],
                visible: false
            }, {
                dataField: 'noOfWords',
                label: {
                    text: 'Select a package'
                },
                name: 'noOfWords',
                editorType: 'dxSelectBox',
                validationRules: [{
                    type: 'required',
                    message: 'Please select a value'
                }],
                editorOptions: {
                    dataSource: $scope.packages,
                    displayExpr: "name",
                    valueExpr: "$id",
                    searchExpr: ["name"],
                    itemTemplate: function(itemData, itemIndex, itemElement) {
                        var rightBlock = $("<div style='display:inline-block;'>");
                        rightBlock.append("<p style='font-size:larger;'><b>" + itemData.name + "</b></p>");
                        rightBlock.append("<p>Total Characters: <span>" + itemData.noOfWords + "</span></p>");
                        rightBlock.append("<p>Price: <span>" + itemData.price + "$</span></p>");
                        itemElement.append(rightBlock);
                    }
                }
            }]
        };

        $scope.opts = {
            env: 'sandbox',
            client: {
                sandbox: 'AU1-I1AVQgjkYeX2Zmw-A921SY3svGj4c64fvXwgTur67G-qNiS6ARCjDE8JmeAqBsQjUiKKblStAkQ0',
                production: 'AVZhosFzrnZ5Mf3tiOxAD0M6NHv8pcB2IFNHAfp_h69mmbd-LElFYkJUSII3Y0FPbm7S7lxBuqWImLbl'
            },
            payment: function () {
                var env = this.props.env;
                var client = this.props.client;

                var formData = cartFormInstance.option('formData');

                var index = msUtils.getIndexByArray(packages, '$id', formData.noOfWords);
                return paypal.rest.payment.create(env, client, {
                    transactions: [
                        {
                            amount: { total: packages[index].price, currency: 'USD' }
                        }
                    ]
                });
            },
            commit: true, // Optional: show a 'Pay Now' button in the checkout flow
            onAuthorize: function (data, actions) {
                // Optional: display a confirmation page here
                return actions.payment.execute().then(function () {
                    alert("Payment Successful");
                });
            }
        };
        /**
         * Grid Options for note list
         * @param {Object} dataSource 
         */
        function gridOptions() {
            $scope.gridCols = [{
                dataField: 'date',
                caption: 'Date',
                dataType: 'date',
                validationRules: [{
                    type: 'required',
                    message: 'Date is required'
                }]
            },
            {
                dataField: 'title',
                caption: 'Title',
                dataType: 'string',
                validationRules: [{
                    type: 'required',
                    message: 'Title is required'
                }]
            }, {
                dataField: 'downloadUrl',
                caption: '',
                cellTemplate: function (container, options) {
                    if (options.data.downloadUrl) {
                        $('<a href=' + options.data.downloadUrl + '> Download mp3 </a>').appendTo(container);
                    }
                }

            }];

            var gridOptions = dxUtils.createGrid(),
                otherConfig = {
                    dataSource: {
                        load: function () {
                            var defer = $q.defer();
                            noteService.fetchNoteList().then(function (data) {
                                defer.resolve(data);
                            });
                            return defer.promise;
                        },
                        insert: function (noteObj) {
                            //var data = formInstance.option('formData');
                            noteObj.description = CKEDITOR.instances.editor1.getData()
                            noteService.saveNote(noteObj);
                        },
                        update: function (key, noteObj) {
                            noteService.updateNote(key, noteObj);
                        },
                        remove: function (key) {
                            noteService.deleteNote(key);
                        }
                    },
                    summary: {
                        totalItems: [{
                            column: 'balancedQuantity',
                            summaryType: 'sum',
                            texts: {
                                sum: 'Total Balanced'
                            }
                        }]
                    },
                    editing: {
                        allowAdding: false,
                        allowUpdating: false,
                        allowDeleting: false,
                        mode: 'form'
                    },
                    bindingOptions: {
                        columns: 'gridCols'
                    },
                    scrolling: {
                        useNative: true
                    },
                    selection: {
                        mode: 'none'
                    },
                    export: {
                        enabled: false,
                        fileName: 'Notes',
                        allowExportSelectedData: true
                    },
                    onRowInserted: function () {
                        init();
                        dataGridInstance.repaint();
                        dataGridInstance.refresh();
                    }, onToolbarPreparing: function (e) {
                        // e.toolbarOptions.items.unshift({
                        //     location: "after",
                        //     template: function () {
                        //         return $("<div/>")
                        //             .addClass("informer")
                        //             .append(
                        //             $("<b />")
                        //                 .addClass("count")
                        //                 .text('100 Words')
                        //             );
                        //     }
                        // }, {
                        //         location: "before",
                        //         widget: "dxButton",
                        //         options: {
                        //             text: "Create Audio Note",
                        //             type: "success",
                        //             onClick: function (e) {
                        //                 $scope.visiblePopup = true;
                        //             }
                        //         }
                        //     }, {
                        //         location: "after",
                        //         widget: "dxButton",
                        //         options: {
                        //             text: "Buy More",
                        //             icon: "cart",
                        //             type: "default",
                        //             onClick: function (e) {
                        //                 $scope.visibleCartPopup = true;
                        //             }
                        //         }
                        //     });
                    },
                    onContentReady: function (e) {
                        dataGridInstance = e.component;
                    },
                    onRowPrepared: function (info) {
                        if (info.rowType == 'data' && new Date(info.data.expiryDate).getTime() < new Date().getTime())
                            info.rowElement.addClass("md-red-50-bg");
                    }
                };

            angular.extend(gridOptions, otherConfig);
            return gridOptions;
        }

    }
})();