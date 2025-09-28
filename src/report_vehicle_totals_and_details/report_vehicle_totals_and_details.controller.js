angular.module('exzotron')
  .controller('ReportVehicleTotalsAndDetailsController', ['$scope', '$rootScope', 'BalanceService', 'toaster',
    function ($scope, $rootScope, BalanceService, toaster) {
      $scope.imeis = [];

      $scope.getReport = function () {
        if (!$scope.imeis || !$scope.imeis.length) {
          return;
        }

        $scope.items = [];
        $scope.showReport = false;
        let startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        let endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        let all = false;
        let byVehicle = true;
        let groupByObjects = false;
        let imeis = $scope.imeis;

        $scope.reportDateFrom = startDate;
        $scope.reportDateTo = endDate;
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        BalanceService.getObjectRfidBalance({startDate, endDate, all, groupByObjects, imeis, byVehicle}, function (result) {
          $scope.product = $rootScope.products.find(function (el) {
            return el.id === $rootScope.currentUser.currentProductId;
          });
          $scope.items = result;
          $scope.showReport = $scope.items.length;
          // let map = {};
          // result.forEach(function (item) {
          //   if (!map[item.name]) {
          //     map[item.name] = [];
          //   }
          //   map[item.name].push(item);
          // });
          //
          // for (let key in map) {
          //   let totalCredit = $scope.sum(map[key], 'credit');
          //
          //   map[key].push({
          //     totals: true,
          //     credit: totalCredit
          //   })
          // }
          //
          // $scope.items = map;

          // $scope.showReport = Object.values($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      }

      $scope.$on('selectObject', function (event, data) {
        $scope.imeis = data.selectedObjects;
        $scope.getReport();
      });


      $scope.sum = function (array, property) {
        return array.reduce((accumulator, current) => accumulator + current[property], 0);
      }

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
        $rootScope.exportExcel('api/v1/export_totals_rfid_report_excel?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(','), 'GET', {}, 'report_totals_by_rfid.xls');
      };
    }]);
