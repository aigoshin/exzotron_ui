angular.module('exzotron')
  .controller('ObservationObjectController', ['$scope', '$rootScope', 'ObservationObjectService', 'toaster', 'DivisionService', 'ObjectService', 'WebSocketService',
    function ($scope, $rootScope, ObservationObjectService, toaster, DivisionService, ObjectService, WebSocketService) {
      $scope.cameras = [];
      $scope.selectedCamera = null;
      $scope.newCamera = {};
      $scope.search = '';
      $scope.divisions = [];
      $scope.objects = [];

      $scope.observationObjectSplitPaneProperties = {};

      $rootScope.$watch('ui.search', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.search = newVal;
        }
      }, true);

      $scope.getCameras = function () {
        ObservationObjectService.get({}, function (result) {
          $scope.cameras = result;
          $scope.getCameraDataLast(result);
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getCameraDataLast = function (cameras) {
        let cameraIds = cameras.map(function (item){
          return item.id;
        });
        if(!cameraIds.length) return;
        ObservationObjectService.getCameraDataLast({cameraIds: cameraIds}, function (result) {
          $scope.cameraDataLast = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.add = function () {
        ObservationObjectService.add($scope.newCamera, function (result) {
          $scope.newCamera = {};
          $scope.getCameras();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.save = function () {
        ObservationObjectService.save($scope.selectedCamera, function (result) {
          $scope.selectedCamera = null;
          $scope.getCameras();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.delete = function (item) {
        ObservationObjectService.delete({'id': item.id}, function (result) {
          $scope.getCameras();
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getObjects = function () {
        ObjectService.getObjects({}, function (result) {
          $scope.objects = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.getDivisions = function () {
        DivisionService.get({}, function (result) {
          $scope.divisions = result;
        }, function (error) {
          toaster.pop('error', "", error.data.message);
        });
      };

      $scope.edit = function (item) {
        $scope.selectedCamera = angular.copy(item)
      };

      $scope.cancel = function () {
        $scope.selectedCamera = null;
      }

      $scope.setCurrentCamera = function (item) {
        $scope.currentCamera = item;
        $rootScope.$broadcast('setCurrentCamera', {currentCamera: $scope.currentCamera})
      }

      $rootScope.$watch('ui.dateFrom', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          // $rootScope.$broadcast('setCurrentCamera', {currentCamera: $scope.currentCamera})
        }
      }, true);

      $rootScope.$watch('ui.dateTo', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          // $rootScope.$broadcast('setCurrentCamera', {currentCamera: $scope.currentCamera})
        }
      }, true);

      $scope.getCameras();
      $scope.getDivisions();
      $scope.getObjects();

      $scope.videoUrl = '';

      // WebSocketService.connect(function() {
      //   WebSocketService.subscribe('/topic/video', function(message) {
      //     // Обработка полученного сообщения
      //     const blob = new Blob([new Uint8Array(message.body)], { type: 'video/mp2t' });
      //     $scope.videoUrl = URL.createObjectURL(blob); // Создание URL для видео
      //   });
      // });

      $scope.connect = function (){
        const video = document.getElementById('video');
        const socket = new WebSocket('ws://localhost:8081/stream');

        socket.binaryType = 'arraybuffer';
        socket.onmessage = function(event) {
          const blob = new Blob([event.data], { type: 'video/mp2t' });
          const url = URL.createObjectURL(blob);
          video.src = url;
        };

        socket.onclose = function() {
          console.log('WebSocket connection closed');
        };
      }

      // $scope.$on('$destroy', function() {
      //   WebSocketService.disconnect();
      // });

      function base64ToBinary(base64) {
        // Декодируем строку Base64 в строку символов
        const binaryString = atob(base64);

        // Создаем массив байтов
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        // Заполняем массив байтов
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes;
      }
    }]);
