var app = angular.module('Fingonic', ['ui.router', 'chart.js', 'Directives', 'Factories', 'Services']);

app.constant('agnosAtrasGraficaAnual', 3);

app.constant('meses', [
  {'texto': 'Ene', 'valor': '01'},
  {'texto': 'Feb', 'valor': '02'},
  {'texto': 'Mar', 'valor': '03'},
  {'texto': 'Abr', 'valor': '04'},
  {'texto': 'May', 'valor': '05'},
  {'texto': 'Jun', 'valor': '06'},
  {'texto': 'Jul', 'valor': '07'},
  {'texto': 'Ago', 'valor': '08'},
  {'texto': 'Sep', 'valor': '09'},
  {'texto': 'Oct', 'valor': '10'},
  {'texto': 'Nov', 'valor': '11'},
  {'texto': 'Dic', 'valor': '12'}
]);

app.constant('tiposVista', [
  {'codigo': 'DD', 'descripcion': 'Detalle Diario'},
  {'codigo': 'DM', 'descripcion': 'Detalle Mensual'},
  {'codigo': 'DA', 'descripcion': 'Detalle Anual'},
  {'codigo': 'DT', 'descripcion': 'Detalle Total'},
  {'codigo': 'CD', 'descripcion': 'Categoría Diario'},
  {'codigo': 'CM', 'descripcion': 'Categoría Mensual'},
  {'codigo': 'CA', 'descripcion': 'Categoría Anual'},
  {'codigo': 'CT', 'descripcion': 'Categoría Total'},
  {'codigo': 'TD', 'descripcion': 'Total Diario'},
  {'codigo': 'TM', 'descripcion': 'Total Mensual'},
  {'codigo': 'TA', 'descripcion': 'Total Anual'},
  {'codigo': 'GCM', 'descripcion': 'Gráfica Curva Mensual'},
  {'codigo': 'GCA', 'descripcion': 'Gráfica Curva Anual'},
  {'codigo': 'GBM', 'descripcion': 'Gráfica Barras Mensual'},
  {'codigo': 'GBA', 'descripcion': 'Gráfica Barras Anual'},
  {'codigo': 'GCPM', 'descripcion': 'Gráfica Curva Patrimonio Mensual'},
  {'codigo': 'GCPA', 'descripcion': 'Gráfica Curva Patrimonio Anual'},
  {'codigo': 'GBPM', 'descripcion': 'Gráfica Barras Patrimonio Mensual'},
  {'codigo': 'GBPA', 'descripcion': 'Gráfica Barras Patrimonio Anual'}
]);

app.constant('optionsGraficas', {
  scales: {
    yAxes: [{
      stacked: true,
      ticks: {
        callback: function(label, index, labels) {
          return formatImporte(label) + ' €';
        }
      }
    }],
    xAxes: [{
      stacked: true
    }]
  },
  tooltips: {
    callbacks: {
      label: function(tooltipItem, data) {
        // Si quisieramos acceder al nombre de la serie, lo podemos hacer a través de:
        // data.datasets[tooltipItem.datasetIndex].label;
        return formatImporte(tooltipItem.yLabel) + ' €';
      }
    }
  }
});

/***************************************
 * Sintaxis de un filtro para un array *
 ***************************************/
// app.filter('nombreFiltro', function() {
//   return function(array, param1, param2) {
//     var res = [];
//     angular.forEach(array, function(itemArray) {
//       // Condiciones del filtrado en base a los parámetros (param1, param2)
//       res.push(itemArray);
//     });
//     
//     return res;
//   };
// });
//
// En el TPL (ng-repeat o ng-options)
// ng-options="mes.texto for mes in ctrlFiltro.meses | nombreFiltro:param1:param2"

app.run(['$rootScope', '$state', '$stateParams', '$window', function($rootScope, $state, $stateParams, $window) {
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		if(toState.name != 'login' && $window.sessionStorage.token == undefined) {
			$state.go('login');
			event.preventDefault();
		} else if(toState.name == 'login' && $window.sessionStorage.token != undefined) {
      $state.go($window.sessionStorage.vistaMovimientos);
      event.preventDefault();
    }
  });
}]);

app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', function($httpProvider, $stateProvider, $urlRouterProvider) {
  $httpProvider.interceptors.push('securityInterceptor');

	$stateProvider
    /*********
     * login *
     *********/
    .state('login', {
    	url: '/login',
      templateUrl: '../views/login.tpl',
      controller: ['$state', '$timeout', '$window', 'ConfigService', 'LoginService', function($state, $timeout, $window, ConfigService, LoginService) {
        var self = this;

        self.user = {};
        self.msg = {};

        $('#inputUsername').focus();

        self.login = function() {
          if(self.user.name == undefined || self.user.name == '') {
            self.msg.tipo = 'warning';
            self.msg.texto = 'Introduce el usuario';
            mostrarMensaje();
          } else if(self.user.password == undefined || self.user.password == '') {
            self.msg.tipo = 'warning';
            self.msg.texto = 'Introduce la password';
            mostrarMensaje();
          } else {
            bloquearForm(true);
            self.msg.tipo = 'success';
            self.msg.texto = 'Realizando login...';
            LoginService.login(self.user).then(
              function(res) {
                var msg = res.data;
                var user = msg.data;
                if(msg.error != '') {
                  bloquearForm(false);
                  self.msg.tipo = 'danger';
                  self.msg.texto = msg.error;
                  mostrarMensaje();
                } else {
                  $window.sessionStorage.token = user.token;
                  ConfigService.getConfig().then(
                    function(msg) {
                      if(msg.error != '') {
                        bloquearForm(false);
                        self.msg.tipo = 'danger';
                        self.msg.texto = msg.error;
                        mostrarMensaje();
                      } else {
                        $window.sessionStorage.vistaMovimientos = getVistaMovimientos(msg.data.tipo_vista);
                        $state.go($window.sessionStorage.vistaMovimientos);
                      }
                    },
                    function error(res) {
                      bloquearForm(false);
                      self.msg.tipo = 'danger';
                      self.msg.texto = 'Se ha producido un error en el servicio';
                      mostrarMensaje();
                    }
                  );
                }
              },
              function error(res) {
                bloquearForm(false);
                self.msg.tipo = 'danger';
                self.msg.texto = 'Se ha producido un error realizando el login';
                mostrarMensaje();
              }
            );
          }
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              self.msg.tipo = '';
              self.msg.texto = '';
            }, 3000);
          }
        };

        function bloquearForm(bloquear) {
          $('#inputUsername').prop('disabled', bloquear);
          $('#inputPassword').prop('disabled', bloquear);
          $('#buttonLogin').prop('disabled', bloquear);
        };
      }],
      controllerAs: 'ctrlLogin'
    })
    /********
     * home *
     ********/
    .state('home', {
      abstract: true,
      url: '',
      templateUrl: '../views/home.tpl',
      controller: ['$state', '$window', function($state, $window) {
        this.logout = function() {
          bootbox.confirm({
            message: '¿Estás seguro?',
            title: 'Logout',
            buttons: {
              confirm: {
                label: 'Logout',
                className: 'btn btn-danger pull-right width100 cursorPointer'
              },
              cancel: {
                label: 'Cancelar',
                className: 'btn btn-secondary pull-right width100 cursorPointer'
              }
            },
            callback: function(logout) {
              if(logout) {
                $window.sessionStorage.clear();
                $state.go('login');
              }
            },
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });
        }
      }],
      controllerAs: 'ctrlHome'
    })
    /***************
     * home.config *
     ***************/
    .state('home.config', {
      url: '/config',
      templateUrl: '../views/config.tpl',
      resolve: {
        config: ['ConfigService', function(ConfigService) {
          return ConfigService.getConfig();
        }],
        categorias: ['CategoriasService', function(CategoriasService) {
          return CategoriasService.getCategorias();
        }]
      },
      controller: ['$state', '$timeout', '$window', 'categorias', 'CategoriasService', 'config', 'ConfigService', 'tiposVista', function($state, $timeout, $window, categorias, CategoriasService, config, ConfigService, tiposVista) {
        var self = this;

        self.nombreVista = 'Config';
        self.error = '';
        self.msg = {};
        self.msg.tipo = '';
        self.msg.texto = '';
        self.tiposVista = tiposVista;

        if(config.error != '') {
          self.error = config.error;
        } else {
          if(categorias.error != '') {
            self.error = categorias.error;
          } else {
            self.config = config.data;

            self.config.liquidez.fecha = moment(self.config.liquidez.fecha, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY');
            $('#inputFechaLiquidez').datepicker('update', self.config.liquidez.fecha);

            self.config.periodo_inversiones.fecha_desde = moment(self.config.periodo_inversiones.fecha_desde, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY');
            $('#inputFechaDesdeInversiones').datepicker('update', self.config.periodo_inversiones.fecha_desde);

            self.config.periodo_inversiones.fecha_hasta = moment(self.config.periodo_inversiones.fecha_hasta, 'YYYY-MM-DDTHH:mm:ss').format('DD/MM/YYYY');
            if(self.config.periodo_inversiones.fecha_hasta == '31/12/9999') {
              self.config.periodo_inversiones.fecha_hasta = '';
            } else {
              $('#inputFechaHastaInversiones').datepicker('update', self.config.periodo_inversiones.fecha_hasta);
            }

            self.categorias = categorias.data;
            self.todasCategoriasSel = self.config.categorias[0] == '*';
            if(self.todasCategoriasSel) {
              self.config.categorias = _.clone(self.categorias);
            }
          }
        }

        self.editar = function(cat) {
          var modal = bootbox.dialog({
            message: $('#divEdicionCategoria').html(),
            title: 'Edición categoría',
            buttons: [
              { label: 'Cerrar',
                className: 'btn btn-secondary pull-right cursorPointer',
                callback: function() {
                  return true;
                }
              },
              { label: 'Modificar',
                className: 'btn btn-primary marginRight10 pull-right cursorPointer',
                callback: function() {
                  var categoria = modal.find('#inputCategoria');

                  if(categoria.val() == '') {
                    alert('Debes indicar la categoría');
                    categoria.focus();
                    return false;
                  }

                  var cambioCategoria = {
                    categoria_antigua: cat,
                    categoria_nueva: categoria.val()
                  };

                  CategoriasService.modCategoria(cambioCategoria).then(
                    function(res) {
                      var msg = res.data;
                      if(msg.error == '') {
                        $state.reload();
                        return true;
                      } else {
                        self.error = msg.error;
                        return true;
                      }
                    },
                    function error(res) {
                      self.error = 'Se ha producido un error en el servicio';
                      return true;
                    }
                  );
                }
              }
            ],
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });

          modal.find('#inputCategoria').val(cat);
        };

        self.categoriaSel = function(categoria) {
          return self.config.categorias[0] == '*' || $.inArray(categoria, self.config.categorias) != -1;
        };
        
        self.check = function(categoria) {
          var index = $.inArray(categoria, self.config.categorias);
          if(index == -1) {
            self.config.categorias.push(categoria);
            self.config.categorias.sort();            
          } else {
            self.config.categorias.splice(index, 1);
          }

          self.todasCategoriasSel = arraysIguales(self.config.categorias, self.categorias);
        };

        self.checkTodas = function() {
          if(self.todasCategoriasSel) {
            self.config.categorias = _.clone(self.categorias);
          } else {
            self.config.categorias = [];
          }
        };

        self.modificar = function() {
          if(self.config.liquidez.saldo == '') {
            alert('Debes indicar el saldo');
            $('#inputSaldoLiquidez').focus();
            return;
          }

          if(!isNumber(self.config.liquidez.saldo)) {
            alert('El saldo indicado no es válido');
            $('#inputSaldoLiquidez').focus();
            return;
          }

          self.config.liquidez.saldo = parseFloat(self.config.liquidez.saldo);

          if(self.config.liquidez.fecha == undefined || self.config.liquidez.fecha == '') {
            $('#inputFechaLiquidez').focus();
            alert('Debes indicar la fecha del saldo especificado');
            return;
          }

          if(self.config.periodo_inversiones.fecha_desde == undefined || self.config.periodo_inversiones.fecha_desde == '') {
            $('#inputFechaDesdeInversiones').focus();
            alert('Debes indicar la fecha a partir de la cual analizar la posición de las inversiones');
            return;
          }

          if(self.config.categorias.length == 0 && !self.todasCategoriasSel) {
            alert('Debes seleccionar al menos una categoría');
            return;
          }

          if(!self.config.ingresos && !self.config.gastos) {
            alert('Debes seleccionar al menos un tipo de movimiento');
            return;
          }

          if(arraysIguales(self.config.categorias, self.categorias)) {
            self.config.categorias.length = 0;
            self.config.categorias[0] = '*';
          }

          ConfigService.setConfig(self.config).then(
            function(res) {
              var msg = res.data;
              if(msg.error == '') {
                self.msg.tipo = 'warning';
                self.msg.texto = 'Configuración grabada';
                $window.sessionStorage.vistaMovimientos = getVistaMovimientos(self.config.tipo_vista);
                $state.go($window.sessionStorage.vistaMovimientos);
              } else {
                self.msg.tipo = 'danger';
                self.msg.texto = res.error;
              }
              mostrarMensaje();
            },
            function error(res) {
              self.msg.tipo = 'danger';
              self.msg.texto = 'Se ha producido un error grabando la configuración';
              mostrarMensaje();
            }
          );
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              self.msg.tipo = '';
              self.msg.texto = '';
            }, 3000);
          }
        };
      }],
      controllerAs: 'ctrlConfig'
    })
    /*******************
     * home.movimiento *
     *******************/
    .state('home.movimiento', {
      url: '/movimiento',
      templateUrl: '../views/movimiento.tpl',
      resolve: {
        categorias: ['CategoriasService', function(CategoriasService) {
          return CategoriasService.getCategorias();
        }],
        conceptos: ['ConceptosService', function(ConceptosService) {
          return ConceptosService.getConceptos();
        }]
      },
      controller: ['$state', '$timeout', 'categorias', 'conceptos', 'MovimientosService', function($state, $timeout, categorias, conceptos, MovimientosService) {
        var self = this;

        self.nombreVista = 'Nuevo Movimiento';
        self.error = '';
        self.msg = {};
        self.msg.tipo = '';
        self.msg.texto = '';
        self.movimiento = {};
        
        self.movimiento.fecha = moment(new Date()).format('DD/MM/YYYY');
        $('#inputFecha').datepicker('update', self.movimiento.fecha);
        
        self.movimiento.categoria = '';
        self.movimiento.concepto = '';
        self.movimiento.importe = '';
        self.mostrarBusquedaCategoria = false;
        self.mostrarBusquedaConcepto = false;

        if(categorias.error != '') {
          self.error = categorias.error;
        } else {
          self.categorias = categorias.data;
          if(conceptos.error != '') {
            self.error = conceptos.error;
          } else {
            self.conceptos = conceptos.data;
          }
        }

        self.aceptar = function() {
          if(isNumber(self.movimiento.importe)) {
            self.movimiento.importe = parseFloat(self.movimiento.importe);
            if(self.movimiento.importe == 0) {
              alert('El importe no puede ser 0');
            } else {
              MovimientosService.addMovimiento(self.movimiento).then(
                function(res) {
                  var msg = res.data;
                  if(msg.error == '') {
                    self.msg.tipo = 'warning';
                    self.msg.texto = 'Movimiento registrado';
                  } else {
                    self.msg.tipo = 'danger';
                    self.msg.texto = msg.error;
                  }
                  mostrarMensaje();
                },
                function error(res) {
                  self.msg.tipo = 'danger';
                  self.msg.texto = 'Se ha producido un error en el servicio';
                  mostrarMensaje();
                }
              );
            }
          } else {
            alert('El importe del movimiento debe ser numérico');
          }
        };

        self.checkEsc = function(event) {
          if(event.which == 27) {
            self.mostrarBusquedaCategoria = false;
            self.mostrarBusquedaConcepto = false;
          };
        };

        self.filtroBusquedaCategoria = function(categoria) {
          if(self.movimiento.categoria != undefined && self.movimiento.categoria != '') {
            var re = new RegExp(self.movimiento.categoria.toUpperCase());
            return re.test(categoria.toUpperCase());
          } else {
            return '';
          }
        };

        self.filtroBusquedaConcepto = function(concepto) {
          if(self.movimiento.concepto != undefined && self.movimiento.concepto != '') {
            var re = new RegExp(self.movimiento.concepto.toUpperCase());
            return re.test(concepto.toUpperCase());
          } else {
            return '';
          }
        };

        self.selCategoria = function(categoria) {
          self.movimiento.categoria = categoria;
          self.mostrarBusquedaCategoria = false;
          $('#inputConcepto').focus();
        };

        self.selConcepto = function(concepto) {
          self.movimiento.concepto = concepto;
          self.mostrarBusquedaConcepto = false;
          $('#inputImporte').focus();
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              $state.reload();
            }, 3000);
          }
        };
      }],
      controllerAs: 'ctrlMovimiento'
    })
    /********************
     * home.movimientos *
     ********************/
    .state('home.movimientos', {
      abstract: true,
      url: '/movimientos',
      templateUrl: '../views/movimientos.tpl',
      resolve: {
        config: ['ConfigService', function(ConfigService) {
          return ConfigService.getConfig();
        }]
      },
      controller: ['$rootScope', 'config', function($rootScope, config) {
        var self = this;

        self.error = '';
        self.ingresos = '';
        self.showIngresos = true;
        self.gastos = '';
        self.showGastos = true;
        self.balance = '';
        self.showBalance = true;

        if(config.error != '') {
          self.error = config.error;
        } else {
          self.showIngresos = config.data.ingresos;
          self.showGastos = config.data.gastos;
          self.showBalance = self.showIngresos && self.showGastos;

          if($rootScope.fechaDesde == undefined || $rootScope.fechaHasta == undefined) {
            $rootScope.fechaDesde = moment().date(new Number(1)).format('DD/MM/YYYY');
            $rootScope.fechaHasta = moment().date(new Number(moment().daysInMonth())).format('DD/MM/YYYY');
          }

          if($rootScope.mesDesde == undefined || $rootScope.mesHasta == undefined) {
            $rootScope.mesDesde = '' + (new Date().getMonth() + 1);
            $rootScope.mesHasta = '' + (new Date().getMonth() + 1);
            
            if($rootScope.mesDesde.length < 2) {
              $rootScope.mesDesde = '0' + $rootScope.mesDesde;              
            }

            if($rootScope.mesHasta.length < 2) {
              $rootScope.mesHasta = '0' + $rootScope.mesHasta;
            }
          }

          if($rootScope.agnoDesde == undefined || $rootScope.agnoHasta == undefined) {
            $rootScope.agnoDesde = '' + (new Date().getFullYear());
            $rootScope.agnoHasta = '' + (new Date().getFullYear());
          }
        }

        $rootScope.$watch("balance", function(newValue) {
          if(newValue != undefined) {
            self.ingresos = newValue.ingresos;
            self.gastos = newValue.gastos;
            self.balance = newValue.balance;
          }
        });
      }],
      controllerAs: 'ctrlMovimientos'
    })
    /**********************************
     * home.movimientos.detalleDiario *
     **********************************/
    .state('home.movimientos.detalleDiario', {
      url: '/detalleDiario',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.diario.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;
            self.fechaDesde = $rootScope.fechaDesde;
            self.fechaHasta = $rootScope.fechaHasta;

            $('#inputFechaDesde').datepicker('update', $rootScope.fechaDesde);
            $('#inputFechaHasta').datepicker('update', $rootScope.fechaHasta);

            self.aceptar = function() {
              $rootScope.fechaDesde = self.fechaDesde;
              $rootScope.fechaHasta = self.fechaHasta;
              MsgService.setMensaje('actualizarFechas', {fechaDesde: $rootScope.fechaDesde.replace(/\//gi, '-'), fechaHasta: $rootScope.fechaHasta.replace(/\//gi, '-')});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/detalle.diario.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.fechaDesde != undefined && $rootScope.fechaHasta != undefined) {
                return MovimientosService.getMovimientos($rootScope.fechaDesde.replace(/\//gi, '-'), $rootScope.fechaHasta.replace(/\//gi, '-'));
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', '$window', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, $window, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Detalle Diario';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByFechaConcepto(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.editar = function(mov) {
              var modal = bootbox.dialog({
                message: $('#divEdicionMovimiento').html(),
                title: 'Modificar movimiento',
                buttons: [
                  { label: 'Cancelar',
                    className: 'btn btn-secondary pull-right width100 cursorPointer',
                    callback: function() {
                      return true;
                    }
                  },
                  { label: 'Modificar',
                    className: 'btn btn-primary marginRight10 pull-right width100 cursorPointer',
                    callback: function() {
                      var fecha = modal.find('#inputFecha');
                      var categoria = modal.find('#inputCategoria');
                      var concepto = modal.find('#inputConcepto');
                      var importe = modal.find('#inputImporte');

                      if(fecha.val() == '') {
                        alert('Debes indicar la fecha del movimiento');
                        fecha.focus();
                        return false;
                      }

                      if(categoria.val() == '') {
                        alert('Debes indicar la categoría del movimiento');
                        categoria.focus();
                        return false;
                      }

                      if(concepto.val() == '') {
                        alert('Debes indicar la concepto del movimiento');
                        concepto.focus();
                        return false;
                      }

                      if(importe.val() == '') {
                        alert('Debes indicar el importe del movimiento');
                        importe.focus();
                        return false;
                      }

                      if(!isNumber(importe.val())) {
                        alert('El importe no es un número válido');
                        importe.focus();
                        return false;
                      }

                      var valImporte = parseFloat(importe.val());
                      if(valImporte == 0) {
                        alert('El importe no puede ser 0');
                        importe.focus();
                        return false;
                      }

                      mov.fecha = dateStringToDate(fecha.val());
                      mov.categoria = categoria.val();
                      mov.concepto = concepto.val();
                      mov.importe = parseFloat(importe.val());
                      
                      MovimientosService.modMovimiento(mov).then(
                        function(res) {
                          var msg = res.data;
                          if(msg.error == '') {
                            // Tras modificar el movimiento en base de datos, evitamos refrescar el estado $state.reload()
                            // para no perder el posible filtro fijado por el usuario.
                            // Para ello debemos:
                            //   1) Restaurar el formato de la fecha del movimiento (DDD dd/MM/yyyy) después de grabar.
                            //   2) Volver a ordenar los movimientos (por si se le ha modificado la fecha).
                            //   3) Recalcular los datos del balance (por si se le ha modificado el importe).
                            //
                            // $state.reload();
                            mov.fecha = dateToDateStringWithWeekDay(mov.fecha);
                            self.movimientos = sortMovimientosByFechaConcepto(self.movimientos);
                            $rootScope.balance = obtenerBalance(self.movimientos);
                            return true;
                          } else {
                            self.error = msg.error;
                            return true;
                          }
                        },
                        function error(res) {
                          self.error = 'Se ha producido un error en el servicio';
                          return true;
                        }
                      );
                    }
                  }
                ],
                closeButton: false,
                onEscape: function() {
                  modal.modal('hide');
                }
              });

              modal.find('#inputFecha').val(mov.fecha.split(' ')[1]);
              modal.find('#inputCategoria').val(mov.categoria);
              modal.find('#inputConcepto').val(mov.concepto);
              modal.find('#inputImporte').val(mov.importe);
            };

            self.eliminar = function(id) {
              bootbox.confirm({
                message: '¿Seguro que quieres eliminar el movimiento?',
                title: 'Eliminar movimiento',
                buttons: {
                  confirm: {
                    label: 'Eliminar',
                    className: 'btn btn-danger pull-right width100 cursorPointer'
                  },
                  cancel: {
                    label: 'Cancelar',
                    className: 'btn btn-secondary pull-right width100 cursorPointer'
                  }
                },
                callback: function(res) {
                  if(res) {
                    MovimientosService.delMovimiento(id).then(
                      function(res) {
                        var msg = res.data;
                        if(msg.error == '') {
                          // Tras eliminar el movimiento de base de datos, evitamos refrescar el estado $state.reload()
                          // para no perder el posible filtro fijado por el usuario.
                          // Para ello debemos eliminar el movimiento también del modelo.
                          //   
                          // $state.reload();
                          for(var i = 0; i < self.movimientos.length; i++) {
                            var mov = self.movimientos[i];
                            if(mov.id == id) {
                              self.movimientos.splice(i, 1);
                              break;
                            }
                          }
                        } else {
                          self.error = msg.error;
                        }
                      },
                      function error(res) {
                        self.error = 'Se ha producido un error en el servicio';
                      }
                    );
                  }
                },
                closeButton: false,
                onEscape: function() {
                  modal.modal('hide');
                }
              });
            };

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            self.mostrarCategoria = function(id, event) {
              var x = event.clientX;
              var y = event.clientY;
              var viewportWidth = angular.element($window).width();
              var verticalScroll = angular.element($window).scrollTop();

              $('#divCategoria' + id).css('left', x + 20);

              if (viewportWidth <= 576) {
                $('#divCategoria' + id).css('top', y + verticalScroll - $('#divFiltroDiario').height() - $('#divResumen').height() - 125);
              } else {
                $('#divCategoria' + id).css('top', y + verticalScroll - 75);
              }

              $('#divCategoria' + id).show();
            };

            self.ocultarCategoria = function(id) {
              $('#divCategoria' + id).hide();
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByFechaConcepto(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlDetalleDiario'
        }
      }
    })
    /***********************************
     * home.movimientos.detalleMensual *
     ***********************************/
    .state('home.movimientos.detalleMensual', {
      url: '/detalleMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesde) - 1];
            self.agnoDesde = $rootScope.agnoDesde;
            self.mesHasta = self.meses[new Number($rootScope.mesHasta) - 1];
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.mesDesde = self.mesDesde.valor;
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.mesHasta = self.mesHasta.valor;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
              var fechaHasta = numDiasMes(new Number($rootScope.mesHasta), new Number($rootScope.agnoHasta)) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/detalle.mensual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.mesDesde != undefined && $rootScope.agnoDesde != undefined && $rootScope.mesHasta != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
                var fechaHasta = numDiasMes($rootScope.mesHasta, $rootScope.agnoHasta) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', '$window', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, $window, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Detalle Mensual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByMesConcepto(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            self.mostrarCategoria = function(id, event) {
              var x = event.clientX;
              var y = event.clientY;
              var viewportWidth = angular.element($window).width();
              var verticalScroll = angular.element($window).scrollTop();

              $('#divCategoria' + id).css('left', x + 20);

              if (viewportWidth <= 576) {
                $('#divCategoria' + id).css('top', y + verticalScroll - $('#divFiltroMensual').height() - $('#divResumen').height() - 125);
              } else {
                $('#divCategoria' + id).css('top', y + verticalScroll - 75);
              }

              $('#divCategoria' + id).show();
            };

            self.ocultarCategoria = function(id) {
              $('#divCategoria' + id).hide();
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByMesConcepto(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlDetalleMensual'
        }
      }
    })
    /*********************************
     * home.movimientos.detalleAnual *
     *********************************/
    .state('home.movimientos.detalleAnual', {
      url: '/detalleAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.agnoDesde = $rootScope.agnoDesde;
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-01-' + $rootScope.agnoDesde;
              var fechaHasta = '31-12-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/detalle.anual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.agnoDesde != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-01-' + $rootScope.agnoDesde;
                var fechaHasta = '31-12-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosAgnoActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', '$window', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, $window, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Detalle Anual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByAgnoConcepto(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            self.mostrarCategoria = function(id, event) {
              var x = event.clientX;
              var y = event.clientY;
              var viewportWidth = angular.element($window).width();
              var verticalScroll = angular.element($window).scrollTop();

              $('#divCategoria' + id).css('left', x + 20);

              if (viewportWidth <= 576) {
                $('#divCategoria' + id).css('top', y + verticalScroll - $('#divFiltroAnual').height() - $('#divResumen').height() - 125);
              } else {
                $('#divCategoria' + id).css('top', y + verticalScroll - 75);
              }

              $('#divCategoria' + id).show();
            };

            self.ocultarCategoria = function(id) {
              $('#divCategoria' + id).hide();
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByAgnoConcepto(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlDetalleAnual'
        }
      }
    })
    /*********************************
     * home.movimientos.detalleTotal *
     *********************************/
    .state('home.movimientos.detalleTotal', {
      url: '/detalleTotal',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.diario.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;
            self.fechaDesde = $rootScope.fechaDesde;
            self.fechaHasta = $rootScope.fechaHasta;

            $('#inputFechaDesde').datepicker('update', $rootScope.fechaDesde);
            $('#inputFechaHasta').datepicker('update', $rootScope.fechaHasta);

            self.aceptar = function() {
              $rootScope.fechaDesde = self.fechaDesde;
              $rootScope.fechaHasta = self.fechaHasta;
              MsgService.setMensaje('actualizarFechas', {fechaDesde: $rootScope.fechaDesde.replace(/\//gi, '-'), fechaHasta: $rootScope.fechaHasta.replace(/\//gi, '-')});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/detalle.total.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.fechaDesde != undefined && $rootScope.fechaHasta != undefined) {
                return MovimientosService.getMovimientos($rootScope.fechaDesde.replace(/\//gi, '-'), $rootScope.fechaHasta.replace(/\//gi, '-'));
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', '$window', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, $window, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Detalle Total';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByConcepto(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            self.mostrarCategoria = function(id, event) {
              var x = event.clientX;
              var y = event.clientY;
              var viewportWidth = angular.element($window).width();
              var verticalScroll = angular.element($window).scrollTop();

              $('#divCategoria' + id).css('left', x + 20);

              if (viewportWidth <= 576) {
                $('#divCategoria' + id).css('top', y + verticalScroll - $('#divFiltroDiario').height() - $('#divResumen').height() - 125);
              } else {
                $('#divCategoria' + id).css('top', y + verticalScroll - 75);
              }

              $('#divCategoria' + id).show();
            };

            self.ocultarCategoria = function(id) {
              $('#divCategoria' + id).hide();
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByConcepto(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlDetalleTotal'
        }
      }
    })
    /************************************
     * home.movimientos.categoriaDiario *
     ************************************/
    .state('home.movimientos.categoriaDiario', {
      url: '/categoriaDiario',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.diario.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;
            self.fechaDesde = $rootScope.fechaDesde;
            self.fechaHasta = $rootScope.fechaHasta;

            $('#inputFechaDesde').datepicker('update', $rootScope.fechaDesde);
            $('#inputFechaHasta').datepicker('update', $rootScope.fechaHasta);

            self.aceptar = function() {
              $rootScope.fechaDesde = self.fechaDesde;
              $rootScope.fechaHasta = self.fechaHasta;
              MsgService.setMensaje('actualizarFechas', {fechaDesde: $rootScope.fechaDesde.replace(/\//gi, '-'), fechaHasta: $rootScope.fechaHasta.replace(/\//gi, '-')});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/categoria.diario.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.fechaDesde != undefined && $rootScope.fechaHasta != undefined) {
                return MovimientosService.getMovimientos($rootScope.fechaDesde.replace(/\//gi, '-'), $rootScope.fechaHasta.replace(/\//gi, '-'));
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Categoría Diario';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByFechaCategoria(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByFechaCategoria(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlCategoriaDiario'
        }
      }
    })
    /*************************************
     * home.movimientos.categoriaMensual *
     *************************************/
    .state('home.movimientos.categoriaMensual', {
      url: '/categoriaMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesde) - 1];
            self.agnoDesde = $rootScope.agnoDesde;
            self.mesHasta = self.meses[new Number($rootScope.mesHasta) - 1];
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.mesDesde = self.mesDesde.valor;
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.mesHasta = self.mesHasta.valor;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
              var fechaHasta = numDiasMes(new Number($rootScope.mesHasta), new Number($rootScope.agnoHasta)) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/categoria.mensual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.mesDesde != undefined && $rootScope.agnoDesde != undefined && $rootScope.mesHasta != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
                var fechaHasta = numDiasMes($rootScope.mesHasta, $rootScope.agnoHasta) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Categoría Mensual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByMesCategoria(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByMesCategoria(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlCategoriaMensual'
        }
      }
    })
    /***********************************
     * home.movimientos.categoriaAnual *
     ***********************************/
    .state('home.movimientos.categoriaAnual', {
      url: '/categoriaAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.agnoDesde = $rootScope.agnoDesde;
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-01-' + $rootScope.agnoDesde;
              var fechaHasta = '31-12-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/categoria.anual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.agnoDesde != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-01-' + $rootScope.agnoDesde;
                var fechaHasta = '31-12-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosAgnoActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Categoría Anual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByAgnoCategoria(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByAgnoCategoria(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlCategoriaAnual'
        }
      }
    })
    /***********************************
     * home.movimientos.categoriaTotal *
     ***********************************/
    .state('home.movimientos.categoriaTotal', {
      url: '/categoriaTotal',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.diario.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;
            self.fechaDesde = $rootScope.fechaDesde;
            self.fechaHasta = $rootScope.fechaHasta;

            $('#inputFechaDesde').datepicker('update', $rootScope.fechaDesde);
            $('#inputFechaHasta').datepicker('update', $rootScope.fechaHasta);

            self.aceptar = function() {
              $rootScope.fechaDesde = self.fechaDesde;
              $rootScope.fechaHasta = self.fechaHasta;
              MsgService.setMensaje('actualizarFechas', {fechaDesde: $rootScope.fechaDesde.replace(/\//gi, '-'), fechaHasta: $rootScope.fechaHasta.replace(/\//gi, '-')});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/categoria.total.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.fechaDesde != undefined && $rootScope.fechaHasta != undefined) {
                return MovimientosService.getMovimientos($rootScope.fechaDesde.replace(/\//gi, '-'), $rootScope.fechaHasta.replace(/\//gi, '-'));
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', '$state', 'movimientos', 'MovimientosService', function($rootScope, $scope, $state, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Categoría Total';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByCategoria(movimientos.data);
              self.movimientosFiltro = [];
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            self.ESC = function(event) {
              if(event.which == 27) {
                $state.reload();
              }
            };

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByCategoria(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlCategoriaTotal'
        }
      }
    })
    /********************************
     * home.movimientos.totalDiario *
     ********************************/
    .state('home.movimientos.totalDiario', {
      url: '/totalDiario',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.diario.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;
            self.fechaDesde = $rootScope.fechaDesde;
            self.fechaHasta = $rootScope.fechaHasta;

            $('#inputFechaDesde').datepicker('update', $rootScope.fechaDesde);
            $('#inputFechaHasta').datepicker('update', $rootScope.fechaHasta);

            self.aceptar = function() {
              $rootScope.fechaDesde = self.fechaDesde;
              $rootScope.fechaHasta = self.fechaHasta;
              MsgService.setMensaje('actualizarFechas', {fechaDesde: $rootScope.fechaDesde.replace(/\//gi, '-'), fechaHasta: $rootScope.fechaHasta.replace(/\//gi, '-')});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/total.diario.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.fechaDesde != undefined && $rootScope.fechaHasta != undefined) {
                return MovimientosService.getMovimientos($rootScope.fechaDesde.replace(/\//gi, '-'), $rootScope.fechaHasta.replace(/\//gi, '-'));
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', 'movimientos', 'MovimientosService', function($rootScope, $scope, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Total Diario';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByFecha(movimientos.data);
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByFecha(msg.data);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlTotalDiario'
        }
      }
    })
    /*********************************
     * home.movimientos.totalMensual *
     *********************************/
    .state('home.movimientos.totalMensual', {
      url: '/totalMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesde) - 1];
            self.agnoDesde = $rootScope.agnoDesde;
            self.mesHasta = self.meses[new Number($rootScope.mesHasta) - 1];
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.mesDesde = self.mesDesde.valor;
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.mesHasta = self.mesHasta.valor;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
              var fechaHasta = numDiasMes(new Number($rootScope.mesHasta), new Number($rootScope.agnoHasta)) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/total.mensual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.mesDesde != undefined && $rootScope.agnoDesde != undefined && $rootScope.mesHasta != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-' + $rootScope.mesDesde + '-' + $rootScope.agnoDesde;
                var fechaHasta = numDiasMes($rootScope.mesHasta, $rootScope.agnoHasta) + '-' + $rootScope.mesHasta + '-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosMesActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', 'movimientos', 'MovimientosService', function($rootScope, $scope, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Total Mensual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByMes(movimientos.data, false);
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByMes(msg.data, false);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlTotalMensual'
        }
      }
    })
    /*******************************
     * home.movimientos.totalAnual *
     *******************************/
    .state('home.movimientos.totalAnual', {
      url: '/totalAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.agnoDesde = $rootScope.agnoDesde;
            self.agnoHasta = $rootScope.agnoHasta;

            self.aceptar = function() {
              $rootScope.agnoDesde = self.agnoDesde;
              $rootScope.agnoHasta = self.agnoHasta;

              var fechaDesde = '01-01-' + $rootScope.agnoDesde;
              var fechaHasta = '31-12-' + $rootScope.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'movimientos': {
          templateUrl: '../views/total.anual.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              if($rootScope.agnoDesde != undefined && $rootScope.agnoHasta != undefined) {
                var fechaDesde = '01-01-' + $rootScope.agnoDesde;
                var fechaHasta = '31-12-' + $rootScope.agnoHasta;
                return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
              } else {
                return MovimientosService.getMovimientosAgnoActual();
              }
            }]
          },
          controller: ['$rootScope', '$scope', 'movimientos', 'MovimientosService', function($rootScope, $scope, movimientos, MovimientosService) {
            var self = this;

            self.nombreVista = 'Total Anual';
            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByAgno(movimientos.data, false);
              $rootScope.balance = obtenerBalance(self.movimientos);
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByAgno(msg.data, false);
                    $rootScope.balance = obtenerBalance(self.movimientos);
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });
          }],
          controllerAs: 'ctrlTotalAnual'
        }
      }
    })
    /****************
     * home.grafica *
     ****************/
    .state('home.grafica', {
      abstract: true,
      url: '/grafica',
      templateUrl: '../views/grafica.tpl',
      resolve: {
        config: ['ConfigService', function(ConfigService) {
          return ConfigService.getConfig();
        }]
      },
      controller: ['$rootScope', 'agnosAtrasGraficaAnual', 'config', function($rootScope, agnosAtrasGraficaAnual, config) {
        var self = this;

        self.error = '';

        if(config.error != '') {
          self.error = config.error;
        } else {
          if($rootScope.mesDesdeGraficaMensual == undefined || $rootScope.mesHastaGraficaMensual == undefined) {
            $rootScope.mesDesdeGraficaMensual = '01';
            $rootScope.mesHastaGraficaMensual = '' + (new Date().getMonth() + 1);
            
            if($rootScope.mesHastaGraficaMensual.length < 2) {
              $rootScope.mesHastaGraficaMensual = '0' + $rootScope.mesHastaGraficaMensual;
            }
          }

          if($rootScope.agnoDesdeGraficaMensual == undefined || $rootScope.agnoHastaGraficaMensual == undefined) {
            $rootScope.agnoDesdeGraficaMensual = '' + (new Date().getFullYear());
            $rootScope.agnoHastaGraficaMensual = '' + (new Date().getFullYear());
          }

          if($rootScope.agnoDesdeGraficaAnual == undefined || $rootScope.agnoHastaGraficaAnual == undefined) {
            $rootScope.agnoDesdeGraficaAnual = '' + (new Date().getFullYear() - agnosAtrasGraficaAnual);
            $rootScope.agnoHastaGraficaAnual = '' + (new Date().getFullYear());
          }

          if($rootScope.mesDesdePatrimonio == undefined || $rootScope.mesHastaPatrimonio == undefined) {
            $rootScope.mesDesdePatrimonio = '' + (new Date(config.data.liquidez.fecha).getMonth() + 1);
            $rootScope.mesHastaPatrimonio = '' + (new Date().getMonth() + 1);

            if($rootScope.mesDesdePatrimonio.length < 2) {
              $rootScope.mesDesdePatrimonio = '0' + $rootScope.mesDesdePatrimonio;
            }

            if($rootScope.mesHastaPatrimonio.length < 2) {
              $rootScope.mesHastaPatrimonio = '0' + $rootScope.mesHastaPatrimonio;
            }
          }

          if($rootScope.agnoDesdePatrimonio == undefined || $rootScope.agnoHastaPatrimonio == undefined) {
            $rootScope.agnoDesdePatrimonio = '' + (new Date(config.data.liquidez.fecha).getFullYear());
            $rootScope.agnoHastaPatrimonio = '' + (new Date().getFullYear());
          }
        }
      }],
      controllerAs: 'ctrlGrafica'
    })
    /*****************************
     * home.grafica.curvaMensual *
     *****************************/
    .state('home.grafica.curvaMensual', {
      url: '/curvaMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Curva Mensual';
            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesdeGraficaMensual) - 1];
            self.agnoDesde = $rootScope.agnoDesdeGraficaMensual;
            self.mesHasta = self.meses[new Number($rootScope.mesHastaGraficaMensual) - 1];
            self.agnoHasta = $rootScope.agnoHastaGraficaMensual;

            self.aceptar = function() {
              $rootScope.mesDesdeGraficaMensual = self.mesDesde.valor;
              $rootScope.agnoDesdeGraficaMensual = self.agnoDesde;
              $rootScope.mesHastaGraficaMensual = self.mesHasta.valor;
              $rootScope.agnoHastaGraficaMensual = self.agnoHasta;

              var fechaDesde = '01-' + $rootScope.mesDesdeGraficaMensual + '-' + $rootScope.agnoDesdeGraficaMensual;
              var fechaHasta = numDiasMes(new Number($rootScope.mesHastaGraficaMensual), new Number($rootScope.agnoHastaGraficaMensual)) + '-' + $rootScope.mesHastaGraficaMensual + '-' + $rootScope.agnoHastaGraficaMensual;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.curva.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              var fechaDesde = undefined;
              var fechaHasta = undefined;

              if($rootScope.mesDesdeGraficaMensual != undefined && $rootScope.agnoDesdeGraficaMensual != undefined && $rootScope.mesHastaGraficaMensual != undefined && $rootScope.agnoHastaGraficaMensual != undefined) {
                fechaDesde = '01-' + $rootScope.mesDesdeGraficaMensual + '-' + $rootScope.agnoDesdeGraficaMensual;
                fechaHasta = numDiasMes($rootScope.mesHastaGraficaMensual, $rootScope.agnoHastaGraficaMensual) + '-' + $rootScope.mesHastaGraficaMensual + '-' + $rootScope.agnoHastaGraficaMensual;
              } else {
                fechaDesde = '01-01-' + new Date().getFullYear();
                fechaHasta = dateToDateString(new Date(), '-');
              }

              return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
            }]
          },
          controller: ['$scope', 'movimientos', 'MovimientosService', 'optionsGraficas', function($scope, movimientos, MovimientosService, optionsGraficas) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByMes(movimientos.data, true);
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByMes(msg.data, true);
                    initGrafico();
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getMeses(self.movimientos);
              $scope.series = ['Importe'];
              $scope.data = [getImportes(self.movimientos)];
              $scope.options = optionsGraficas;

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaCurva'
        }
      }
    })
    /***************************
     * home.grafica.curvaAnual *
     ***************************/
    .state('home.grafica.curvaAnual', {
      url: '/curvaAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Curva Anual';
            self.agnoDesde = $rootScope.agnoDesdeGraficaAnual;
            self.agnoHasta = $rootScope.agnoHastaGraficaAnual;

            self.aceptar = function() {
              $rootScope.agnoDesdeGraficaAnual = self.agnoDesde;
              $rootScope.agnoHastaGraficaAnual = self.agnoHasta;

              var fechaDesde = '01-01-' + $rootScope.agnoDesdeGraficaAnual;
              var fechaHasta = '31-12-' + $rootScope.agnoHastaGraficaAnual;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.curva.tpl',
          resolve: {
            movimientos: ['$rootScope', 'agnosAtrasGraficaAnual', 'MovimientosService', function($rootScope, agnosAtrasGraficaAnual, MovimientosService) {
              var fechaDesde = undefined;
              var fechaHasta = undefined;

              if($rootScope.agnoDesdeGraficaAnual != undefined && $rootScope.agnoHastaGraficaAnual != undefined) {
                fechaDesde = '01-01-' + $rootScope.agnoDesdeGraficaAnual;
                fechaHasta = '31-12-' + $rootScope.agnoHastaGraficaAnual;                
              } else {
                fechaDesde = '01-01-' + (new Date().getFullYear() - agnosAtrasGraficaAnual);
                fechaHasta = '31-12-' + new Date().getFullYear();
              }

              return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
            }]
          },
          controller: ['$scope', 'movimientos', 'MovimientosService', 'optionsGraficas', function($scope, movimientos, MovimientosService, optionsGraficas) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByAgno(movimientos.data, true);
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByAgno(msg.data, true);
                    initGrafico();
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getAgnos(self.movimientos);
              $scope.series = ['Importe'];
              $scope.data = [getImportes(self.movimientos)];
              $scope.options = optionsGraficas;

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaCurva'
        }
      }
    })
    /******************************
     * home.grafica.barrasMensual *
     ******************************/
    .state('home.grafica.barrasMensual', {
      url: '/barrasMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Barras Mensual';
            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesdeGraficaMensual) - 1];
            self.agnoDesde = $rootScope.agnoDesdeGraficaMensual;
            self.mesHasta = self.meses[new Number($rootScope.mesHastaGraficaMensual) - 1];
            self.agnoHasta = $rootScope.agnoHastaGraficaMensual;

            self.aceptar = function() {
              $rootScope.mesDesdeGraficaMensual = self.mesDesde.valor;
              $rootScope.agnoDesdeGraficaMensual = self.agnoDesde;
              $rootScope.mesHastaGraficaMensual = self.mesHasta.valor;
              $rootScope.agnoHastaGraficaMensual = self.agnoHasta;

              var fechaDesde = '01-' + $rootScope.mesDesdeGraficaMensual + '-' + $rootScope.agnoDesdeGraficaMensual;
              var fechaHasta = numDiasMes(new Number($rootScope.mesHastaGraficaMensual), new Number($rootScope.agnoHastaGraficaMensual)) + '-' + $rootScope.mesHastaGraficaMensual + '-' + $rootScope.agnoHastaGraficaMensual;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.barras.tpl',
          resolve: {
            movimientos: ['$rootScope', 'MovimientosService', function($rootScope, MovimientosService) {
              var fechaDesde = undefined;
              var fechaHasta = undefined;

              if($rootScope.mesDesdeGraficaMensual != undefined && $rootScope.agnoDesdeGraficaMensual != undefined && $rootScope.mesHastaGraficaMensual != undefined && $rootScope.agnoHastaGraficaMensual != undefined) {
                fechaDesde = '01-' + $rootScope.mesDesdeGraficaMensual + '-' + $rootScope.agnoDesdeGraficaMensual;
                fechaHasta = numDiasMes($rootScope.mesHastaGraficaMensual, $rootScope.agnoHastaGraficaMensual) + '-' + $rootScope.mesHastaGraficaMensual + '-' + $rootScope.agnoHastaGraficaMensual;
              } else {
                fechaDesde = '01-01-' + new Date().getFullYear();
                fechaHasta = dateToDateString(new Date(), '-');
              }

              return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
            }]
          },
          controller: ['$scope', 'movimientos', 'MovimientosService', 'optionsGraficas', function($scope, movimientos, MovimientosService, optionsGraficas) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByMes(movimientos.data, true);
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByMes(msg.data, true);
                    initGrafico();
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getMeses(self.movimientos);
              $scope.series = ['Importe'];
              $scope.data = [getImportes(self.movimientos)];
              $scope.options = optionsGraficas;

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaBarras'
        }
      }
    })
    /****************************
     * home.grafica.barrasAnual *
     ****************************/
    .state('home.grafica.barrasAnual', {
      url: '/barrasAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Barras Anual';
            self.agnoDesde = $rootScope.agnoDesdeGraficaAnual;
            self.agnoHasta = $rootScope.agnoHastaGraficaAnual;

            self.aceptar = function() {
              $rootScope.agnoDesdeGraficaAnual = self.agnoDesde;
              $rootScope.agnoHastaGraficaAnual = self.agnoHasta;

              var fechaDesde = '01-01-' + $rootScope.agnoDesdeGraficaAnual;
              var fechaHasta = '31-12-' + $rootScope.agnoHastaGraficaAnual;

              MsgService.setMensaje('actualizarFechas', {fechaDesde: fechaDesde, fechaHasta: fechaHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.barras.tpl',
          resolve: {
            movimientos: ['$rootScope', 'agnosAtrasGraficaAnual', 'MovimientosService', function($rootScope, agnosAtrasGraficaAnual, MovimientosService) {
              var fechaDesde = undefined;
              var fechaHasta = undefined;

              if($rootScope.agnoDesdeGraficaAnual != undefined && $rootScope.agnoHastaGraficaAnual != undefined) {
                fechaDesde = '01-01-' + $rootScope.agnoDesdeGraficaAnual;
                fechaHasta = '31-12-' + $rootScope.agnoHastaGraficaAnual;                
              } else {
                fechaDesde = '01-01-' + (new Date().getFullYear() - agnosAtrasGraficaAnual);
                fechaHasta = '31-12-' + new Date().getFullYear();
              }

              return MovimientosService.getMovimientos(fechaDesde, fechaHasta);
            }]
          },
          controller: ['$scope', 'movimientos', 'MovimientosService', 'optionsGraficas', function($scope, movimientos, MovimientosService, optionsGraficas) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(movimientos.error != '') {
              self.error = movimientos.error;
            } else {
              self.movimientos = sortMovimientosByAgno(movimientos.data, true);
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              MovimientosService.getMovimientos(data.fechaDesde, data.fechaHasta).then(
                function(msg) {
                  if(msg.error != '') {
                    self.error = msg.error;
                  } else {
                    self.movimientos = sortMovimientosByAgno(msg.data, true);
                    initGrafico();
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getAgnos(self.movimientos);
              $scope.series = ['Importe'];
              $scope.data = [getImportes(self.movimientos)];
              $scope.options = optionsGraficas;

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaBarras'
        }
      }
    })
    /***************************************
     * home.grafica.curvaPatrimonioMensual *
     ***************************************/
    .state('home.grafica.curvaPatrimonioMensual', {
      url: '/curvaPatrimonioMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Curva Patrimonio Mensual';
            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesdePatrimonio) - 1];
            self.agnoDesde = $rootScope.agnoDesdePatrimonio;
            self.mesHasta = self.meses[new Number($rootScope.mesHastaPatrimonio) - 1];
            self.agnoHasta = $rootScope.agnoHastaPatrimonio;

            self.aceptar = function() {
              $rootScope.mesDesdePatrimonio = self.mesDesde.valor;
              $rootScope.agnoDesdePatrimonio = self.agnoDesde;
              $rootScope.mesHastaPatrimonio = self.mesHasta.valor;
              $rootScope.agnoHastaPatrimonio = self.agnoHasta;

              var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
              var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;

              MsgService.setMensaje('actualizarFechas', {mesDesde: mesDesde, mesHasta: mesHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.curva.tpl',
          resolve: {
            liquidez: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.mesDesdePatrimonio != undefined && $rootScope.agnoDesdePatrimonio != undefined && $rootScope.mesHastaPatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
                var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;
                return PatrimonioService.getLiquidezMensual(mesDesde, mesHasta);
              } else {
                return PatrimonioService.getLiquidezMensual(undefined, undefined);
              }
            }],
            inversion: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.mesDesdePatrimonio != undefined && $rootScope.agnoDesdePatrimonio != undefined && $rootScope.mesHastaPatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
                var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;
                return PatrimonioService.getInversionesMensual(mesDesde, mesHasta);
              } else {
                return PatrimonioService.getInversionesMensual(undefined, undefined);
              }
            }]
          },
          controller: ['$scope', 'optionsGraficas', 'liquidez', 'inversion', 'PatrimonioService', function($scope, optionsGraficas, liquidez, inversion, PatrimonioService) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(liquidez.error != '') {
              self.error = liquidez.error;
            } else if (inversion.error != '') {
              self.error = inversion.error;
            } else {
              self.liquidez = liquidez.data;
              self.inversion = inversion.data;
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              PatrimonioService.getLiquidezMensual(data.mesDesde, data.mesHasta).then(
                function(msgLiq) {
                  if(msgLiq.error != '') {
                    self.error = msgLiq.error;
                  } else {
                    PatrimonioService.getInversionesMensual(data.mesDesde, data.mesHasta).then(
                      function(msgInv) {
                        self.liquidez = msgLiq.data;
                        self.inversion = msgInv.data; 
                        initGrafico();
                      },
                      function error(res) {
                        self.error = 'Se ha producido un error en el servicio';
                      }
                    )
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getMeses(self.liquidez);
              $scope.series = ['Saldo', 'Inversiones'];
              $scope.data = [getSaldos(self.liquidez), getValoracion(getInterseccionPorCampo('mes', self.liquidez, self.inversion))];
              $scope.options = optionsGraficas;
              $scope.colors = ['#006699', '#ff6600'];
              $scope.type = 'StackedBar';
              
              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaCurva'
        }
      }
    })
    /*************************************
     * home.grafica.curvaPatrimonioAnual *
     *************************************/
    .state('home.grafica.curvaPatrimonioAnual', {
      url: '/curvaPatrimonioAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Curva Patrimonio Anual';
            self.agnoDesde = $rootScope.agnoDesdePatrimonio;
            self.agnoHasta = $rootScope.agnoHastaPatrimonio;

            self.aceptar = function() {
              $rootScope.agnoDesdePatrimonio = self.agnoDesde;
              $rootScope.agnoHastaPatrimonio = self.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {agnoDesde: $rootScope.agnoDesdePatrimonio, agnoHasta: $rootScope.agnoHastaPatrimonio});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.curva.tpl',
          resolve: {
            liquidez: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.agnoDesdePatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                return PatrimonioService.getLiquidezAnual($rootScope.agnoDesdePatrimonio, $rootScope.agnoHastaPatrimonio);
              } else {
                return PatrimonioService.getLiquidezAnual(undefined, undefined);
              }
            }],
            inversion: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.agnoDesdePatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                return PatrimonioService.getInversionesAnual($rootScope.agnoDesdePatrimonio, $rootScope.agnoHastaPatrimonio);
              } else {
                return PatrimonioService.getInversionesAnual(undefined, undefined);
              }
            }]
          },
          controller: ['$scope', 'optionsGraficas', 'liquidez', 'inversion', 'PatrimonioService', function($scope, optionsGraficas, liquidez, inversion, PatrimonioService) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(liquidez.error != '') {
              self.error = liquidez.error;
            } else if (inversion.error != '') {
              self.error = inversion.error;
            } else {
              self.liquidez = liquidez.data;
              self.inversion = inversion.data;
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              PatrimonioService.getLiquidezAnual(data.agnoDesde, data.agnoHasta).then(
                function(msgLiq) {
                  if(msgLiq.error != '') {
                    self.error = msgLiq.error;
                  } else {
                    PatrimonioService.getInversionesAnual(data.agnoDesde, data.agnoHasta).then(
                      function(msgInv) {
                        self.liquidez = msgLiq.data;
                        self.inversion = msgInv.data; 
                        initGrafico();
                      },
                      function error(res) {
                        self.error = 'Se ha producido un error en el servicio';
                      }
                    )
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getAgnos(self.liquidez);
              $scope.series = ['Saldo', 'Inversiones'];
              $scope.data = [getSaldos(self.liquidez), getValoracion(getInterseccionPorCampo('agno', self.liquidez, self.inversion))];
              $scope.options = optionsGraficas;
              $scope.colors = ['#006699', '#ff6600'];
              $scope.type = 'StackedBar';

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaCurva'
        }
      }
    })
    /****************************************
     * home.grafica.barrasPatrimonioMensual *
     ****************************************/
    .state('home.grafica.barrasPatrimonioMensual', {
      url: '/barrasPatrimonioMensual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.mensual.tpl',
          controller: ['$rootScope', 'meses', 'MsgService', function($rootScope, meses, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Barras Patrimonio Mensual';
            self.meses = meses;
            self.mesDesde = self.meses[new Number($rootScope.mesDesdePatrimonio) - 1];
            self.agnoDesde = $rootScope.agnoDesdePatrimonio;
            self.mesHasta = self.meses[new Number($rootScope.mesHastaPatrimonio) - 1];
            self.agnoHasta = $rootScope.agnoHastaPatrimonio;

            self.aceptar = function() {
              $rootScope.mesDesdePatrimonio = self.mesDesde.valor;
              $rootScope.agnoDesdePatrimonio = self.agnoDesde;
              $rootScope.mesHastaPatrimonio = self.mesHasta.valor;
              $rootScope.agnoHastaPatrimonio = self.agnoHasta;

              var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
              var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;

              MsgService.setMensaje('actualizarFechas', {mesDesde: mesDesde, mesHasta: mesHasta});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.barras.tpl',
          resolve: {
            liquidez: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.mesDesdePatrimonio != undefined && $rootScope.agnoDesdePatrimonio != undefined && $rootScope.mesHastaPatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
                var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;
                return PatrimonioService.getLiquidezMensual(mesDesde, mesHasta);
              } else {
                return PatrimonioService.getLiquidezMensual(undefined, undefined);
              }
            }],
            inversion: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.mesDesdePatrimonio != undefined && $rootScope.agnoDesdePatrimonio != undefined && $rootScope.mesHastaPatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                var mesDesde = $rootScope.mesDesdePatrimonio + '-' + $rootScope.agnoDesdePatrimonio;
                var mesHasta = $rootScope.mesHastaPatrimonio + '-' + $rootScope.agnoHastaPatrimonio;
                return PatrimonioService.getInversionesMensual(mesDesde, mesHasta);
              } else {
                return PatrimonioService.getInversionesMensual(undefined, undefined);
              }
            }]
          },
          controller: ['$scope', 'optionsGraficas', 'liquidez', 'inversion', 'PatrimonioService', function($scope, optionsGraficas, liquidez, inversion, PatrimonioService) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(liquidez.error != '') {
              self.error = liquidez.error;
            } else if (inversion.error != '') {
              self.error = inversion.error;
            } else {
              self.liquidez = liquidez.data;
              self.inversion = inversion.data;
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              PatrimonioService.getLiquidezMensual(data.mesDesde, data.mesHasta).then(
                function(msgLiq) {
                  if(msgLiq.error != '') {
                    self.error = msgLiq.error;
                  } else {
                    PatrimonioService.getInversionesMensual(data.mesDesde, data.mesHasta).then(
                      function(msgInv) {
                        self.liquidez = msgLiq.data;
                        self.inversion = msgInv.data; 
                        initGrafico();
                      },
                      function error(res) {
                        self.error = 'Se ha producido un error en el servicio';
                      }
                    )
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getMeses(self.liquidez);
              $scope.series = ['Saldo', 'Inversiones'];
              $scope.data = [getSaldos(self.liquidez), getValoracion(getInterseccionPorCampo('mes', self.liquidez, self.inversion))];
              $scope.options = optionsGraficas;
              $scope.colors = ['#006699', '#ff6600'];
              $scope.type = 'StackedBar';

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaBarras'
        }
      }
    })
    /**************************************
     * home.grafica.barrasPatrimonioAnual *
     **************************************/
    .state('home.grafica.barrasPatrimonioAnual', {
      url: '/barrasPatrimonioAnual',
      views: {
        'filtro': {
          templateUrl: '../views/filtro.grafica.anual.tpl',
          controller: ['$rootScope', 'MsgService', function($rootScope, MsgService) {
            var self = this;

            self.nombreVista = 'Gráfica Barras Patrimonio Anual';
            self.agnoDesde = $rootScope.agnoDesdePatrimonio;
            self.agnoHasta = $rootScope.agnoHastaPatrimonio;

            self.aceptar = function() {
              $rootScope.agnoDesdePatrimonio = self.agnoDesde;
              $rootScope.agnoHastaPatrimonio = self.agnoHasta;

              MsgService.setMensaje('actualizarFechas', {agnoDesde: $rootScope.agnoDesdePatrimonio, agnoHasta: $rootScope.agnoHastaPatrimonio});
            };
          }],
          controllerAs: 'ctrlFiltro'
        },
        'grafica': {
          templateUrl: '../views/grafica.barras.tpl',
          resolve: {
            liquidez: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.agnoDesdePatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                return PatrimonioService.getLiquidezAnual($rootScope.agnoDesdePatrimonio, $rootScope.agnoHastaPatrimonio);
              } else {
                return PatrimonioService.getLiquidezAnual(undefined, undefined);
              }
            }],
            inversion: ['$rootScope', 'PatrimonioService', function($rootScope, PatrimonioService) {
              if($rootScope.agnoDesdePatrimonio != undefined && $rootScope.agnoHastaPatrimonio != undefined) {
                return PatrimonioService.getInversionesAnual($rootScope.agnoDesdePatrimonio, $rootScope.agnoHastaPatrimonio);
              } else {
                return PatrimonioService.getInversionesAnual(undefined, undefined);
              }
            }]
          },
          controller: ['$scope', 'optionsGraficas', 'liquidez', 'inversion', 'PatrimonioService', function($scope, optionsGraficas, liquidez, inversion, PatrimonioService) {
            var self = this;

            self.error = '';
            self.toNumber = toNumber;

            if(liquidez.error != '') {
              self.error = liquidez.error;
            } else if (inversion.error != '') {
              self.error = inversion.error;
            } else {
              self.liquidez = liquidez.data;
              self.inversion = inversion.data;
              initGrafico();
            }

            $scope.$on('actualizarFechas', function(event, data) {
              self.error = '';

              PatrimonioService.getLiquidezAnual(data.agnoDesde, data.agnoHasta).then(
                function(msgLiq) {
                  if(msgLiq.error != '') {
                    self.error = msgLiq.error;
                  } else {
                    PatrimonioService.getInversionesAnual(data.agnoDesde, data.agnoHasta).then(
                      function(msgInv) {
                        self.liquidez = msgLiq.data;
                        self.inversion = msgInv.data; 
                        initGrafico();
                      },
                      function error(res) {
                        self.error = 'Se ha producido un error en el servicio';
                      }
                    )
                  }
                },
                function error(res) {
                  self.error = 'Se ha producido un error en el servicio';
                }
              );
            });

            function initGrafico() {
              $scope.labels = getAgnos(self.liquidez);
              $scope.series = ['Saldo', 'Inversiones'];
              $scope.data = [getSaldos(self.liquidez), getValoracion(getInterseccionPorCampo('agno', self.liquidez, self.inversion))];
              $scope.options = optionsGraficas;
              $scope.colors = ['#006699', '#ff6600'];
              $scope.type = 'StackedBar';

              // Si queremos modificar los colores por defecto
              // $scope.colors = ['#...', '#...', '#...', '#...', '#...', '#...', '#...'];
            };
          }],
          controllerAs: 'ctrlGraficaBarras'
        }
      }
    })
    /********************
     * home.inversiones *
     ********************/
    .state('home.inversiones', {
      abstract: true,
      url: '/inversiones',
      templateUrl: '../views/inversiones.tpl',
      controller: ['$scope', function($scope) {
        // En este caso utilizamos $scope (en lugar de this) para hacer la función accesible
        // desde los controladores hijos.
        $scope.cambiarTab = function(idTab) {
          $('#idTabsInversiones a').removeClass('active');
          $('#' + idTab).addClass('active');
        };
      }],
      controllerAs: 'ctrlInversiones'
    })
    /*****************************
     * home.inversiones.posicion *
     *****************************/
    .state('home.inversiones.posicion', {
      url: '/posicion',
      templateUrl: '../views/inversiones.posicion.tpl',
      resolve: {
        config: ['ConfigService', function(ConfigService) {
          return ConfigService.getConfig();
        }],
        posicion: ['PosicionService', function(PosicionService) {
          return PosicionService.getPosicion();
        }]
      },
      controller: ['$scope', 'config', 'posicion', function($scope, config, posicion) {
        $scope.cambiarTab('idTabPosicion');

        var self = this;

        self.error = '';
        if(config.error != '') {
          self.error = config.error;
        } else if(posicion.error != '') {
          self.error = posicion.error;
        } else {
          self.config = config.data;

          var fechaHastaInversiones = new Date(self.config.periodo_inversiones.fecha_hasta);
          if(fechaHastaInversiones.getFullYear() == 9999 && fechaHastaInversiones.getMonth() == 11 && fechaHastaInversiones.getDate() == 31) {
            self.config.periodo_inversiones.fecha_hasta = '-->';
          }

          self.posicion = {};
          self.posicion.activos = posicion.data.activos;
          self.posicion.global = posicion.data.global;
        }
      }],
      controllerAs: 'ctrlInversionesPosicion'
    })
    /********************************
     * home.inversiones.operaciones *
     ********************************/
    .state('home.inversiones.operaciones', {
      url: '/operaciones',
      templateUrl: '../views/inversiones.operaciones.tpl',
      resolve: {
        activos: ['ActivosService', function(ActivosService) {
          return ActivosService.getActivos();
        }],
        operaciones: ['OperacionesService', function(OperacionesService) {
          return OperacionesService.getOperaciones();
        }]
      },
      controller: ['$rootScope', '$scope', '$state', 'activos', 'operaciones', 'OperacionesService', function($rootScope, $scope, $state, activos, operaciones, OperacionesService) {
        $scope.cambiarTab('idTabOperaciones');

        var self = this;

        self.error = '';
        if(activos.error != '') {
          self.error = activos.error;
        } else if (operaciones.error != '') {
          self.error = operaciones.error;
        } else {
          self.activos = activos.data;
          self.activos.unshift({codigo: '', descripcion: ''});
          self.operaciones = operaciones.data;

          if(self.operaciones.length != 0) {
            if($rootScope.fechaOperacionesDesde == undefined || $rootScope.fechaOperacionesHasta == undefined) {
              var maxFecha = getMaxFecha(self.operaciones);

              if(maxFecha != '') {
                var mesMaxFecha = maxFecha.getMonth();
                var agnoMaxFecha = maxFecha.getFullYear();

                var fechaDesdeInicial = new Date(agnoMaxFecha, mesMaxFecha, 1);
                var fechaHastaInicial = new Date(agnoMaxFecha, mesMaxFecha, numDiasMes(mesMaxFecha + 1, agnoMaxFecha));

                self.fechaDesde = dateToDateString(fechaDesdeInicial, '/');
                self.fechaHasta = dateToDateString(fechaHastaInicial, '/');
                self.activo = '';

                $('#inputFechaDesde').datepicker('update', self.fechaDesde);
                $('#inputFechaHasta').datepicker('update', self.fechaHasta);

                $rootScope.fechaOperacionesDesde = self.fechaDesde;
                $rootScope.fechaOperacionesHasta = self.fechaHasta;
              }
            } else {
              self.fechaDesde = $rootScope.fechaOperacionesDesde;
              self.fechaHasta = $rootScope.fechaOperacionesHasta;
              self.activo = $rootScope.activo;
            }

            filtrarOperaciones();
          }
        }

        self.filtrar = function() {
          filtrarOperaciones();
        };

        self.eliminar = function(id) {
          bootbox.confirm({
            message: '¿Seguro que quieres eliminar la operación?',
            title: 'Eliminar operación',
            buttons: {
              confirm: {
                label: 'Eliminar',
                className: 'btn btn-danger pull-right width100 cursorPointer'
              },
              cancel: {
                label: 'Cancelar',
                className: 'btn btn-secondary pull-right width100 cursorPointer'
              }
            },
            callback: function(res) {
              if(res) {
                OperacionesService.delOperacion(id).then(
                  function(res) {
                    var msg = res.data;
                    if(msg.error == '') {
                      // Antes de refrescar el estado reseteamos el periodo de fechas del filtro
                      // para que se actualice de acuerdo a las operaciones que quedan.
                      $rootScope.fechaOperacionesDesde = undefined;
                      $rootScope.fechaOperacionesHasta = undefined;
                      $state.reload();
                    } else {
                      self.error = msg.error;
                    }
                  },
                  function error(res) {
                    self.error = 'Se ha producido un error en el servicio';
                  }
                );
              }
            },
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });
        };

        self.editar = function(operacion) {
          var modal = bootbox.dialog({
            message: $('#divEdicionOperacion').html(),
            title: 'Modificar operación',
            buttons: [
              { label: 'Cancelar',
                className: 'btn btn-secondary pull-right width100 cursorPointer',
                callback: function() {
                  return true;
                }
              },
              { label: 'Modificar',
                className: 'btn btn-primary marginRight10 pull-right width100 cursorPointer',
                callback: function() {
                  var fecha = modal.find('#inputFecha');
                  var activo = modal.find('#inputActivo');
                  var tipo = modal.find('#inputTipo');
                  var titulos = modal.find('#inputTitulos');
                  var importe = modal.find('#inputImporte');
                  var comision = modal.find('#inputComision');

                  if(fecha.val() == '') {
                    alert('Debes indicar la fecha de la operación');
                    fecha.focus();
                    return false;
                  }

                  if(activo.val() == '') {
                    alert('Debes indicar el activo de la operación');
                    activo.focus();
                    return false;
                  }

                  if(tipo.val() == '') {
                    alert('Debes indicar el tipo de la operación');
                    return false;
                  }

                  if(titulos.val() == '') {
                    alert('Debes indicar los títulos de la operación');
                    return false;
                  }

                  if(!isNumber(titulos.val())) {
                    alert('El número de títulos de la operación no es un número válido');
                    return false;
                  }

                  if(importe.val() == '') {
                    alert('Debes indicar el importe de la operación');
                    return false;
                  }

                  if(!isNumber(importe.val())) {
                    alert('El importe de la operación no es un número válido');
                    return false;
                  }

                  if(comision.val() != '' && !isNumber(comision.val())) {
                    alert('La comisión de la operación no es un número válido');
                    return false;
                  }

                  operacion.fecha = dateStringToDate(fecha.val());
                  operacion.activo = activo.val();
                  operacion.tipo = tipo.val();
                  operacion.titulos = parseFloat(titulos.val());
                  operacion.importe = parseFloat(importe.val());

                  if(comision.val() != '') {
                    operacion.comision = parseFloat(comision.val());
                  }

                  OperacionesService.modOperacion(operacion).then(
                    function(res) {
                      var msg = res.data;
                      if(msg.error == '') {
                        // Antes de refrescar el estado reseteamos el periodo de fechas del filtro
                        // para que se actualice de acuerdo a la modificación realizada.
                        $rootScope.fechaOperacionesDesde = undefined;
                        $rootScope.fechaOperacionesHasta = undefined;
                        $state.reload();
                        return true;
                      } else {
                        self.error = msg.error;
                        return true;
                      }
                    },
                    function error(res) {
                      self.error = 'Se ha producido un error en el servicio';
                      return true;
                    }
                  );
                }
              }
            ],
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });

          modal.find('#inputFecha').val(dateToDateString(new Date(operacion.fecha), '/'));
          modal.find('#inputActivo').val(operacion.activo);
          modal.find('#inputTipo').val(operacion.tipo);
          modal.find('#inputTitulos').val(operacion.titulos);
          modal.find('#inputImporte').val(operacion.importe);
          modal.find('#inputComision').val(operacion.comision);
        };

        function filtrarOperaciones() {
          $rootScope.fechaOperacionesDesde = self.fechaDesde;
          $rootScope.fechaOperacionesHasta = self.fechaHasta;
          $rootScope.activo = self.activo;

          var fechaDesde = dateStringToDate(self.fechaDesde);
          var fechaHasta = dateStringToDate(self.fechaHasta);

          self.operacionesFiltro = _.filter(self.operaciones,
            function(op) {
              var fechaOp = new Date(op.fecha);
              return (self.activo == '' || self.activo == op.activo) && (fechaOp >= fechaDesde) && (fechaOp <= fechaHasta);
            }
          );
        };
      }],
      controllerAs: 'ctrlInversionesOperaciones'
    })
    /******************************
     * home.inversiones.operacion *
     ******************************/
    .state('home.inversiones.operacion', {
      url: '/operacion',
      templateUrl: '../views/inversiones.operacion.tpl',
      resolve: {
        activos: ['ActivosService', function(ActivosService) {
          return ActivosService.getActivos();
        }]
      },
      controller: ['$rootScope', '$state', '$timeout', 'activos', 'OperacionesService', function($rootScope, $state, $timeout, activos, OperacionesService) {
        var self = this;

        self.error = '';
        self.msg = {};
        self.msg.tipo = '';
        self.msg.texto = '';
        self.operacion = {};

        self.operacion.fecha = '';
        self.operacion.activo = '';
        self.operacion.tipo = '';
        self.operacion.titulos = '';
        self.operacion.importe = '';
        self.operacion.comision = '';

        if(activos.error != '') {
          self.error = activos.error;
        } else {
          self.activos = activos.data;
        }
        
        self.aceptar = function() {
          if(!isNumber(self.operacion.titulos)) {
            alert('Los títulos no son un número válido');
            return;
          }

          self.operacion.titulos = parseFloat(self.operacion.titulos);
          if(self.operacion.titulos == 0) {
            alert('Los títulos no pueden ser 0');
            return;
          }

          if(!isNumber(self.operacion.importe)) {
            alert('El importe no es un número válido');
            return;
          }

          self.operacion.importe = parseFloat(self.operacion.importe);

          if(!isNumber(self.operacion.comision)) {
            alert('La comisión no es un número válido');
            return;
          }

          self.operacion.comision = parseFloat(self.operacion.comision);

          OperacionesService.addOperacion(self.operacion).then(
            function(res) {
              var msg = res.data;
              if(msg.error == '') {
                self.msg.tipo = 'warning';
                self.msg.texto = 'Operación registrada';

                // Antes de saltar al estado "home.inversiones.operaciones" reseteamos el periodo de
                // fechas del filtro para que se actualice de acuerdo a la nueva operación introducida.
                $rootScope.fechaOperacionesDesde = undefined;
                $rootScope.fechaOperacionesHasta = undefined;
                $state.go('home.inversiones.operaciones');
              } else {
                self.msg.tipo = 'danger';
                self.msg.texto = msg.error;
              }
              mostrarMensaje();
            },
            function error(res) {
              self.msg.tipo = 'danger';
              self.msg.texto = 'Se ha producido un error en el servicio';
              mostrarMensaje();
            }
          );
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              $state.reload();
            }, 3000);
          }
        };
      }],
      controllerAs: 'ctrlInversionesOperacion'
    })
    /****************************
     * home.inversiones.activos *
     ****************************/
    .state('home.inversiones.activos', {
      url: '/activos',
      templateUrl: '../views/inversiones.activos.tpl',
      resolve: {
        activos: ['ActivosService', function(ActivosService) {
          return ActivosService.getActivos();
        }]
      },
      controller: ['$scope', '$state', '$timeout', 'activos', 'ActivosService', function($scope, $state, $timeout, activos, ActivosService) {
        $scope.cambiarTab('idTabActivos');

        var self = this;

        self.error = '';
        self.msg = {};
        self.msg.tipo = '';
        self.msg.texto = '';

        if(activos.error != '') {
          self.error = activos.error;
        } else {
          self.activos = activos.data;
        }

        self.eliminar = function(codigo) {
          bootbox.confirm({
            message: '¿Seguro que quieres eliminar el activo?',
            title: 'Eliminar activo',
            buttons: {
              confirm: {
                label: 'Eliminar',
                className: 'btn btn-danger pull-right width100 cursorPointer'
              },
              cancel: {
                label: 'Cancelar',
                className: 'btn btn-secondary pull-right width100 cursorPointer'
              }
            },
            callback: function(res) {
              if(res) {
                ActivosService.delActivo(codigo).then(
                  function(res) {
                    var msg = res.data;
                    if(msg.error == '') {
                      $state.reload();
                    } else {
                      self.msg.tipo = 'danger';
                      self.msg.texto = msg.error;
                      mostrarMensaje();
                    }
                  },
                  function error(res) {
                    self.error = 'Se ha producido un error en el servicio';
                  }
                );
              }
            },
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });
        };

        self.editar = function(activo) {
          var modal = bootbox.dialog({
            message: $('#divEdicionActivo').html(),
            title: 'Modificar activo',
            buttons: [
              { label: 'Cancelar',
                className: 'btn btn-secondary pull-right width100 cursorPointer',
                callback: function() {
                  return true;
                }
              },
              { label: 'Modificar',
                className: 'btn btn-primary marginRight10 pull-right width100 cursorPointer',
                callback: function() {
                  var codigo = modal.find('#inputCodigo');
                  var codigoOriginal = modal.find('#inputCodigoOriginal');                  
                  var descripcion = modal.find('#inputDescripcion');
                  var wsUrl = modal.find('#inputWsUrl');
                  var wsPathPrecio = modal.find('#inputWsPathPrecio');
                  var precioManual = modal.find('#inputPrecioManual');

                  if(codigo.val() == '') {
                    alert('Debes indicar el código del activo');
                    codigo.focus();
                    return false;
                  }

                  if(descripcion.val() == '') {
                    alert('Debes indicar la descripción del activo');
                    descripcion.focus();
                    return false;
                  }

                  if(wsUrl.val() == '' && wsPathPrecio.val() == '' && precioManual.val() == '') {
                    alert('Debes especificar el web service o definir un precio de forma manual');
                    return false;
                  }

                  if(wsUrl.val() != '' && wsPathPrecio.val() == '') {
                    alert('Debes especificar el path GJSON del precio');
                    return false;
                  }

                  if(wsUrl.val() == '' && wsPathPrecio.val() != '') {
                    alert('Debes especificar el web service');
                    return false;
                  }

                  if(!isNumber(precioManual.val())) {
                    alert('El precio manual no es un número válido');
                    return false;
                  }

                  activo.codigo = codigo.val().toUpperCase();
                  activo.codigo_original = codigoOriginal.val();
                  activo.descripcion = descripcion.val();
                  activo.ws_url = wsUrl.val();
                  activo.ws_path_precio = wsPathPrecio.val();
                  activo.precio_manual = parseFloat(precioManual.val());
                      
                  ActivosService.modActivo(activo).then(
                    function(res) {
                      var msg = res.data;
                      if(msg.error == '') {
                        $state.reload();
                        return true;
                      } else {
                        self.error = msg.error;
                        return true;
                      }
                    },
                    function error(res) {
                      self.error = 'Se ha producido un error en el servicio';
                      return true;
                    }
                  );
                }
              }
            ],
            closeButton: false,
            onEscape: function() {
              modal.modal('hide');
            }
          });

          modal.find('#inputCodigoOriginal').val(activo.codigo);
          modal.find('#inputCodigo').val(activo.codigo);
          modal.find('#inputDescripcion').val(activo.descripcion);
          modal.find('#inputWsUrl').val(activo.ws_url);
          modal.find('#inputWsPathPrecio').val(activo.ws_path_precio);
          modal.find('#inputPrecioManual').val(activo.precio_manual == 0 ? '' : activo.precio_manual);
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              $state.reload();
            }, 3000);
          }
        };
      }],
      controllerAs: 'ctrlInversionesActivos'
    })
    /***************************
     * home.inversiones.activo *
     ***************************/
    .state('home.inversiones.activo', {
      url: '/activo',
      templateUrl: '../views/inversiones.activo.tpl',
      controller: ['$state', '$timeout', 'ActivosService', function($state, $timeout, ActivosService) {
        var self = this;

        self.error = '';
        self.msg = {};
        self.msg.tipo = '';
        self.msg.texto = '';
        self.activo = {};

        self.activo.codigo = '';
        self.activo.descripcion = '';
        self.activo.ws_url = '';
        self.activo.ws_path_precio = '';
        self.activo.precio_manual = '';

        self.aceptar = function() {
          if(self.activo.ws_url.length == 0 && self.activo.ws_path_precio.length == 0 && self.activo.precio_manual.length == 0) {
            alert('Debes especificar el web service o definir un precio de forma manual');
          } else if(self.activo.ws_url.length != 0 && self.activo.ws_path_precio.length == 0) {
            alert('Debes especificar el path GJSON del precio');
          } else if(self.activo.ws_url.length == 0 && self.activo.ws_path_precio.length != 0) {
            alert('Debes especificar el web service');
          } else if(isNumber(self.activo.precio_manual)) {
            self.activo.precio_manual = parseFloat(self.activo.precio_manual);
            if(self.activo.precio_manual == 0) {
              alert('El precio del activo no puede ser 0');
            } else {
              self.activo.codigo = self.activo.codigo.toUpperCase();
              ActivosService.addActivo(self.activo).then(
                function(res) {
                  var msg = res.data;
                  if(msg.error == '') {
                    self.msg.tipo = 'warning';
                    self.msg.texto = 'Activo registrado';
                    $state.go('home.inversiones.activos');
                  } else {
                    self.msg.tipo = 'danger';
                    self.msg.texto = msg.error;
                  }
                  mostrarMensaje();
                },
                function error(res) {
                  self.msg.tipo = 'danger';
                  self.msg.texto = 'Se ha producido un error en el servicio';
                  mostrarMensaje();
                }
              );
            }
          } else {
            alert('El precio del activo debe ser numérico');
          }
        };

        function mostrarMensaje() {
          if(self.msg.texto != undefined && self.msg.texto != '') {
            $timeout(function() {
              $state.reload();
            }, 3000);
          }
        };
      }],
      controllerAs: 'ctrlInversionesActivo'
    });

	$urlRouterProvider.otherwise('/login');
}]);