var mod = angular.module('Directives', []);

mod.directive('edicionMovimiento', [function() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '../views/directives/edicionMovimiento.tpl'
	};
}]);

mod.directive('edicionCategoria', [function() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '../views/directives/edicionCategoria.tpl'
	};
}]);

mod.directive('edicionActivo', [function() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: '../views/directives/edicionActivo.tpl'
	};
}]);

mod.directive('edicionOperacion', [function() {
	return {
		restrict: 'E',
		scope: {
			activos: '='
		},
		templateUrl: '../views/directives/edicionOperacion.tpl'
	};
}]);
