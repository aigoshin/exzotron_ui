angular.module('exzotron')
  .controller('ReportFuelMovingController', ['$scope', '$rootScope', 'TankService', 'toaster', '$filter', 'UserService',
    function ($scope, $rootScope, TankService, toaster, $filter, UserService) {
      $scope.items = [];
      $scope.imeis = [];
      $scope.storehouseIds = [];

      $scope.totalTankStartLabel = $filter('translate')('TOTAL_TANK_START');
      $scope.totalTankEndLabel = $filter('translate')('TOTAL_TANK_END');
      $scope.totalTankLabel = $filter('translate')('TOTAL_TANK');
      $scope.totalQuantityLabel = $filter('translate')('TOTALS');

      setTimeout(function (){
        $scope.byRemains = UserService.storage.currentUser.byRemains;
        $scope.byDays = !$scope.byRemains;
      }, 300)

      $scope.max = function (array, prop) {
        if (!array) {
          return 0;
        }

        return Math.max.apply(Math, array.map(function (o) {
          return o[prop];
        }));
      }

      $scope.setByDays = function (byDays) {
        $scope.byDays = byDays;
      }

      $scope.getReport = function (grouped) {
        if ($scope.storehouseIds.length < 1) {
          return;
        }

        if (grouped) {
          $scope.showReport = false;
          $scope.items = [];
          $scope.tanks = [];
          $scope.operations = [];
        }

        $scope.reportDateFrom = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm');
        $scope.reportDateTo = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm');
        $scope.createdOn = moment().format('YYYY-MM-DD HH:mm');


        UserService.request.setByRemains({byRemains: $scope.byRemains}, function (result) {
          $rootScope.currentUser.byRemains = $scope.byRemains;

          const params = {
            grouped: grouped,
            byNodes: true,
            startDate: $scope.reportDateFrom,
            endDate: $scope.reportDateTo,
            selectedTanks: $scope.storehouseIds
          };

          TankService.log(params, function (result) {
            if (grouped) {
              $scope.items = result.tankLogs;
              $scope.getReport(false)
            } else {
              $scope.tanks = result.tankLogs;
              $scope.operations = result.operationLogs;
              $scope.productOperations = result.productOperations;

              $scope.transformResultSet();
              $scope.showReport = $scope.items.length;
              $scope.drawCharts();
            }

          }, function (error) {
            toaster.pop('error', "", error.data.message);
          });
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getReport(true);

      $scope.transformResultSet = function () {
        $scope.tanksMap = {};
        let map = {};
        let dateMap = {};
        $scope.tanks.forEach(function (item) {
          if (!map[item.storehouseId]) {
            map[item.storehouseId] = [];
          }

          let day = moment(item.dateTime).format('YYYY-MM-DD');
          let dateMapKey = item.storehouseId + day;

          if (!dateMap[dateMapKey]) {
            dateMap[dateMapKey] = 0;
          }
          dateMap[dateMapKey] = item.level;

          map[item.storehouseId].push(item);
        });

        for (let key in map) {
          let tank = {
            id: parseInt(key),
            tankName: map[key][0].tankName,
            objectId: $scope.byRemains ? map[key][0].objectId : map[key][0].storehouseId,
            data: [
              map[key].map(function (o) {
                return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.level};
              })
            ]
          };
          if ($scope.operations && $scope.operations.length) {
            let objectOperations = $scope.operations.filter(function (o) {
              return o.objectId === tank.objectId;
            });
            let operationDataset = objectOperations.map(function (o) {
              return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.val.toFixed(2)};
            });
            tank.data.push(operationDataset);
          }
          if ($scope.productOperations && $scope.productOperations.length) {
            let objectOperations = $scope.productOperations.filter(function (o) {
              return o.storehouseId === tank.objectId;
            });
            let operationDataset = objectOperations.map(function (o) {
              return {objectId: o.storehouseId, date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.count.toFixed(2)};
            });
            tank.data.push(operationDataset);
          }

          map[key] = tank;
        }

        $scope.tanksMap = map;
        $scope.dateMap = dateMap;
        $scope.tanks = [];
        $scope.operations = [];
        $scope.showCharts = true;
      }

      $scope.colors = [
        am5.color("#2b75c3"),
        am5.color("#ff0000")
      ];

      $scope.drawCharts = function () {
        $scope.items.forEach(function (tank) {
          $scope.drawChart('chartdiv' + $scope.tanksMap[tank.storehouseId].id, $scope.tanksMap[tank.storehouseId].id, $scope.tanksMap[tank.storehouseId].data)
        });
      }

      $scope.drawChart = function (name, id, data) {
        let max1 = $scope.max(data[0], 'value');
        let max2 = $scope.max(data[1], 'value');

        setTimeout(function () {
          let root = am5.Root.new(name);
          root.locale = am5locales_ru_RU;
          root.id = id;

          const chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            wheelX: "panX",
            wheelY: "zoomX",
            maxTooltipDistance: 0,
            pinchZoomX: true
          }));

          chart.get("colors").set("colors", $scope.colors);

          const xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
            baseInterval: {
              timeUnit: "second",
              count: 5
            },
            tooltipDateFormat: "HH:mm MMM dd, yyyy",
            tooltip: am5.Tooltip.new(root, {}),
            renderer: am5xy.AxisRendererX.new(root, {}),
          }));

          const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            tooltip: am5.Tooltip.new(root, {}),
            min: 0,
            max: Math.max(max1,max2),
            strictMinMax: true,
            renderer: am5xy.AxisRendererY.new(root, {}),
          }));

          const yRenderer = yAxis.get("renderer");
          yRenderer.labels.template.setAll({
            fill: am5.color("#8a8a8a")
          });

          const xRenderer = xAxis.get("renderer");
          xRenderer.labels.template.setAll({
            fill: am5.color("#8a8a8a")
          });

          chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none"
          }));

          chart.series.push(generateSeries(root, xAxis, yAxis, data[0], 'Уровень', 2, true));
          chart.series.push(generateSeries(root, xAxis, yAxis, data[1], 'Расход', 2, true));

          const legend = chart.bottomAxesContainer.children.push(am5.Legend.new(root, {
            layout: root.gridLayout,
            x: am5.percent(50),
            centerX: am5.percent(50),
            visible: false
          }));
          legend.data.setAll(chart.series.values);
        })
      }

      function generateSeries(root, xAxis, yAxis, data, name, strokeWidth, visible) {
        if (!data) {
          data = [];
        }
        let series = am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "date",
          visible: visible
        });

        series.data.setAll(data);

        series.strokes.template.setAll({
          strokeWidth: strokeWidth
        });

        series.fills.template.setAll({
          fillOpacity: 0.1,
          visible: true
        });

        return series;
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          // $scope.getReport(true);
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          // $scope.getReport(true);
        }
      }, true);

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          // $scope.getReport(true);
        }
      }, true);

      $scope.$on('selectStorehouse', function (event, data) {
        $scope.storehouseIds = data.selectedStorehouses;
        $scope.getReport(true);
      });

      $scope.exportExcel = function () {
        $rootScope.exportExcel('api/v1/export_fuel_moving_report_excel?dateFrom=' + $scope.reportDateFrom + '&dateTo=' + $scope.reportDateTo + '&selectedTanks='+ $scope.storehouseIds.join(','), 'GET', {}, 'report_fuel_moving.xls');
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
