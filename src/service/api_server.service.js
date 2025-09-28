angular.module('exzotron')
  .factory('ApiServerService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.apiServer, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'testConnection': {
        method: 'GET',
        url: API.testConnection,
        isArray: false,
        params: {id: '@id'},
        transformResponse: function (data) {
          return {data: data};
        }
      },
      'getApiServerTypes': {method: 'GET', url: API.getApiServerTypes, isArray: true},
      'getObjectsByServerId': {method: 'GET', url: API.getObjectsByServerId, isArray: true, params: {id: '@id'}},
      'getObjectsRfidByServerId': {
        method: 'GET',
        url: API.getObjectsRfidByServerId,
        isArray: true,
        params: {id: '@id'}
      },
      'synchronizeObjects': {method: 'POST', url: API.synchronizeObjects, isArray: false},
      'synchronizeRfidObjects': {method: 'POST', url: API.synchronizeRfidObjects, isArray: false},
      'setActive': {method: 'PATCH', url: API.setServerActive, params: {id: '@id', active: '@active'}, isArray: false},
    });
  }]);
