angular.module('exzotron')
  .controller('NavbarController', ['$scope', '$rootScope', '$cookies', 'UserService', 'AccountService', 'toaster', 'ObjectService', 'DivisionService', 'PartnerService', '$filter', '$window', 'ModalService',
    function ($scope, $rootScope, $cookies, UserService, AccountService, toaster, ObjectService, DivisionService, PartnerService, $filter, $window, ModalService) {

      $scope.showLicenseModal = function () {
        let licenseCheck = $window.localStorage.getItem("check_license");
        if (licenseCheck) {
          ObjectService.getExpiredLicenses({}, function (result) {
            if (!result || !result.length) {
              return;
            }
            let customOptions = {
              animation: false,
              templateUrl: 'static/src/tpl/expired_licenses_modal.html',
              backdrop: 'static',
              windowClass: 'form-modal',
              size: 'lg',
              resolve: {
                data: function () {
                  return {
                    items: result
                  }
                }
              },
              controller: ['$scope', 'data', '$uibModalInstance', function ($scope, data, $uibModalInstance) {
                $scope.items = data.items;
                $scope.now = moment();
                $scope.dateDiff = function (date) {
                  const duration = moment.duration(moment($scope.now).diff(date));
                  return parseInt(duration.asDays());
                }
                $scope.cancel = function () {
                  $uibModalInstance.close();
                };
              }]
            }
            ModalService.showModal(customOptions, {}).then(function (result) {
              $window.localStorage.setItem("check_license", "")
            });
          }, function (error) {

          });
        }
      };

      $scope.showLicenseModal();

    $rootScope.currentUser = null;
    $rootScope.accountData = null;

    let langCookie = $cookies.get('org.springframework.web.servlet.i18n.CookieLocaleResolver.LOCALE');
    var lang = langCookie ? langCookie : 'ru';

    $scope.languages = $rootScope.languages;
    $scope.ui = {
      dateToOpened: false,
      dateFromOpened: false,
      dateFrom: moment(new Date().setHours(0, 0, 0, 0)).format('YYYY-MM-DD HH:mm:ss'),
      dateTo: moment(new Date().setHours(23, 59, 59, 0)).format('YYYY-MM-DD HH:mm:ss'),
      format: 'dd-MM-yy',
      lang: lang,
      search: '',
      showPeriodDropDown: false
    }

    $scope.ranges = [
      {label: $filter('translate')('LAST_3_H'), start: moment().subtract(3, 'hours'), end: moment()},
      {label: $filter('translate')('LAST_24_H'), start: moment().subtract(24, 'hours'), end: moment()},
      {label: $filter('translate')('CURRENT_DAY'), start: moment().startOf('day'), end: moment()},
      {label: $filter('translate')('YESTERDAY'), start: moment().subtract(1, 'days').startOf('day'), end: moment().subtract(1, 'days').endOf('day')},
      {label: $filter('translate')('CURRENT_WEEK'), start: moment().startOf('isoWeek'), end: moment()},
      {label: $filter('translate')('PREVIOUS_WEEK'), start: moment().subtract(1, 'weeks').startOf('isoWeek'), end: moment().subtract(1, 'weeks').endOf('isoWeek')},
      {label: $filter('translate')('CURRENT_MONTH'), start: moment().startOf('month'), end: moment()},
      {label: $filter('translate')('PREVIOUS_MONTH'),  start: moment().subtract(1, 'months').startOf('months'), end: moment().subtract(1, 'months').endOf('month')}
    ]

      $scope.setDatetimeFrom = function (newDate, oldDate) {
        $scope.ui.dateFromOpened = false;
        $rootScope.ui = angular.copy($scope.ui);
      }

      $scope.setDatetimeTo = function (newDate, oldDate) {
        $scope.ui.dateToOpened = false;
        $rootScope.ui = angular.copy($scope.ui);
      }

    $scope.onTimeSet = function (property) {
      $scope[property] = false;
      $rootScope.ui = angular.copy($scope.ui);
    }

    $scope.setDateRange = function (range) {
      $scope.ui.dateFrom = range.start.format('YYYY-MM-DD HH:mm:ss');
      $scope.ui.dateTo = range.end.format('YYYY-MM-DD HH:mm:ss');
      $scope.ui.showPeriodDropDown = false;
      $rootScope.ui = angular.copy($scope.ui);
    }

    $scope.hours = [...Array(24).keys()].map(function (n) {
      return {label: n + ':00:00', hour: n};
    });

    $scope.setTimeFrom = function (hour) {
      $scope.ui.dateFrom = new Date($scope.ui.dateFrom.setHours(hour, 0, 0))
      $scope.ui.showFromTimeDropdown = false;
      $rootScope.ui = angular.copy($scope.ui);
    }

    $scope.setTimeTo = function (hour) {
      $scope.ui.dateTo = new Date($scope.ui.dateTo.setHours(hour, 0, 0))
      $scope.ui.showToTimeDropdown = false;
      $rootScope.ui = angular.copy($scope.ui);
    }

    $rootScope.ui = angular.copy($scope.ui);

    $scope.getCurrentUser = function () {
      UserService.request.get({}, function (result) {
        $rootScope.currentUser = result;
        UserService.storage.currentUser = $rootScope.currentUser;
        $scope.currentProductId = result.currentProductId;
        $scope.currentDivisionId = result.currentDivisionId;
        $scope.currentPartnerId = result.partnerId;
        $rootScope.superUser = result.superUser;
        $rootScope.isAdmin = result.userRoleId === 1;
        $rootScope.isContractor = result.userRoleId === 4;
        $rootScope.fixedDivision = result.fixedDivision;

        $scope.getAccountData();
      }, function (error) {
        console.log(error);
      });
    }

    $scope.getAccountData = function () {
      AccountService.getCurrentAccountData({}, function (result) {
        $rootScope.accountData = result;
      }, function (error) {
        console.log(error);
      });
    }

    $scope.getProducts = function () {
      ObjectService.getProducts({}, function (result) {
        $rootScope.products = result;
      }, function (error) {
        console.log(error);
      });
    }

      $scope.getTrkTypes = function () {
        ObjectService.getTrkTypes({}, function (result) {
          $rootScope.trkTypes = result;
        }, function (error) {
          console.log(error);
        });
      }

    $scope.displayBalance = function () {
      if (!$rootScope.accountData) {
        return "";
      }
      return $rootScope.accountData.balance;
    }

    $scope.updateCurrentProduct = function (productId) {
      AccountService.updateCurrentProduct({idProduct: productId}, function (result) {
        $rootScope.currentUser.currentProductId = productId;
        $scope.getAccountData();
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }

    $scope.updateCurrentDivision = function (divisionId) {
      if (!divisionId) {
        divisionId = -1;
        return;
      }
      AccountService.updateCurrentDivision({divisionId: divisionId}, function (result) {
        $rootScope.currentUser.currentDivisionId = divisionId;
        $rootScope.$broadcast('updateCurrentDivision', {});
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }

    $scope.updateCurrentPartner = function (partnerId) {
      if (!partnerId) {
        partnerId = -1;
      }
      AccountService.updateCurrentPartner({partnerId: partnerId}, function (result) {
        $rootScope.currentUser.currentPartnerId = partnerId;
        $rootScope.$broadcast('updateCurrentPartner', {});
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }

    $scope.displayObject = function () {
      if (!$scope.currentUser || !$rootScope.currentUser.imei || !$rootScope.currentUser.objectName) {
        return "";
      }
      return $rootScope.currentUser.objectName + ' / ' + $rootScope.currentUser.imei;
    }

    $scope.setTheme = function () {
      var theme = 1;
      if ($rootScope.currentUser.theme == 0 || $rootScope.currentUser.theme == 1) {
        theme = 2;
      }

      UserService.request.setTheme({theme: theme}, function (result) {
        $rootScope.currentUser.theme = theme;
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    }

    $scope.$watch('ui.search', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $rootScope.ui.search = newVal;
      }
    }, true);

    $scope.$watch('ui.dateFrom', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (moment(newVal).format('yyyy-MM-DD') !== moment(oldVal).format('yyyy-MM-DD')) {
          $rootScope.ui.dateFrom = newVal;
          // $rootScope.ui.dateFrom = new Date(newVal.setHours(0, 0, 0, 0));
        } else {
          $rootScope.ui.dateFrom = newVal;
        }
      }
    }, true);

    $scope.$watch('ui.dateTo', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (moment().isSame(newVal, 'day')) {
          $rootScope.ui.dateTo = moment(new Date(newVal)).format('YYYY-MM-DD HH:mm:ss');
          $scope.ui = angular.copy($rootScope.ui);
        } else {
          if (moment(newVal).format('yyyy-MM-DD') !== moment(oldVal).format('yyyy-MM-DD')) {
            // $rootScope.ui.dateTo = moment(new Date(newVal).setHours(23, 59, 59, 0)).format('YYYY-MM-DD HH:mm:ss');
            // $scope.ui = angular.copy($rootScope.ui);
          } else {
            $rootScope.ui.dateTo = newVal;
            $scope.ui = angular.copy($rootScope.ui);
          }
        }
      }
    }, true);

    $rootScope.$on('setCurrentCompany', function (event, data) {
      $scope.getCurrentUser();
      $scope.getDivisions();
      $scope.getPartners();
      $scope.apply(function (){
        $scope.currentDivisionId = -1;
        $scope.currentPartnerId = -1;
      })
    });

    $scope.$on('$routeChangeSuccess', function ($event, next, current) {
      if (next && next.$$route && next.$$route.originalPath === '/balance') {
        if (moment().isSame($rootScope.ui.dateTo, 'day')) {
          $scope.ui.dateTo = moment(new Date($scope.ui.dateTo.setHours(23, 59, 59, 0))).format('YYYY-MM-DD HH:mm:ss');
          $rootScope.ui = angular.copy($scope.ui);
        }
      } else {
        // $rootScope.ui.dateTo = moment().format('YYYY-MM-DD HH:mm:ss');
        // $scope.ui = angular.copy($rootScope.ui);
      }
    });

    $scope.getDivisions = function () {
      DivisionService.get({}, function (result) {
        $rootScope.divisions = [{id: -1, name: $filter('translate')('NOT_SELECTED')}].concat(result);
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    };

    $scope.getPartners = function () {
      PartnerService.get({}, function (result) {
        $rootScope.partners = [{id: -1, name: $filter('translate')('NOT_SELECTED')}].concat(result);
      }, function (error) {
        toaster.pop('error', "", error.data.message);
      });
    };

    // $scope.$on('$routeChangeStart', function ($event, next, current) {
    //   if (moment().isSame($rootScope.ui.dateTo, 'day')) {
    //     $rootScope.ui.dateTo = new Date();
    //   }
    // });


    // var rangeselectionCallback = function(o){
    //   console.log("New selection:"+o.start+","+o.end);
    // }
    //
    // var data = [];
    // data[0] = {
    //   color: '#fed',
    //   data: []
    // }
    // for(var i = 0;i<1000;i++){
    //   data[0].data[i] = [i, Math.sin(i/50)];
    // }
    //
    //
    // var sData = $.extend(true,[],data);
    // for(var i=0;i<sData.length;i++){
    //   sData[i].color = '#ccc';
    //   sData[i].label = undefined;
    // }
    // $.plot("#smallgraph",sData,{
    //   yaxis: {
    //     show: false
    //   },
    //   grid:{
    //     color: "#666",
    //     backgroundColor: { colors: ["#ddd", "#fff"]}
    //   },
    //   rangeselection:{
    //     color: "#feb",
    //     start: 20,
    //     end: 100,
    //     enabled: true,
    //     callback: rangeselectionCallback
    //   }
    // });


    $scope.getCurrentUser();
    $scope.getProducts();
    $scope.getTrkTypes();
    $scope.getDivisions();
    $scope.getPartners();
  }]);
