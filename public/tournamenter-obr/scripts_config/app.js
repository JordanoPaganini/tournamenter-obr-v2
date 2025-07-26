var URL_CONFIG = '/api/scorer-config';

moment.locale('pt-BR');

var app = angular.module('app', [
  'ngRoute',
  'ngAnimate',
  'ngResource',

  'ui.bootstrap',

  'app.api',
  'app.importar',
  'app.exportar',
])

.controller('AppCtrl', function ($scope, $timeout) {
  $scope.loaded = false

  $timeout(function (){
    $scope.loaded = true
  }, 500)
})

.controller('ConfigCtrl', function($scope, $http) {
  $scope.config = { interview: {}, presentation: {} };

  $http.get(URL_CONFIG).then(res => {
    $scope.config = res.data;
  });

  $scope.salvar = function (){
    $http.post(URL_CONFIG, $scope.config)
      .then(() => alert('Salvo com sucesso!'));
  };
});