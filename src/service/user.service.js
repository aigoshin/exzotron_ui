angular.module('exzotron')
  .factory('UserService', ['$resource', 'API', function ($resource, API) {
    return {
      request: $resource(API.currentUser, {}, {
        'get': {method: 'GET', isArray: false},
        'create': {method: 'POST', url: API.createUser, isArray: false},
        'sendPassword': {method: 'GET', url: API.sendPassword, params: {email: '@email'}, isArray: false},
        'setTheme': {method: 'PUT', url: API.setTheme, params: {theme: '@theme'}, isArray: false},
        'setByRemains': {method: 'PUT', url: API.setByRemains, params: {byRemains: '@byRemains'}, isArray: false},
        'getUsers': {method: 'GET', url: API.getUsers, isArray: true},
        'getUserRoles': {method: 'GET', url: API.getUserRoles, isArray: true},
        'getUsersByCurrentCompany': {method: 'GET', url: API.getUsersByCurrentCompany, isArray: true},
        'getMessages': {method: 'GET', url: API.getMessages, isArray: true},
        'sendMessage': {method: 'POST', url: API.userMessages, isArray: false}
      }),
      storage: {
        currentUser: null
      },
      crud: $resource(API.user, {}, {
        'get': {method: 'GET', isArray: true},
        'add': {method: 'POST', isArray: false},
        'save': {method: 'PUT', isArray: false},
        'roles': {method: 'GET', url: API.getUserRoles, isArray: true},
        'delete': {method: 'DELETE', isArray: false, params: {id: '@id'}}
      })
    }
  }]);
