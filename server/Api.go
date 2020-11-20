package server

import (
  "github.com/gorilla/mux"
)

var router *mux.Router

func init() {
	// Inicializamos el API del backend
  router = mux.NewRouter()

  /* GET */
  router.HandleFunc("/api/categorias", aplicarSeguridad(getCategoriasHandler)).Methods("GET")
  router.HandleFunc("/api/conceptos", aplicarSeguridad(getConceptosHandler)).Methods("GET")
  router.HandleFunc("/api/config", aplicarSeguridad(getConfigHandler)).Methods("GET")

  router.HandleFunc("/api/inversiones/activos", aplicarSeguridad(getActivosHandler)).Methods("GET")
  router.HandleFunc("/api/inversiones/operaciones", aplicarSeguridad(getOperacionesHandler)).Methods("GET")
  router.HandleFunc("/api/inversiones/posicion", aplicarSeguridad(getPosicionHandler)).Methods("GET")

  router.HandleFunc("/api/inversiones/evolutivo/anual", aplicarSeguridad(getInversionesAnualHandler)).Methods("GET")
  router.HandleFunc("/api/inversiones/evolutivo/mensual", aplicarSeguridad(getInversionesMensualHandler)).Methods("GET")
  router.HandleFunc("/api/liquidez/evolutivo/anual", aplicarSeguridad(getLiquidezAnualHandler)).Methods("GET")
  router.HandleFunc("/api/liquidez/evolutivo/mensual", aplicarSeguridad(getLiquidezMensualHandler)).Methods("GET")
  router.HandleFunc("/api/movimientos/{fechaDesde}/{fechaHasta}", aplicarSeguridad(getMovimientosHandler)).Methods("GET")

  router.HandleFunc("/api/inversiones/evolutivo/anual/{agnoDesde}/{agnoHasta}", aplicarSeguridad(getInversionesAnualHandler)).Methods("GET")
  router.HandleFunc("/api/inversiones/evolutivo/mensual/{mesDesde}/{mesHasta}", aplicarSeguridad(getInversionesMensualHandler)).Methods("GET")
  
  router.HandleFunc("/api/liquidez/evolutivo/anual/{agnoDesde}/{agnoHasta}", aplicarSeguridad(getLiquidezAnualHandler)).Methods("GET")
  router.HandleFunc("/api/liquidez/evolutivo/mensual/{mesDesde}/{mesHasta}", aplicarSeguridad(getLiquidezMensualHandler)).Methods("GET")

  /* POST */
  router.HandleFunc("/api/login", loginHandler).Methods("POST")
  router.HandleFunc("/api/movimientos", aplicarSeguridad(addMovimientoHandler)).Methods("POST")

  router.HandleFunc("/api/inversiones/activo", aplicarSeguridad(addActivoHandler)).Methods("POST")
  router.HandleFunc("/api/inversiones/operacion", aplicarSeguridad(addOperacionHandler)).Methods("POST")

  /* PUT */
  router.HandleFunc("/api/categorias", aplicarSeguridad(modCategoriaHandler)).Methods("PUT")
  router.HandleFunc("/api/config", aplicarSeguridad(setConfigHandler)).Methods("PUT")
  router.HandleFunc("/api/movimientos", aplicarSeguridad(modMovimientoHandler)).Methods("PUT")

  router.HandleFunc("/api/inversiones/activos", aplicarSeguridad(modActivoHandler)).Methods("PUT")
  router.HandleFunc("/api/inversiones/operaciones", aplicarSeguridad(modOperacionHandler)).Methods("PUT")

  /* DELETE */
  router.HandleFunc("/api/movimientos/{id}", aplicarSeguridad(delMovimientoHandler)).Methods("DELETE")
  
  router.HandleFunc("/api/inversiones/activos/{codigo}", aplicarSeguridad(delActivoHandler)).Methods("DELETE")
  router.HandleFunc("/api/inversiones/operaciones/{id}", aplicarSeguridad(delOperacionHandler)).Methods("DELETE")
}
