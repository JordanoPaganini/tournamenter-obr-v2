var TOURNAMENTER_URL = '';

(function() {

	_.mixin({ deepClone: function (p_object) { return JSON.parse(JSON.stringify(p_object));}});

	var app = angular.module('app', [
		'ngRoute',
		
		'ngAnimate',
		'ngResource',

		'ui.bootstrap',

		'app.controllers',
		'app.scorers',
	])

	.config(['$routeProvider', function($routeProvider) {
		return $routeProvider

		.when('/score', {
			templateUrl: 'views-artistica/scorer.html'
		})
		.otherwise({
			redirectTo: '/score'
		});
	}])

	.factory('Table', ['$resource', function ($resource) {

		return $resource(TOURNAMENTER_URL + '/tables/:id', {id: '@id'}, {
			all: {
				url: TOURNAMENTER_URL + '/tables',
				isArray: true,
			},		
		});
	}])

	.factory('Score', ['$resource', function ($resource) {
		return $resource(TOURNAMENTER_URL + '/scores/:id', {id: '@id', number: '@number'}, {
			saveScore: {
				url: TOURNAMENTER_URL + '/scores/:id/:number',
			},
			get: {
				url: TOURNAMENTER_URL + '/scores/:id',
			}
		});
	}])

	.constant('SW_DELAY', 100)
	.factory('stopwatch', function (SW_DELAY, $timeout) {
		var data = {
			value: 0,
			state: 'STOPPED',
		},
		stopwatch = null

		var start = function () {;
			data.state = 'RUNNING';
			if (stopwatch) $timeout.cancel(stopwatch);
			stopwatch = $timeout(function() {
				data.value++;
				start();
			}, SW_DELAY);
		};

		var stop = function () {
			data.state = 'STOPPED';
			$timeout.cancel(stopwatch);
			stopwatch = null;
		};

		var reset = function () {
			stop()
			data.value = 0;
		};

		return {
			data: data,
			start: start,
			stop: stop,
			reset: reset,
		};

	});
}).call(this);