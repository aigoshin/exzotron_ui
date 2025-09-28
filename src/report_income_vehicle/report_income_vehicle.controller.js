angular.module('exzotron')
  .controller('ReportVehicleIncomeController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$filter',
    function ($scope, $rootScope, ReportService, toaster, $filter) {
      $scope.items = [];
      $scope.vehicleIds = [];

      $scope.totalTankStartLabel = $filter('translate')('TOTAL_TANK_START');
      $scope.totalTankEndLabel = $filter('translate')('TOTAL_TANK_END');
      $scope.totalTankLabel = $filter('translate')('TOTAL_TANK');
      $scope.totalQuantityLabel = $filter('translate')('TOTALS');

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.vehicleIds || !$scope.vehicleIds.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportByVehicleIncome({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          vehicleIds: $scope.vehicleIds.join(',')
        }, function (result) {

          let map = {};
          result.forEach(function (item) {
            if (!map[item.vehicleName]) {
              map[item.vehicleName] = [];
            }
            map[item.vehicleName].push(item);
          });

          for (let key in map) {
            let totalCredit = $scope.sum(map[key], 'credit');
            let avgDeviationPct = $scope.avg(map[key], 'deviationPct');

            map[key].push({
              totals: true,
              credit: totalCredit,
              deviationPct: avgDeviationPct
            })
            //
            // map[key].push({
            //   additional: true,
            //   tankStart: totalTankStart,
            //   tankEnd: last,
            //   tank: totalTank
            // })
          }

          $scope.items = map;

          $scope.showReport = Object.values($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.avg = function (array, property) {
        let sum = $scope.sum(array, property)
        return sum / array.length;
      };

      $scope.$on('selectVehicle', function (event, data) {
        $scope.vehicleIds = data.selectedVehicles;
        $scope.getReport();
      });

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

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_vehicle_report_income?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&vehicleIds=' + $scope.vehicleIds.join(','), 'GET', {}, 'report_by_vehicles_income.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/export_vehicle_report_income_pdf?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&vehicleIds=' + $scope.vehicleIds.join(','), 'GET', {}, 'report_by_vehicles_income.pdf');
      };

      $scope.exportCsv = function () {
        $rootScope.exportExcel('api/v1/export_vehicle_report_income_csv?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&vehicleIds=' + $scope.vehicleIds.join(','), 'GET', {}, 'report_by_vehicles_income.csv');
      };
    }]);
