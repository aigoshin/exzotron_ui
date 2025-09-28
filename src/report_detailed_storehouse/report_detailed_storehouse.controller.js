angular.module('exzotron')
  .controller('ReportDetailedStorehouseController', ['$scope', '$rootScope', 'ReportService', 'toaster',
    function ($scope, $rootScope, ReportService, toaster) {
      $scope.items = [];
      $scope.storehouseIds = [];
      $scope.byDays = false;
      $scope.control = false;

      $scope.setByDays = function (byDays) {
        $scope.byDays = byDays;
      }

      $scope.getReport = function () {
        if ($scope.storehouseIds.length < 1) {
          return;
        }

        $scope.showReport = false;
        $scope.items = [];
        $scope.dateMap = [];

        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');


        ReportService.reportDetailedStorehouse({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          storehouseIds: $scope.storehouseIds.join(','),
          byDays: $scope.byDays,
          control: $scope.control
        }, function (result) {
          $scope.items = JSON.parse(result.data);
          $scope.showReport = Object.keys($scope.items).length;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.initTotals = function (array) {
        let totalDebit = $scope.sum(array, 'debit');
        let totalCredit = $scope.sum(array, 'credit');
        return {totalCredit, totalDebit};
      }

      $scope.$on('selectStorehouse', function (event, data) {
        $scope.storehouseIds = data.selectedStorehouses;
        $scope.getReport();
      });

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_detailed_storehouse_report_excel?byDays=' + $scope.byDays + '&control=' + $scope.control + '&dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&storehouseIds=' + $scope.storehouseIds.join(','), 'GET', {}, 'report_detailed_storehouse.xls');
      };

      $scope.printReport = function () {
        let content = document.getElementById("report");
        let canvasElements = document.getElementsByTagName('canvas');

        //Трансформируем canvas в img
        let chartImages = [];
        for (let i = 0; i < canvasElements.length; i++) {
          if (i % 2 === 0) {//На каждый график имеем 2 canvas
            let chartImage = canvasElements[i].toDataURL('png');
            let img = '<img style="width: 100%" src="' + chartImage + '">'
            chartImages.push(img);
          }
        }

        let css = '<link rel="stylesheet" href="/webjars/bootstrap/4.6.0/css/bootstrap.min.css"> ' +
          '<link rel="stylesheet" href="/static/css/style.css"> '
        let print = window.open('', '', 'left=0,top=0,width=1200,height=900,toolbar=0,scrollbars=0,status=0');
        print.document.write(css + content.innerHTML);
        print.document.getElementById("buttons").innerHTML = "";

        //Заменяем содержимое canvas контейнеров на img
        let chartContainers = print.document.getElementsByClassName('chart-container');
        for (let i = 0; i < chartContainers.length; i++) {
          chartContainers[i].innerHTML = chartImages[i];
        }

        print.document.close();

        setTimeout(function () {
          print.focus();
          print.print();
          print.close();
        }, 500);
      };
    }]);
