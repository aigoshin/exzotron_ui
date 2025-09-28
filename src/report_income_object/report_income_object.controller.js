angular.module('exzotron')
  .controller('ReportObjectIncomeController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$filter',
    function ($scope, $rootScope, ReportService, toaster, $filter) {
      $scope.items = [];
      $scope.imeis = [];

      $scope.totalTankStartLabel = $filter('translate')('TOTAL_TANK_START');
      $scope.totalTankEndLabel = $filter('translate')('TOTAL_TANK_END');
      $scope.totalTankLabel = $filter('translate')('TOTAL_TANK');
      $scope.totalQuantityLabel = $filter('translate')('TOTALS');
      $scope.showAll = false;

      $scope.showEmptyVehicles = function (item) {
        if ($scope.showAll) {
          return true;
        }
        return !!item.vehicleName;
      }

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.imeis || !$scope.imeis.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportByObjectsIncome({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          imeis: $scope.imeis.join(',')
        }, function (result) {

          let map = {};
          result.forEach(function (item) {
            if (!map[item.imei]) {
              map[item.imei] = [];
            }
            map[item.imei].push(item);
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

      $scope.$on('selectObject', function (event, data) {
        $scope.imeis = data.selectedObjects;
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
        $rootScope.exportExcel('api/v1/export_object_report_income?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects_income.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/export_object_report_income_pdf?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects_income.pdf');
      };

      $scope.exportCsv = function () {
        $rootScope.exportExcel('api/v1/export_object_report_income_csv?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects_income.csv');
      };
    }]);
