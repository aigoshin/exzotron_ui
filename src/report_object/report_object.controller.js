angular.module('exzotron')
  .controller('ReportObjectController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$filter',
    function ($scope, $rootScope, ReportService, toaster, $filter) {
      $scope.items = [];
      $scope.imeis = [];

      $scope.totalTankStartLabel = $filter('translate')('TOTAL_TANK_START');
      $scope.totalTankEndLabel = $filter('translate')('TOTAL_TANK_END');
      $scope.totalTankLabel = $filter('translate')('TOTAL_TANK');
      $scope.totalQuantityLabel = $filter('translate')('TOTALS');

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.imeis || !$scope.imeis.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportByObjects({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          imeis: $scope.imeis.join(','),
          showVehicles: $scope.showVehicles
        }, function (result) {

          let map = {};
          let dateMap = {};
          let counterMap = {};

          result.forEach(function (item) {
            if (!map[item.imei]) {
              map[item.imei] = [];
            }

            let day = moment(item.dateTime).format('YYYY-MM-DD');
            let dateMapKey = item.imei + day;

            if (!dateMap[dateMapKey]) {
              dateMap[dateMapKey] = 0;
            }
            dateMap[dateMapKey] += -item.quantity;

            map[item.imei].push(item);
          });

          for (let key in map) {
            let totalQuantity = $scope.sum(map[key], 'quantity');
            let totalTankStart = map[key][0].totalAccountStart;
            // let totalTankEnd = $scope.sum(map[key], 'totalAccountEnd');
            let last = map[key][map[key].length - 1].totalAccountEnd;
            let totalTank = last - totalTankStart;

            counterMap[key] = {
              totals: true,
              quantity: totalQuantity
            };

            map[key].push({
              additional: true,
              tankStart: totalTankStart,
              tankEnd: last,
              tank: totalTank
            })
          }

          $scope.items = map;
          $scope.dateMap = dateMap;
          $scope.counterMap = counterMap;
          $scope.showReport = Object.values($scope.items).length;

          $scope.division = $rootScope.divisions.find(function (el) {
            return el.id === $rootScope.currentUser.currentDivisionId;
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.$on('selectObject', function (event, data) {
        $scope.imeis = data.selectedObjects;
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
        $rootScope.exportExcel('api/v1/export_object_report?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects.xls');
      };

      $scope.exportExcelFull = function () {
        $rootScope.exportExcel('api/v1/export_object_report?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&full=true&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/export_object_report_pdf?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects.pdf');
      };

      $scope.exportCsv = function () {
        $rootScope.exportExcel('api/v1/export_object_report_csv?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_by_objects.csv');
      };
    }]);
