angular.module('exzotron')
  .controller('CompanyController', ['$scope', '$rootScope', 'CompanyService', 'ModalService', 'toaster', 'UserService', 'DealerService',
    function ($scope, $rootScope, CompanyService, ModalService, toaster, UserService, DealerService) {
      $scope.companies = [];
      $scope.users = [];
      $scope.selectedCompany = null;
      $scope.search = '';
      $scope.superUser = $rootScope.currentUser.superUser;
      $scope.newCompany = {
        name: null,
        telegram: $rootScope.currentUser.telegram,
        maxObjectsCount: 10,
        objectsCount: 0,
        idChatTelegram: null
      }

      $scope.getCompanies = function () {
        $scope.loaded = false;
        CompanyService.getCompanyList({}, function (result) {
          $scope.companies = result;
          $scope.loaded = true;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getUsers = function () {
        UserService.request.getUsers({}, function (result) {
          $scope.users = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.getDealers = function () {
        DealerService.get({}, function (result) {
          $scope.dealers = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.editCompany = function (company) {
        $scope.selectedCompany = angular.copy(company);
      }

      $scope.cancelEdit = function () {
        $scope.selectedCompany = null;
      }

      $scope.deleteCompany = function (company) {
        let modalOptions = {
          bodyText: 'Вы действительно хотите удалить компанию ' + company.name + '?'
        }
        ModalService.showModal(null, modalOptions).then(function (result) {
          if (result) {
            CompanyService.deleteCompany({companyId: company.id}, function (result) {
              $scope.companies = $scope.companies.filter(function (item) {
                return item.id !== company.id;
              })
              if (company.name === $rootScope.currentUser.companyName) {
                $scope.setCurrentCompany($scope.companies[0])
              }
              toaster.pop('success', "", 'Компания успешно удалена.');
            }, function (error) {
              toaster.pop('error', "", error.data.message);
            });
          }
        });
      }

      $scope.saveCompany = function (company) {
        if (company.telegram !== $scope.selectedCompany.telegram) {
          let modalOptions = {
            bodyText: 'Вы действительно хотите передать права на компанию?'
          }
          ModalService.showModal(null, modalOptions).then(function (result) {
            if (result) {
              saveCompany(company, true)
            }
          });
        } else {
          saveCompany(company, false)
        }
      }

      function saveCompany(company, transfer) {
        CompanyService.updateCompanyName({
          companyId: company.id,
          companyName: $scope.selectedCompany.name,
          userId: transfer ? $scope.selectedCompany.telegram : null,
          rfidInsertStatus: $scope.selectedCompany.rfidInsertStatus,
          description: $scope.selectedCompany.description,
          utc: $scope.selectedCompany.utc,
          dealerId: $scope.selectedCompany.dealerId,
          contactPay: $scope.selectedCompany.contactPay,
          companyPay: $scope.selectedCompany.companyPay,
          contactClient: $scope.selectedCompany.contactClient,
          manager: $scope.selectedCompany.manager,
          inn: $scope.selectedCompany.inn,
          payDate: $scope.selectedCompany.payDate ? moment($scope.selectedCompany.payDate).format('YYYY-MM-DD') : null
        }, function (result) {
          company.name = $scope.selectedCompany.name
          $scope.selectedCompany = null;
          $scope.getCompanies();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.editable = function (company) {
        return company.telegram === $rootScope.currentUser.telegram || $scope.superUser;
      }

      $scope.setCurrentCompany = function (company) {
        if ($scope.selectedCompany) {
          return;
        }
        CompanyService.setDefaultCompany({companyId: company.id}, function (result) {
          $rootScope.currentUser.companyName = company.name;
          $rootScope.$broadcast('setCurrentCompany', {currentCompany: company});
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.currentCompany = function (company) {
        return company && company.name === $rootScope.currentUser.companyName;
      }

      $scope.createCompany = function () {
        CompanyService.addCompany({companyName: $scope.newCompany.name}, function (result) {
          $rootScope.currentUser.companyName = $scope.newCompany.name;
          $scope.newCompany.name = null;
          $scope.getCompanies();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.statusClass = function (status) {
        if (status == 0) {
          return 'bi-dash text-info';
        } else if (status == 1) {
          return 'bi-check text-success';
        } else if (status == 2) {
          return 'bi-x text-danger';
        } else {
          return '';
        }
      };

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getCompanies();
      $scope.getUsers();
      $scope.getDealers();
    }]);
