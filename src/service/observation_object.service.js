angular.module('exzotron')
  .factory('ObservationObjectService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.camera, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'getCameraData': {
        method: 'GET',
        url: API.cameraData,
        isArray: true,
        params: {cameraId: '@cameraId', startDate: '@startDate', endDate: '@endDate'}
      },
      'getCameraDataLast': {
        method: 'GET',
        url: API.cameraDataLast,
        isArray: true,
        params: {cameraIds: '@cameraIds'}
      }
    });
  }]);
