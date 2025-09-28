angular.module('exzotron')
  .factory('UserInfoTaskService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.userInformationTask, {}, {
      'get': {method: 'GET', isArray: true},
      'add': {method: 'POST', isArray: false},
      'save': {method: 'PUT', isArray: false},
      'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}},
      'types': {url: API.userInformationTask + '/types', method: 'GET', isArray: true}
    });
  }]);
