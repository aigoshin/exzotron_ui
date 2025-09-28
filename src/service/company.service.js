angular.module('exzotron')
  .factory('CompanyService', ['$resource', 'API', function ($resource, API) {
    return $resource(API.getCompanyList, {}, {
      'getCompanyList': {method: 'GET', url: API.getCompanyList, isArray: true},
      'deleteCompany': {method: 'DELETE', url: API.deleteCompany, params: {companyId: '@companyId'}, isArray: false},
      'updateCompanyName': {
        method: 'PUT',
        url: API.updateCompanyName,
        params: {
          utc: '@utc',
          companyId: '@companyId',
          companyName: '@companyName',
          userId: '@userId',
          rfidInsertStatus: '@rfidInsertStatus',
          description: '@description',
          contactPay: '@contactPay',
          contactClient: '@contactClient',
          manager: '@manager',
          payDate: '@payDate',
          dealerId: '@dealerId',
          inn: '@inn'
        },
        isArray: false
      },
      'setDefaultCompany': {method: 'PUT', url: API.setDefaultCompany, params: {companyId: '@companyId'}, isArray: false},
      'addCompany': {method: 'POST', url: API.addCompany, params: {companyName: '@companyName'}, isArray: false},
      'get': {method: 'GET', url: API.company, isArray: true}
    });
  }]);
