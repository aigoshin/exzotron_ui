angular.module('exzotron')
  .controller('ReportDivisionController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$filter',
    function ($scope, $rootScope, ReportService, toaster, $filter) {
      $scope.items = [];
      $scope.divisionIds = [];

      $scope.totalTankStartLabel = $filter('translate')('TOTAL_TANK_START');
      $scope.totalTankEndLabel = $filter('translate')('TOTAL_TANK_END');
      $scope.totalTankLabel = $filter('translate')('TOTAL_TANK');
      $scope.totalQuantityLabel = $filter('translate')('TOTALS');

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.divisionIds || !$scope.divisionIds.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportByObjects({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          divisionIds: $scope.divisionIds.join(',')
        }, function (result) {

          let map = {};
          let dateMap = {};
          let counterMap = {};

          result.forEach(function (item) {
            if (!map[item.divisionId]) {
              map[item.divisionId] = [];
            }

            let day = moment(item.dateTime).format('YYYY-MM-DD');
            let dateMapKey = item.divisionId + day;

            if (!dateMap[dateMapKey]) {
              dateMap[dateMapKey] = 0;
            }
            dateMap[dateMapKey] += -item.quantity;

            map[item.divisionId].push(item);
          });

          for (let key in map) {
            let totalQuantity = $scope.sum(map[key], 'quantity');

            counterMap[key] = {
              totals: true,
              quantity: totalQuantity
            };

            map[key].push({
              additional: true
            })
          }

          $scope.items = map;
          $scope.dateMap = dateMap;
          $scope.counterMap = counterMap;
          $scope.showReport = Object.values($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.$on('selectDivision', function (event, data) {
        $scope.divisionIds = data.selectedDivisions;
        $scope.getReport();
      });

      $scope.printReport = function () {
        let content = document.getElementById("report");
        let css = '<link rel="stylesheet" href="/webjars/bootstrap/4.6.0/css/bootstrap.min.css"> ' +
          '<link rel="stylesheet" href="/static/css/style.css"> '
        let print = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        print.document.write(css + content.innerHTML);
        print.document.getElementById("buttons").innerHTML = "";
        print.document.close();

        setTimeout(function () {
          print.focus();
          print.print();
          print.close();
        }, 500);
      };

      $scope.addSpacing = function (current, next) {
        return !next || !next.additional &&  moment(next.dateTime).isAfter(current.dateTime, 'day');
      };

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_object_report?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&divisionIds=' + $scope.divisionIds.join(','), 'GET', {}, 'report_by_divisions.xls');
      };
    }]);
