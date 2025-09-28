angular.module('exzotron')
  .controller('ReportRfidController', ['$scope', '$rootScope', 'ReportService', 'toaster',
    function ($scope, $rootScope, ReportService, toaster) {
      $scope.items = [];
      $scope.accounts = [];

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.accounts || !$scope.accounts.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportByRfid({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          accounts: $scope.accounts.join(',')
        }, function (result) {

          let map = {};
          let dateMap = {};

          result.forEach(function (item) {
            if (!map[item.account]) {
              map[item.account] = [];
            }

            let day = moment(item.dateTime).format('YYYY-MM-DD');
            let dateMapKey = item.account + day;

            if (!dateMap[dateMapKey]) {
              dateMap[dateMapKey] = 0;
            }
            dateMap[dateMapKey] += -item.count;

            map[item.account].push(item);
          });

          for (let key in map) {
            let totalDebit = $scope.sum(map[key], 'debit');
            let totalCredit = $scope.sum(map[key], 'credit');
            map[key].push({totals: true, debit: totalDebit, credit: totalCredit})
          }

          $scope.items = map;
          $scope.dateMap = dateMap;
          $scope.showReport = Object.values($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

      $scope.$on('selectRfidObject', function (event, data) {
        $scope.accounts = data.selectedRfidObjects;
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
        return !next || moment(next.dateTime).isAfter(current.dateTime, 'day');
      };

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_rfid_report?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&accounts=' + $scope.accounts.join(','), 'GET', {}, 'report_by_rfid.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/export_rfid_report_pdf?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&accounts=' + $scope.accounts.join(','), 'GET', {}, 'report_by_rfid.pdf');
      };
    }]);
