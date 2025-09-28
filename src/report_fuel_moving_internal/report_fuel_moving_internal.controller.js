angular.module('exzotron')
  .controller('ReportFuelMovingInternalController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$location',
    function ($scope, $rootScope, ReportService, toaster, $location) {
      $scope.items = [];

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getReport();
      });

      $scope.getReport = function () {
        $scope.items = [];
        $scope.showReport = false;
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportFuelMovingInternal({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo
        }, function (result) {
          let map = {};


          result.forEach(function (item) {
            if (!map[item.divisionId]) {
              map[item.divisionId] = [];
            }
            map[item.divisionId].push(item);
          });

          for (let key in map) {
            map[key].push({
              storehouseName: 'Итого:',
              distributor: $scope.sum(map[key],'distributor'),
              internalDebit: $scope.sum(map[key],'internalDebit'),
              inventory: $scope.sum(map[key],'inventory'),
              totalDebit: $scope.sum(map[key],'totalDebit'),
              vehicleConsumption: $scope.sum(map[key],'vehicleConsumption'),
              internalCredit: $scope.sum(map[key],'internalCredit'),
              totalCredit: $scope.sum(map[key],'totalCredit'),
              tankEnd: $scope.sum(map[key],'tankEnd'),
              tankStart: $scope.sum(map[key],'tankStart')
            })
          }

          $scope.companyTotals = {
            storehouseName: 'Итого по компании:',
            distributor: $scope.sum(result,'distributor'),
            internalDebit: $scope.sum(result,'internalDebit'),
            inventory: $scope.sum(result,'inventory'),
            totalDebit: $scope.sum(result,'totalDebit'),
            vehicleConsumption: $scope.sum(result,'vehicleConsumption'),
            internalCredit: $scope.sum(result,'internalCredit'),
            totalCredit: $scope.sum(result,'totalCredit'),
            tankEnd: $scope.sum(result,'tankEnd'),
            tankStart: $scope.sum(result,'tankStart')
          }

          $scope.items = map;

          console.log(map)

          $scope.showReport = result.length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getReport();

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.printReport = function () {
        let content = document.getElementById("report");
        let css = '<link rel="stylesheet" href="/webjars/bootstrap/4.6.0/css/bootstrap.min.css"> ' +
          '<link rel="stylesheet" href="/static/css/style.css"> '
        let print = window.open('', '', 'left=0,top=0,width=900,height=800,toolbar=0,scrollbars=0,status=0');
        print.document.write(css + content.innerHTML);
        print.document.getElementById("buttons").innerHTML = "";
        print.document.close();

        setTimeout(function () {
          print.focus();
          print.print();
          print.close();
        }, 500);
      };

      $scope.checkPath = function () {
        return $location.path() === '/report_fuel_moving_internal';
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getReport();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if ($scope.checkPath() && newVal !== oldVal) {
          $scope.getReport();
        }
      }, true);

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_report_fuel_moving_internal?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo, 'GET', {}, 'report_fuel_moving_internal.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/export_vehicle_report_income_pdf?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&vehicleIds=' + $scope.vehicleIds.join(','), 'GET', {}, 'report_by_vehicles_income.pdf');
      };

      $scope.exportCsv = function () {
        $rootScope.exportExcel('api/v1/export_vehicle_report_income_csv?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&vehicleIds=' + $scope.vehicleIds.join(','), 'GET', {}, 'report_by_vehicles_income.csv');
      };
    }]);
