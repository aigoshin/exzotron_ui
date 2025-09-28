angular.module('exzotron')
  .controller('LoginController', ['$scope', '$rootScope', '$cookies', 'toaster', 'AuthProvider', 'UserService', '$window',
    function ($scope, $rootScope, $cookies, toaster, AuthProvider, UserService, $window) {

    $scope.showRegistration = false;
    $scope.showSendPassword = false;
    $scope.username = null;
    $scope.password = null;
    $scope.email = null;

    let langCookie = $cookies.get('org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE');
    let lang = langCookie ? langCookie : 'ru';

    $scope.user = {
      usersName: null,
      usersEmail: null,
      usersPass: null,
      telegram: null,
      firstName: null,
      lastName: null,
      lang: lang
    }

    function initColumns(key, indexes) {
      if (!$window.localStorage.getItem(key)) {
        $window.localStorage.setItem(key, JSON.stringify(indexes.map(function (item) {
          return {meta: {show: false, idx: item}}
        })));
      }
    }

    $scope.submitLoginForm = function (form) {
      if (form.$invalid) {
        return;
      }
      AuthProvider.login({
        username: $scope.username,
        password: $scope.password,
        lang: $scope.user.lang
      }).then(function (response) {


        initColumns('rfidObjectsTable', [3, 9, 10, 13, 14]);
        initColumns('balanceTable', [9, 15, 16, 17, 18, 19, 20]);
        initColumns('balanceTableByObjects', [6, 13, 14, 15, 16, 17]);
        $window.localStorage.setItem("check_license", "true");
        $rootScope.changeLang($scope.user.lang)
      }).catch(function (error) {
        if (error.data && error.data.message) {
          toaster.pop('error', "", error.data.message);
        } else {
          // toaster.pop('error', "", "Пользователь не найден");
        }
      });
    }


    $scope.submitRegistrationForm = function (form) {
      if (form.$invalid) {
        return;
      }
      $scope.user.usersName = $scope.user.usersEmail;
      UserService.request.create($scope.user, function (result) {
        toaster.pop('success', "", "Пользователь создан");
        $rootScope.changeLang($scope.user.lang)
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }

    $scope.sendPassword = function () {
      if (!$scope.email) {
        return;
      }
      UserService.request.sendPassword({email: $scope.email}, function (result) {
        toaster.pop('success', "", "Пароль отправлен на почту");
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }
  }]);
