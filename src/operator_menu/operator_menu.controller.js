angular.module('exzotron')
  .controller('OperatorMenuController', ['$scope', '$rootScope', 'toaster', 'NodeService', '$filter',
    function ($scope, $rootScope, toaster, NodeService, $filter) {
      $scope.operatorMenuSplitPaneProperties = {};

      $scope.colors = [
        "#2b75c3",
        "#ee0e0e",
        "#d0db34",
        "#21b308",
        "#8d8d8d"
      ];

      $scope.items = [];
      $scope.getNodeLevelObjects = function () {
        $scope.inProgress = true;
        $scope.items = [];

        var startDate = moment($rootScope.ui.dateFrom).format('YYYY-MM-DD HH:mm:ss');
        var endDate = moment($rootScope.ui.dateTo).format('YYYY-MM-DD HH:mm:ss');
        NodeService.getNodeLevelObjects({startDate, endDate}, function (result) {

          const chunkSize = $scope.colors.length;
          for (let i = 0; i < result.length; i += chunkSize) {
            const chunk = result.slice(i, i + chunkSize);
            chunk.forEach(function (item, idx) {
              item.color = $scope.colors[idx];
            });
            $scope.items.push(chunk);
          }
          $scope.items = $scope.items.flat(Infinity);

          $scope.inProgress = false;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });

      };

      $scope.selectNode = function (node) {
        $rootScope.$broadcast('selectNode', node);
      }

      $rootScope.$watch('currentUser.currentProductId', function (newVal, oldVal) {
        if (newVal !== oldVal && !$scope.inProgress) {
          $scope.getNodeLevelObjects();
        }
      }, true);

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if (newVal !== oldVal && !$scope.inProgress) {
          $scope.getNodeLevelObjects();
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if (newVal !== oldVal && !$scope.inProgress) {
          $scope.getNodeLevelObjects();
        }
      }, true);

      $rootScope.$on('updateCurrentDivision', function (event, data) {
        $scope.getNodeLevelObjects();
      });

      $scope.getNodeLevelObjects();
    }]);
