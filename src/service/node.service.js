angular.module('exzotron')
  .factory('NodeService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.node, {}, {
      'get': {method: 'GET', isArray: true},
      'getOne': {method: 'GET', isArray: false, url: API.node + '/:id'},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'getNodeTypes': {method: 'GET', url: API.getNodeTypes, isArray: true},
      'getCounterTypes': {method: 'GET', url: API.getCounterTypes, isArray: true},
      'getNodeLevelObjects': {method: 'GET', url: API.getNodeLevelObjects, isArray: true},
      'setVisible': {method: 'PATCH', url: API.setNodeVisible, params: {id: '@id', visible: '@visible'}, isArray: false}
    });
  }]);
