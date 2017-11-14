(function () {
  'use strict';

  angular
    .module('app.auth.landing')
    .controller('LandingController', LandingController);

  /** @ngInject */
  function LandingController(auth, $state, $q, $firebaseObject, authService, $scope, $timeout) {
    // Data
    var vm = this,
      formInstance;
    // Methods
    vm.login = login;
    vm.retrieveTenantId = retrieveTenantId;

    vm.features = [{
      icon: 'icon-volume',
      value: 'Volume Changer'
    }, {
      value: 'Supports All polly voices'
    }, {
      value: 'Ability to change voice pitch, volume and speed of reading'
    }, {
      value: 'Ability of speak numerics, dates and many more custom attributes'
    }];

    $scope.showMyAcc = false;
    //////////

    auth.$waitForSignIn().then(function(data) {
      if(data) {
        $scope.showMyAcc = true;
      }
    });
    $scope.loginPopupOptions = {
      contentTemplate: "login",
      showTitle: true,
      width: '500px',
      height: 'auto',
      title: "Login",
      dragEnabled: false,
      closeOnOutsideClick: true,
      bindingOptions: {
        visible: "visibleLoginPopup"
      },
      onHidden: function () {
        formInstance.resetValues();
      }
    };

    $scope.showLogin = function showLogin() {
      this.visibleLoginPopup = true;
    }

    $scope.loginBtnOptions = {
      text: "Login",
      type: "info",
      useSubmitBehavior: true,
      validationGroup: "loginData",
      onClick: function (e) {
        submitForm(e);
      }
    };

    function submitForm(e) {
      var defer = $q.defer();
      var result = e.validationGroup.validate();
      if (result.isValid == true) {
          var formData = formInstance.option('formData');
          var loginData = angular.copy(formData);
          vm.login(loginData);
      }
      return defer.promise;
  }

    $scope.loginForm = {
      colCount: 1,
      onInitialized: function (e) {
        formInstance = e.component;
      },
      validationGroup: "loginData",
      items: [{
        dataField: 'email',
        caption: 'Email',
        validationRules: [{
          type: 'required',
          message: 'Email is required'
        }, {
          type: 'email',
          message: 'Please enter valid e-mail address'
        }]
      }, {
        dataField: "password",
        editorOptions: {
          mode: 'password'
        },
        validationRules: [{
          type: 'required',
          message: 'Please enter your password'
        }]
      }, {
        template: '<a ui-sref="app.auth_forgot-password">Forgot Password?</a>'
      }]
    };

    
    function login(loginForm) {
      auth.$signInWithEmailAndPassword(loginForm.email, loginForm.password)
        .then(function (authData) {
          vm.retrieveTenantId(authData);
          $state.go('app.records.list');
        })
        .catch(function (error) {
          // showError(error);
          console.log("error: " + error);
        });
    }

    function retrieveTenantId(authData) {
      var tenantObj = rootRef.child('users-uid').child(authData.uid);
      var obj = $firebaseObject(tenantObj);
      obj.$loaded().then(function (data) {
        authService.setCurrentTenant(data.tenantId);
      });
    }

    // Methods
    vm.register = register;
    //vm.redirect = redirect;

    //////////
    function register() {
      var user = {
        username: vm.form.username,
        email: vm.form.email,
        password: vm.form.password,
        role: 'superuser'
      };
      authService.registerUser(user).then(function (authData) {
        authService.createProfile(user, authData).then(function (profile) {
          authService.redirect(user, profile, authData);
        });
      });
    }

  }
})();