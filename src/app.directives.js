angular.module('exzotron')
  .directive('dateTime', function () {
    return {
      require: '?ngModel',
      link: function (scope, elm, attrs, ctrl) {
        if (ctrl) {
          ctrl.$validators.datetime = function (modelValue) {
            return ctrl.$isEmpty(modelValue) || moment(modelValue).isValid();
          };
        }
      }
    };
  })
  .directive('columnChooser', ['$uibModal', '$window', function ($uibModal, $window) {
    return {
      link: function (scope, elem, attr) {
        let key;
        let columns;

        function apply() {
          setTimeout(function () {
            key = attr.columnChooser;
            columns = angular.element(elem).parent().parent().children();
            let storedColumns = $window.localStorage.getItem(key);
            if (storedColumns) {

              if (typeof storedColumns === "string") {
                storedColumns = JSON.parse(storedColumns);
              }

              for (let i = 0; i < storedColumns.length; i++) {
                let storedColumn = storedColumns[i];
                if (!storedColumn.meta.show) {
                  let el = angular.element(columns[storedColumn.meta.idx]);
                  el.addClass('ng-hide');

                  let rows = angular.element(el.parent().parent().parent().children()[1]).children();
                  for (let i = 0; i < rows.length; i++) {
                    let row = angular.element(rows[i]);
                    angular.element(row.children()[storedColumn.meta.idx]).addClass('ng-hide');
                  }
                }
              }
            }
          });
        }

        scope.$watch(function () {
          return attr.fire;
        }, function (newVal, oldVal) {
          if (newVal !== oldVal) {
            setTimeout(function () {
              apply();
            });
          }
        });

        setTimeout(function () {
          apply();
        },);

        elem.bind('click', function () {
          $uibModal.open({
            animation: false,
            templateUrl: 'static/src/tpl/choose_columns_modal.html',
            backdrop: 'static',
            windowClass: 'form-modal',
            size: 'md',
            controller: ['$scope', '$uibModalInstance', 'data', function ($scope, $uibModalInstance, data) {
              $scope.rawColumns = [];
              for (let i = 0; i < data.columns.length; i++) {
                let column = angular.element(data.columns[i]);
                let text = column.text();
                let resizeDisabled = column.hasClass('resize-disabled');
                if (text && i !== 0 && !resizeDisabled) {
                  $scope.rawColumns.push({obj: column, meta: {show: !column.hasClass('ng-hide'), idx: i}});
                }
              }

              $scope.showHideColumn = function (column) {
                let rows = angular.element(column.obj.parent().parent().parent().children()[1]).children();

                if (!column.meta.show) {
                  column.obj.addClass('ng-hide');
                  for (let i = 0; i < rows.length; i++) {
                    let row = angular.element(rows[i]);
                    angular.element(row.children()[column.meta.idx]).addClass('ng-hide');
                  }
                } else {
                  column.obj.removeClass('ng-hide');
                  for (let i = 0; i < rows.length; i++) {
                    let row = angular.element(rows[i]);
                    angular.element(row.children()[column.meta.idx]).removeClass('ng-hide');
                  }
                }
                $window.localStorage.setItem(data.key, JSON.stringify($scope.rawColumns));
              }

              $scope.ok = function () {
                $uibModalInstance.dismiss();
              };
            }],
            resolve: {
              data: function () {
                return {
                  columns: columns,
                  key: key
                }
              }
            }
          });
        });
      }
    };
  }])
  .directive('elementSize', function () {
    function link(scope, element, attrs) {
      scope.$watch(function () {
        let pcth = attrs.pcth;
        let pctw = attrs.pctw;

        let width = element[0].clientWidth - element[0].scrollLeft - 35;
        let height = element[0].clientHeight - 80;

        height = pcth ? parseInt(pcth) * height / 100 : height;
        width = pctw ? parseInt(pctw) * width / 100 : width;

        if (!scope[attrs.id]) {
          scope[attrs.id] = {
            height: height,
            width: width,
            oldWidth: width,
            oldHeight: height
          };
        }

        if (scope[attrs.id].oldHeight !== height && scope[attrs.id].oldWidth === width) {
          width = width + 1;
        }

        scope[attrs.id].width = width;
        scope[attrs.id].height = height;
        scope[attrs.id].oldWidth = width;
        scope[attrs.id].oldHeight = height;
      });
    }

    return {
      restrict: 'AE',
      link: link
    };
  })
  .directive('scrollChart', [function () {
    return {
      scope: true,
      link: function (scope, elem, attrs) {

        let originalLabels = angular.copy(Array.from(scope.chartData.labels.values()));
        let originalData = angular.copy(scope.chartData.data);
        let chartLabels = angular.copy(originalLabels);
        let chartData = angular.copy(originalData[0]);
        const factor = 25;

        angular.element(elem).bind('mousewheel', function (e) {
          const down = e.originalEvent.deltaY > 0;

          if (down) {
            let length = chartLabels.length - Math.round((chartLabels.length * factor / 100));
            chartLabels.length = length;
            chartData.length = length;

            if (originalData.length > 1) {
              let maxDate = chartLabels[length - 1];
              let creditDate = moment(originalData[1][1].x);

              if (maxDate && maxDate.isBefore(creditDate)) {
                scope.datasetOverride[1].hidden = true;
                scope.datasetOverride[2].hidden = true;
              }
            }

          } else {
            let length = chartLabels.length + Math.round((originalLabels.length * factor / 100));
            chartLabels = originalLabels.slice(0, length);
            chartData = originalData[0].slice(0, length);

            if (originalData.length > 1) {
              let maxDate = chartLabels[length - 1];
              let creditDate = moment(originalData[1][1].x);

              if (maxDate && maxDate.isAfter(creditDate)) {
                scope.datasetOverride[1].hidden = false;
                scope.datasetOverride[2].hidden = false;
              }
            }
          }

          scope.$apply(function () {
            scope[attrs.scrollChart].data[0] = chartData;
            scope[attrs.scrollChart].labels = chartLabels;
          })
        });
      }
    }
  }])
.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
  return {
    //scope: true,   // optionally create a child scope
    link: function (scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function (value) {
        if (value === true) {
          $timeout(function () {
            element[0].focus();
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function () {
        scope.$apply(model.assign(scope, false));
      });
    }
  };
}])
.directive('onEnterPress', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.onEnterPress);
        });

        event.preventDefault();
      }
    });
  };
})
.directive('onEscape', function () {
  return {
    restrict: 'A',
    scope: {
      fn: '&onEscape'
    },
    link: function(scope, elem, attrs) {
      elem.on('keydown', function (event) {
        if (event.keyCode === 27)
          scope.fn();
        scope.$apply();
      });
    }
  };
})
.directive('scrollBottom', function () {
  return {
    scope: {
      scrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('scrollBottom', function (newValue) {
        if (newValue) {
          $(element).scrollTop($(element)[0].scrollHeight);
        }
      });
    }
  }
});