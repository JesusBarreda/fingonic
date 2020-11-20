var mod = angular.module('Services', []);

/********************************************************************************************************************************
 * MsgService                                                                                                                   *
 *                                                                                                                              *
 * USO                                                                                                                          *
 * MsgService.setMensaje('nombreEventoMensaje', {"tipo": "[warning|danger|success|info]", "texto": "textoMensaje"});            *
 *                                                                                                                              *
 * RECEPCIÓN DESTINO:                                                                                                           *
 * $scope.$on('nombreEventoMensaje', function(event, data) {                                                                    *
 *   this.msg.tipo = data.tipo;                                                                                                 *
 *   this.msg.texto = data.texto;                                                                                               *
 *   $('#idDiv').show(); // Mostrar el div donde se ubica el mensaje.                                                           *
 *   $timeout(function() { $('#idDiv').fadeOut(500); }, 3000); // Hacer desaparecer gradualmente el div que muestra el mensaje. *
 * });                                                                                                                          *
 ********************************************************************************************************************************/ 
mod.service('MsgService', ['$rootScope', function($rootScope) {
	this.setMensaje = function(event, mensaje) {
		$rootScope.$broadcast(event, mensaje);
	};
}]);

/****************
 * LoginService *
 ****************/
mod.service('LoginService', ['$http', function($http) {
	this.login = function(user) {
    return $http.post('/api/login', user);
  };
}]);

/*****************
 * ConfigService *
 *****************/
mod.service('ConfigService', ['$q', '$http', 'CategoriasService', function($q, $http, CategoriasService) {
	this.getConfig = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/config').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
		  },
		  function error(res) {
		  	deferred.resolve({error: 'Se ha producido un error en el servicio'});
		  });

		return promise;
	};

	this.setConfig = function(config) {
		config.liquidez.fecha = dateStringToDate(config.liquidez.fecha);
		config.periodo_inversiones.fecha_desde = dateStringToDate(config.periodo_inversiones.fecha_desde);
		if(config.periodo_inversiones.fecha_hasta != '') {
			config.periodo_inversiones.fecha_hasta = dateStringToDate(config.periodo_inversiones.fecha_hasta);
		} else {
			config.periodo_inversiones.fecha_hasta = dateStringToDate('31/12/9999');
		}
		return $http.put('/api/config', config);
	};
}]);

/*********************
 * CategoriasService *
 *********************/
mod.service('CategoriasService', ['$q', '$http', function($q, $http) {
	this.getCategorias = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/categorias').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
		  },
		  function error(res) {
		  	deferred.resolve({error: 'Se ha producido un error en el servicio'});
		  });

		return promise;
	};

	this.modCategoria = function(cambioCategoria) {
		return $http.put('/api/categorias', cambioCategoria);
	};
}]);

/********************
 * ConceptosService *
 ********************/
mod.service('ConceptosService', ['$q', '$http', function($q, $http) {
	this.getConceptos = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/conceptos').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};
}]);

/**********************
 * MovimientosService *
 **********************/
mod.service('MovimientosService', ['$q', '$http', function($q, $http) {
  var self = this;

	self.addMovimiento = function(mov) {
		mov.fecha = dateStringToDate(mov.fecha);
		return $http.post('/api/movimientos', mov);
	};

	self.getMovimientos = function(fechaDesde, fechaHasta) {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/movimientos/' + fechaDesde + '/' + fechaHasta).then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};

	self.getMovimientosMesActual = function() {
		var fechaDesde = new Date().setDate(1);
		var fechaHasta = new Date().setDate(numDiasMes(new Date().getMonth() + 1, new Date().getFullYear()));

		fechaDesde = dateToDateString(new Date(fechaDesde), '-');
		fechaHasta = dateToDateString(new Date(fechaHasta), '-');

		return self.getMovimientos(fechaDesde, fechaHasta);
	};

	self.getMovimientosAgnoActual = function() {
		var fechaDesde = '01-01-' + new Date().getFullYear();
		var fechaHasta = '31-12-' + new Date().getFullYear();

		return self.getMovimientos(fechaDesde, fechaHasta);
	};

	self.delMovimiento = function(id) {
		return $http.delete('/api/movimientos/' + id);
	};

	self.modMovimiento = function(mov) {
		return $http.put('/api/movimientos', mov);
	};
}]);

/*********************
 * PatrimonioService *
 *********************/
mod.service('PatrimonioService', ['$q', '$http', function($q, $http) {
	this.getLiquidezMensual = function(mesDesde, mesHasta) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var urlApi = null;

		if(mesDesde == undefined && mesHasta == undefined) {
			urlApi = '/api/liquidez/evolutivo/mensual';
		} else {
			urlApi = '/api/liquidez/evolutivo/mensual/' + mesDesde + '/' + mesHasta;
		}

		$http.get(urlApi).then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};

	this.getLiquidezAnual = function(agnoDesde, agnoHasta) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var urlApi = null;

		if(agnoDesde == undefined && agnoHasta == undefined) {
			urlApi = '/api/liquidez/evolutivo/anual';
		} else {
			urlApi = '/api/liquidez/evolutivo/anual/' + agnoDesde + '/' + agnoHasta;
		}

		$http.get(urlApi).then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};

	this.getInversionesMensual = function(mesDesde, mesHasta) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var urlApi = null;

		if(mesDesde == undefined && mesHasta == undefined) {
			urlApi = '/api/inversiones/evolutivo/mensual';
		} else {
			urlApi = '/api/inversiones/evolutivo/mensual/' + mesDesde + '/' + mesHasta;
		}

		$http.get(urlApi).then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};

	this.getInversionesAnual = function(agnoDesde, agnoHasta) {
		var deferred = $q.defer();
		var promise = deferred.promise;
		var urlApi = null;

		if(agnoDesde == undefined && agnoHasta == undefined) {
			urlApi = '/api/inversiones/evolutivo/anual';
		} else {
			urlApi = '/api/inversiones/evolutivo/anual/' + agnoDesde + '/' + agnoHasta;
		}

		$http.get(urlApi).then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
			},
			function error(res) {
				deferred.resolve({error: 'Se ha producido un error en el servicio'});
			});

		return promise;
	};
}]);

/******************
 * ActivosService *
 ******************/
mod.service('ActivosService', ['$q', '$http', function($q, $http) {
	this.getActivos = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/inversiones/activos').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
		  },
		  function error(res) {
		  	deferred.resolve({error: 'Se ha producido un error en el servicio'});
		  });

		return promise;
	};

	this.addActivo = function(activo) {
		return $http.post('/api/inversiones/activo', activo);
	};

	this.delActivo = function(codigo) {
		return $http.delete('/api/inversiones/activos/' + codigo);
	};

	this.modActivo = function(activo) {
		return $http.put('/api/inversiones/activos', activo);
	};
}]);

mod.service('OperacionesService', ['$q', '$http', function($q, $http) {
	this.getOperaciones = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/inversiones/operaciones').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
		  },
		  function error(res) {
		  	deferred.resolve({error: 'Se ha producido un error en el servicio'});
		  });

		return promise;
	};

  this.addOperacion = function(operacion) {
  	operacion.fecha = dateStringToDate(operacion.fecha);
		return $http.post('/api/inversiones/operacion', operacion);
	};

	this.modOperacion = function(operacion) {
		return $http.put('/api/inversiones/operaciones', operacion);
	};

	this.delOperacion = function(id) {
		return $http.delete('/api/inversiones/operaciones/' + id);
	};
}]);

mod.service('PosicionService', ['$q', '$http', function($q, $http) {
	this.getPosicion = function() {
		var deferred = $q.defer();
		var promise = deferred.promise;

		$http.get('/api/inversiones/posicion').then(
			function(res) {
				var msg = res.data;
				deferred.resolve(msg);
		  },
		  function error(res) {
		  	deferred.resolve({error: 'Se ha producido un error en el servicio'});
		  });

		return promise;
	};
}]);

//----------------------------------------------------------------------------------------------------
// LOGOUT                                                                                             
//----------------------------------------------------------------------------------------------------
// En el caso de tener que hacer alguna acción en el lado del servidor al hacer Logout, habría hacerlo
// con el siguiente web service.
//
// mod.service('LogoutService', ['$http', function($http) {
//   this.logout = function() {
//     return $http.delete('/api/logout');
//   };
// }]);
//----------------------------------------------------------------------------------------------------