angular.module('exzotron')
  .factory('TankSensorService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getSensorsByTank, {}, {
      'getSensorsByTank': {method: 'GET', url: API.getSensorsByTank, params: {tankId: '@tankId'}, isArray: true},
      'getSensor': {method: 'GET', url: API.getTankSensor, params: {id: '@id'}, isArray: false},
      'deleteSensor': {method: 'DELETE', url: API.deleteTankSensor, params: {sensorId: '@sensorId'}, isArray: false},
      'getSensorTypes': {method: 'GET', url: API.getTankSensorTypes, isArray: true},
      'saveSensor': {method: 'POST', url: API.saveTankSensor, isArray: false},
      'getSourceData': {method: 'GET', url: API.getSourceData, isArray: true}
    });
  }]);
