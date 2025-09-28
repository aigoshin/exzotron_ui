angular.module('exzotron')
  .controller('ReportWeightingController', ['$scope', '$rootScope', 'ReportService', 'toaster', '$filter',
    function ($scope, $rootScope, ReportService, toaster, $filter) {
      $scope.items = [];
      $scope.imeis = [];

      $scope.getReport = function () {
        $scope.items = {};
        $scope.showReport = false;
        if (!$scope.imeis || !$scope.imeis.length) {
          return;
        }
        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');

        ReportService.reportWeightingByObjects({
          dateFrom: $scope.reportDateFrom,
          dateTo: $scope.reportDateTo,
          weightbridgeId: $scope.imeis.join(','),
          weightTypes: $scope.weightTypes
        }, function (result) {

          let map = {};
          let dateMap = {};
          let counterMap = {};

          result.forEach(function (item) {
            if (!map[item.weightbridgeId]) {
              map[item.weightbridgeId] = [];
            }

            let day = moment(item.datetimeEntry).format('YYYY-MM-DD');
            let dateMapKey = item.weightbridgeId + day;

            if (!dateMap[dateMapKey]) {
              dateMap[dateMapKey] = {
                grossWeight: 0,
                netWeight: 0,
                tareWeight: 0
              }
            }

            dateMap[dateMapKey].grossWeight += item.grossWeight;
            dateMap[dateMapKey].netWeight += item.netWeight;
            dateMap[dateMapKey].tareWeight += item.tareWeight;

            map[item.weightbridgeId].push(item);
          });

          for (let key in map) {
            let totalGross = $scope.sum(map[key], 'grossWeight');
            let totalNet = $scope.sum(map[key], 'netWeight');
            let totalTare = $scope.sum(map[key], 'tareWeight');

            counterMap[key] = {
              totals: true,
              grossWeight: totalGross,
              netWeight: totalNet,
              tareWeight: totalTare
            };

            map[key].push({
              additional: true,
              grossWeight: totalGross,
              netWeight: totalNet,
              tareWeight: totalTare
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

      $scope.$on('selectObject', function (event, data) {
        $scope.imeis = data.selectedObjects;
        $scope.weightTypes = data.weightTypes;
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
        return !next || moment(next.datetimeEntry).isAfter(current.datetimeEntry, 'day');
      };

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/report_weighting_by_objects_excel?dateFrom=' + $scope.reportDateFrom +
          '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(',') + '&weightTypes=' + $scope.weightTypes,
          'GET', {}, 'report_weighting_by_objects_excel.xls');
      };

      $scope.exportPdf = function () {
        $rootScope.exportExcel('api/v1/report_weighting_by_objects_pdf?dateFrom=' + $scope.reportDateFrom +
          '&dateTo=' + $scope.reportDateTo + '&imeis=' + $scope.imeis.join(',') + '&weightTypes=' + $scope.weightTypes,
          'GET', {}, 'report_weighting_by_objects_pdf.pdf');
      };
    }]);
