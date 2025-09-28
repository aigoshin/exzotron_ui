angular.module('exzotron')
  .factory('MenuService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.menuItems, {}, {
      'get': {method: 'GET', isArray: true},
      'getAllMenuItems': {method: 'GET', url: API.getAllMenuItems, isArray: true},
      'updateStartMenu': {
        method: 'PUT',
        url: API.updateStartMenu,
        params: {usersId: '@usersId', menuId: '@menuId'},
        isArray: true
      },
      'getChildMenuItems': {
        method: 'GET',
        url: API.getChildMenuItems,
        params: {menuId: '@menuId'},
        isArray: true
      },
      'getParentMenuItems': {
        method: 'GET',
        url: API.getParentMenuItems,
        params: {menuId: '@menuId'},
        isArray: true
      }
    });
  }]);
