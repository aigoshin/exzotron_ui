angular.module('exzotron')
  .controller('FuelStorageController', ['$scope', '$rootScope', 'toaster', 'TankService', '$filter', 'UserService', '$interval',
    function ($scope, $rootScope, toaster, TankService, $filter, UserService, $interval) {
      $scope.tanks = [];
      $scope.grouped = true;
      $scope.byNodes = false;
      $scope.selectedTanks = [];
      setTimeout(function () {
        $scope.showChartLineByRemains = UserService.storage.currentUser.byRemains;
      }, 300)


      $scope.running = false;

      var interval;

      $scope.start = function (sec) {
        if (!$scope.running) {
          interval = $interval(function () {
            $scope.getTankLog();
          }, sec * 1000);
          $scope.running = true;
        }
      }

      $scope.stop = function () {
        if ($scope.running) {
          $interval.cancel(interval);
          $scope.running = false;
        }
      }

      $scope.$on('startInterval', function (event, data) {
        $scope.start(data.intervalSeconds);
      });

      $scope.$on('stopInterval', function (event, data) {
        $scope.stop();
      });

      $scope.$on('updateCurrentDivision', function (event, data) {
        $scope.getTankLog();
      });

      $scope.showLevelLine = true;
      $scope.showConsumptionLine = true;
      $scope.showWaterLine = false;
      $scope.showWeightLine = false;
      $scope.showDensityLine = false;
      $scope.showTemperatureLine = false;

      $scope.colors = [
        am5.color("#2b75c3"),
        am5.color("#d0db34"),
        am5.color("#8234d0"),
        am5.color("#944612"),
        am5.color("#ee0e0e")
      ];

      $scope.max = function (array, prop) {
        if (!array) {
          return 0;
        }
        return Math.max.apply(Math, array.map(function (o) {
          return o[prop];
        }));
      }

      $scope.getTankLog = function () {
        $scope.tanks = [];
        if ($scope.selectedTanks.length <= 0) {
          return;
        }
        const params = {
          byNodes: $scope.byNodes,
          grouped: $scope.grouped,
          selectedTanks: $scope.selectedTanks
        }
        // if (!$scope.grouped) {
          params.startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss')
          params.endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss')
        // }

        TankService.log(params, function (result) {
          $scope.tanks = result.tankLogs;
          $scope.operations = result.operationLogs;
          $scope.productOperations = result.productOperations;
          if (!$scope.grouped) {
            $scope.transformResultSet()
          }
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.transformResultSet = function () {


        if ($scope.byNodes) {
          let map = {};
          $scope.tanks.forEach(function (item) {
            if (!map[item.storehouseId]) {
              map[item.storehouseId] = [];
            }
            map[item.storehouseId].push(item);
          });
          $scope.tanks = [];
          for (let key in map) {
            let tank = {
              id: parseInt(key),
              tankName: map[key][0].tankName,
              objectId: $scope.showChartLineByRemains ? map[key][0].objectId : map[key][0].storehouseId,
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

            $scope.tanks.push(tank);
          }
        } else {
          let map = {};
          $scope.tanks.forEach(function (item) {
            if (!map[item.tankId]) {
              map[item.tankId] = [];
            }
            map[item.tankId].push(item);
          });
          $scope.tanks = [];
          for (let key in map) {
            let tank = {
              id: parseInt(key),
              tankName: map[key][0].tankName,
              objectId: map[key][0].objectId,
              data: [
                map[key].map(function (o) {
                  return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.level};
                }),
                map[key].map(function (o) {
                  return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.temperature};
                }),
                map[key].map(function (o) {
                  return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.density};
                }),
                map[key].map(function (o) {
                  return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.weight};
                }),
                map[key].map(function (o) {
                  return {date: new Date(moment(o.dateTime).format('YYYY-MM-DD HH:00')).getTime(), value: o.water};
                })
              ]
            };
            $scope.tanks.push(tank);
          }
        }
      }

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getTankLog();
        }
      }, true);

      $scope.$on('showTankCharts', function (event, data) {
        $scope.grouped = !data.showTankCharts;
        $scope.selectedTanks = data.selectedTanks;
        $scope.selectedTank = null;

        if ($scope.byNodes) {
          $scope.colors = [
            am5.color("#2b75c3"),
            am5.color("#ff0000")
          ];
        } else {
          $scope.colors = [
            am5.color("#2b75c3"),
            am5.color("#d0db34"),
            am5.color("#8234d0"),
            am5.color("#944612"),
            am5.color("#ee0e0e")
          ];
        }

        $scope.getTankLog();
      });

      $scope.showFullSizeChart = function (tank) {
        if (!$scope.selectedTank) {
          return true;
        }
        if ($scope.byNodes) {
          return $scope.selectedTank.storehouseId === tank.id;
        } else {
          return $scope.selectedTank.tankId === tank.id;
        }
      }

      let charts = new Map();

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
          // const unique = [...new Set(data.map(item => item.group))];
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

          if ($scope.byNodes) {
            chart.series.push(generateSeries(root, xAxis, yAxis, data[0], 'Уровень', 2, $scope.showLevelLine));
            chart.series.push(generateSeries(root, xAxis, yAxis, data[1], 'Расход', 2, $scope.showConsumptionLine));
          } else {
            const yAxis2 = chart.yAxes.push(am5xy.ValueAxis.new(root, {
              renderer: am5xy.AxisRendererY.new(root, {opposite: true}),
            }));
            chart.series.push(generateSeries(root, xAxis, yAxis, data[0], 'Уровень', 2, $scope.showLevelLine));
            chart.series.push(generateSeries(root, xAxis, yAxis2, data[1], 'Температура', 2, $scope.showTemperatureLine));
            chart.series.push(generateSeries(root, xAxis, yAxis2, data[2], 'Плотность', 2, $scope.showDensityLine));
            chart.series.push(generateSeries(root, xAxis, yAxis2, data[3], 'Вес', 2, $scope.showWeightLine));
            chart.series.push(generateSeries(root, xAxis, yAxis2, data[4], 'Вода', 2, $scope.showWaterLine));
          }

          const legend = chart.bottomAxesContainer.children.push(am5.Legend.new(root, {
            layout: root.gridLayout,
            x: am5.percent(50),
            centerX: am5.percent(50),
            visible: false
          }));
          legend.data.setAll(chart.series.values);

          charts.set(id, chart);
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

      function removeSeriesById(chart, id) {
        let targetSeries = null;
        chart.series.each(function (series) {
          if (series.get("customId") === id) {
            targetSeries = series;
          }
        });

        if (targetSeries && !targetSeries.isDisposed()) {
          chart.series.removeIndex(chart.series.indexOf(targetSeries)).dispose();
          targetSeries.dispose();
          return true;
        }

        return false;
      }

      function addSeries(item) {
        let chart = charts.get(item.storehouseId);

        if(removeSeriesById(chart, item.id)){
          return;
        }

        const startDataPoint = {
          date: moment(item.dateTime).toDate().getTime(),
          value: parseFloat(item.count.toFixed(2))
        };
        const endDataPoint = {
          date: moment(item.dateTime).toDate().getTime(),
          value: 0
        };
        const array = [startDataPoint, endDataPoint];
        let series = generateSeries(chart.root, chart.xAxes.getIndex(0), chart.yAxes.getIndex(0), array, 'Детально', 2, true);
        series.set("customId", item.id);
        chart.series.push(series);
      }
      
      $scope.$on('selectDetailedReportItem', function (event, data) {
        addSeries(data.selectedDetailedReportItem)
      });

      $scope.$on('showChartsByNodes', function (event, data) {
        $scope.byNodes = data.showChartsByNodes;
        $scope.selectedTanks = data.selectedTanks;
      });

      $scope.$on('showChartLineByRemains', function (event, data) {
        $scope.showChartLineByRemains = data.showChartLineByRemains;
        $scope.selectedTanks = data.selectedTanks;
      });

      $scope.$on('applyTankLogs', function (event, data) {
        $scope.selectedTanks = data.selectedTanks;
        $scope.getTankLog();
      });

      $scope.$on('selectTank', function (event, data) {
        $scope.selectedTank = data.selectedTank;
        setTimeout(function () {
          if ($scope.selectedTank) {
            charts.forEach(function (chart, id) {
              if (id === $scope.selectedTank.tankId) {
                chart.bottomAxesContainer.children.getIndex(1).show();
                chart.set("scrollbarX", am5.Scrollbar.new(chart.root, {
                  orientation: "horizontal",
                  visible: true
                }));
              }
            });
          } else {
            charts.forEach(function (chart) {
              chart.bottomAxesContainer.children.getIndex(1).hide();
              chart.set("scrollbarX", am5.Scrollbar.new(chart.root, {
                orientation: "horizontal",
                visible: false
              }));
            });
          }
        }, 50)
      });

      $scope.$on('selectTankId', function (event, data) {
        $scope.selectedTankId = data.selectedTankId;
        $scope.getTankLog();
      });

      $scope.$on('showLevelLine', function (event, data) {
        $scope.showLevelLine  = data.showLevelLine;
        if (data.showLevelLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(0).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(0).hide();
          });
        }
      });

      $scope.$on('showTemperatureLine', function (event, data) {
        $scope.showTemperatureLine  = data.showTemperatureLine;
        if (data.showTemperatureLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(1).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(1).hide();
          });
        }
      });

      $scope.$on('showDensityLine', function (event, data) {
        $scope.showDensityLine = data.showDensityLine;
        if (data.showDensityLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(2).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(2).hide();
          });
        }
      });

      $scope.$on('showWeightLine', function (event, data) {
        $scope.showWeightLine = data.showWeightLine;
        if (data.showWeightLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(3).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(3).hide();
          });
        }
      });

      $scope.$on('showWaterLine', function (event, data) {
        $scope.showWaterLine = data.showWaterLine;
        if (data.showWaterLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(4).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(4).hide();
          });
        }
      });

      $scope.$on('showConsumptionLine', function (event, data) {
        $scope.showConsumptionLine = data.showConsumptionLine;
        if (data.showConsumptionLine) {
          charts.forEach(function (chart) {
            chart.series.getIndex(1).show();
          });
        } else {
          charts.forEach(function (chart) {
            chart.series.getIndex(1).hide();
          });
        }
      });

      $scope.getTankLog();
    }]);
