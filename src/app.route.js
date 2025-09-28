(function () {
  'use strict';

  angular
    .module('app.route', ['app.config', 'ngRoute'])
    .config(configBlock);

  function configBlock($routeProvider) {
    $routeProvider.when('/company', {
      templateUrl: '/static/src/company/company.html',
      controller: 'CompanyController'
    });
    $routeProvider.when('/object', {
      templateUrl: '/static/src/object/object.html',
      controller: 'ObjectController'
    });
    $routeProvider.when('/object_rfid', {
      templateUrl: '/static/src/object_rfid/object_rfid.html',
      controller: 'ObjectRfidController'
    });
    $routeProvider.when('/balance', {
      templateUrl: '/static/src/balance/balance.html',
      controller: 'BalanceController'
    });
    $routeProvider.when('/fuel_storage', {
      templateUrl: '/static/src/fuel_storage/fuel_storage.html',
      controller: 'FuelStorageController'
    });
    $routeProvider.when('/division', {
      templateUrl: '/static/src/division/division.html',
      controller: 'DivisionController'
    });
    $routeProvider.when('/tank', {
      templateUrl: '/static/src/tank/tank.html',
      controller: 'TankController'
    });
    $routeProvider.when('/storehouse', {
      templateUrl: '/static/src/storehouse/storehouse.html',
      controller: 'StorehouseController'
    });
    $routeProvider.when('/node', {
      templateUrl: '/static/src/node/node.html',
      controller: 'NodeController'
    });
    $routeProvider.when('/partner', {
      templateUrl: '/static/src/partner/partner.html',
      controller: 'PartnerController'
    });
    $routeProvider.when('/income', {
      templateUrl: '/static/src/income/income.html',
      controller: 'IncomeController'
    });
    $routeProvider.when('/employee', {
      templateUrl: '/static/src/employee/employee.html',
      controller: 'EmployeeController'
    });
    $routeProvider.when('/vehicle', {
      templateUrl: '/static/src/vehicle/vehicle.html',
      controller: 'VehicleController'
    });
    $routeProvider.when('/report_object', {
      templateUrl: '/static/src/report_object/report_object.html',
      controller: 'ReportObjectController'
    });
    $routeProvider.when('/report_rfid', {
      templateUrl: '/static/src/report_rfid/report_rfid.html',
      controller: 'ReportRfidController'
    });
    $routeProvider.when('/api_server', {
      templateUrl: '/static/src/api_server/api_server.html',
      controller: 'ApiServerController'
    });
    $routeProvider.when('/user', {
      templateUrl: '/static/src/user/user.html',
      controller: 'UserController'
    });
    $routeProvider.when('/report_object_income', {
      templateUrl: '/static/src/report_income_object/report_income_object.html',
      controller: 'ReportObjectIncomeController'
    });
    $routeProvider.when('/report_vehicle_income', {
      templateUrl: '/static/src/report_income_vehicle/report_income_vehicle.html',
      controller: 'ReportVehicleIncomeController'
    });
    $routeProvider.when('/report_fuel_moving', {
      templateUrl: '/static/src/report_fuel_moving/report_fuel_moving.html',
      controller: 'ReportFuelMovingController'
    });
    $routeProvider.when('/report_weighting', {
      templateUrl: '/static/src/report_weighting/report_weighting.html',
      controller: 'ReportWeightingController'
    });
    $routeProvider.when('/report_weighting_rfid', {
      templateUrl: '/static/src/report_weighting_rfid/report_weighting_rfid.html',
      controller: 'ReportWeightingRfidController'
    });
    $routeProvider.when('/report_division', {
      templateUrl: '/static/src/report_division/report_division.html',
      controller: 'ReportDivisionController'
    });
    $routeProvider.when('/calibration', {
      templateUrl: '/static/src/calibration/calibration.html',
      controller: 'CalibrationController'
    });
    $routeProvider.when('/operator_menu', {
      templateUrl: '/static/src/operator_menu/operator_menu.html',
      controller: 'OperatorMenuController'
    });
    $routeProvider.when('/fuel_income', {
      templateUrl: '/static/src/product_operation_income/product_operation_income.html',
      controller: 'ProductOperationIncomeController'
    });
    $routeProvider.when('/fuel_moving', {
      templateUrl: '/static/src/product_operation_moving/product_operation_moving.html',
      controller: 'ProductOperationMovingController'
    });
    $routeProvider.when('/inventory', {
      templateUrl: '/static/src/product_operation_inventory/product_operation_inventory.html',
      controller: 'ProductOperationInventoryController'
    });
    $routeProvider.when('/enrol', {
      templateUrl: '/static/src/product_operation_enrol/product_operation_enrol.html',
      controller: 'ProductOperationEnrolController'
    });
    $routeProvider.when('/user_info_task', {
      templateUrl: '/static/src/user_info_task/user_info_task.html',
      controller: 'UserInfoTaskController'
    });
    $routeProvider.when('/observation_object', {
      templateUrl: '/static/src/observation_object/observation_object.html',
      controller: 'ObservationObjectController'
    });
    $routeProvider.when('/report_totals_rfid', {
      templateUrl: '/static/src/report_totals_rfid/report_totals_rfid.html',
      controller: 'ReportTotalsRfidController'
    });
    $routeProvider.when('/report_detailed_rfid', {
      templateUrl: '/static/src/report_detailed_rfid/report_detailed_rfid.html',
      controller: 'ReportDetailedRfidController'
    });
    $routeProvider.when('/report_detailed_storehouse', {
      templateUrl: '/static/src/report_detailed_storehouse/report_detailed_storehouse.html',
      controller: 'ReportDetailedStorehouseController'
    });
    $routeProvider.when('/report_fuel_moving_internal', {
      templateUrl: '/static/src/report_fuel_moving_internal/report_fuel_moving_internal.html',
      controller: 'ReportFuelMovingInternalController'
    });
    $routeProvider.when('/report_vehicle_totals_and_details', {
      templateUrl: '/static/src/report_vehicle_totals_and_details/report_vehicle_totals_and_details.html',
      controller: 'ReportVehicleTotalsAndDetailsController'
    });
    $routeProvider.when('/weight_operations', {
      templateUrl: '/static/src/weight_operations/weight_operations.html',
      controller: 'WeightOperationsController'
    });
    $routeProvider.when('/trailers', {
      templateUrl: '/static/src/trailer/trailer.html',
      controller: 'TrailerController'
    });
    $routeProvider.when('/report_weighting_product', {
      templateUrl: '/static/src/report_weighting_product/report_weighting_product.html',
      controller: 'ReportWeightingProductController'
    });
    $routeProvider.otherwise({redirectTo: '/'});
  }
})();