angular.module('exzotron')
  .controller('ReportDetailedRfidController', ['$scope', '$rootScope', 'ReportService', 'toaster',
    function ($scope, $rootScope, ReportService, toaster) {
      $scope.imeis = [];
      $scope.rfids = [];

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;

        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportDetailedRfid({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          imeis: $scope.imeis.join(','),
          rfids: $scope.rfids.join(',')
        }, function (result) {
          let map = {};

          result.forEach(function (item) {
            if (!map[item.rfid1]) {
              map[item.rfid1] = [];
            }
            map[item.rfid1].push(item);
          });

          for (let key in map) {
            let totalQuantity = $scope.sum(map[key], 'quantity');
            map[key].push({totals: true, quantity: totalQuantity})
          }

          $scope.items = map;
          $scope.showReport = Object.values($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.$on('detailedReportRfid', function (event, data) {
        $scope.imeis = data.selectedObjects;
        $scope.rfids = data.selectedRfidObjects;
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

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_detailed_rfid_report_excel?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(',') + '&rfids=' + $scope.rfids.join(','), 'GET', {}, 'report_detailed_by_rfid.xls');
      };

    }]);
