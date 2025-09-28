angular.module('exzotron')
  .factory('BalanceService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getAccountOperations, {}, {
      'getAccountOperations': {
        method: 'GET',
        url: API.getAccountOperations,
        params: {startDate: '@startDate', endDate: '@endDate', groupByObjects: '@groupByObjects'},
        isArray: true
      },
      'getObjectRfidBalance': {
        method: 'GET',
        url: API.getObjectRfidBalance,
        params: {startDate: '@startDate', endDate: '@endDate', all: '@all',byVehicle: '@byVehicle', groupByObjects: '@groupByObjects'},
        isArray: true
      },
      'getObjectBalance': {
        method: 'GET',
        url: API.getObjectBalance,
        params: {startDate: '@startDate', endDate: '@endDate'},
        isArray: true
      },
      'setLoadApi' : {
        method: 'PATCH',
        url: API.setLoadApi,
        params: {id: '@id', startDate: '@startDate', endDate: '@endDate'},
      },
      'setVehicleId' : {
        method: 'PATCH',
        url: API.setVehicleId,
        params: {operationLogId: '@operationLogId', vehicleId: '@vehicleId'},
      },
      'getTankData': {
        method: 'GET',
        url: API.getTankData,
        params: {vehicleId: '@vehicleId', startDate: '@startDate', endDate: '@endDate'},
        isArray: false
      },
      'getWialonIncome': {
        method: 'GET',
        url: API.getWialonIncome,
        params: {id: '@id'},
        isArray: false
      },
      'toggleDeleteStatus' : {
        method: 'POST',
        url: API.toggleDeleteStatus,
        params: {operationId: '@operationId'},
      }
    });
  }]);
