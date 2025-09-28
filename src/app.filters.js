angular.module('exzotron')
  .filter('trim', function () {
    return function (input) {
      return input ? input.toString().trim() : input;
    };
  });