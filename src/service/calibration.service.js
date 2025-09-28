angular.module('exzotron')
  .factory('CalibrationService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.calibration, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'getCalibrationTable': {
        method: 'GET',
        url: API.calibrationTable,
        isArray: true,
        params: {calibrationId: '@calibrationId'}
      },
      'getCalibrationLogPhotos': {
        method: 'GET',
        url: API.calibrationLogPhoto,
        isArray: true,
        params: {calibrationId: '@calibrationId'}
      }
    });
  }]);
