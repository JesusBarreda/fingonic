package server

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/globalsign/mgo/bson"
	"github.com/gorilla/mux"
)

const (
	ProveedorServicio = "fingonic.herokuapp.com"
	TokenExpiration   = time.Minute * 30
)

// Autentifica al usuario en la aplicación y devuelve un token de seguridad (JWT)
func loginHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var user User

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&user)

	if err != nil {
		msg.Error = "Error decodificando información de login"
	} else if user.Name != userValid.Name || user.Password != userValid.Password {
		msg.Error = "Credenciales incorrectas"
	} else {
		token := jwt.New(jwt.SigningMethodHS256)
		claims := token.Claims.(jwt.MapClaims)
		claims["iss"] = ProveedorServicio
		claims["sub"] = userValid.Name
		claims["exp"] = time.Now().Add(TokenExpiration).Unix()
		tokenString, err := token.SignedString([]byte(userValid.Password))
		if err != nil {
			msg.Error = "Error firmando token"
		} else {
			user.Token = tokenString
		}
	}

	msg.Data = user

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Middleware que aplica la seguridad JWT. Extrae de la cabecera el token y comprueba que es válido
func aplicarSeguridad(fn func(http.ResponseWriter, *http.Request)) func(http.ResponseWriter, *http.Request) {
	return func(res http.ResponseWriter, req *http.Request) {
		var msg Msg

		authorization := req.Header.Get("Authorization")
		if authorization == "" {
			msg.Error = "security token not found"
		} else {
			tokenString := strings.Split(authorization, " ")[1]

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return []byte(userValid.Password), nil
			})

			if err != nil || !token.Valid {
				msg.Error = err.Error()
			} else {
				// Si queremos recuperar alguno de los claims, habría que proceder
				// de la siguiente manera:
				//
				// Ejemplo: comprobación del proveedor del servicio (iss) y del
				//          tiempo de expiración del token (exp)
				//
				//          claims := token.Claims.(jwt.MapClaims)
				//          proveedor := claims["iss"].(string)
				//          if proveedor != ProveedorServicio {
				//            msg.Error = "provider unknown"
				//          }
				//
				//          fechaExpiracion := claims["exp"].(float64)
				// 					fecha := time.Now().Unix()
				//          if float64(fecha) >= fechaExpiracion {
				//            msg.Error = "token is expired"
				//          }
				fn(res, req)
				return
			}
		}

		json, err := json.Marshal(msg)
		if err != nil {
			msg.Error = err.Error()
		}

		res.Header().Set("Content-Type", "application/json")
		res.Write(json)
	}
}

// Graba la configuración con la que se presenta la información
func setConfigHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var config Configuracion

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&config)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := setConfig(&config)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

func getDefaultConfig() Configuracion {
	hoy, _ := time.Parse("02/01/2006", time.Now().Format("02/01/2006"))
	undefined, _ := time.Parse("02/01/2006", "31/12/9999")

	return Configuracion{
		Liquidez: Liquidez{
			Saldo: 0,
			Fecha: hoy,
		},
		PeriodoInversiones: Periodo{
			FechaDesde: hoy,
			FechaHasta: undefined,
		},
		TipoVista:  DetalleDiario,
		Categorias: []Categoria{"*"},
		Ingresos:   true,
		Gastos:     true,
	}
}

// Devuelve la configuración con la que se presenta la información
func getConfigHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	config, err := getConfig()
	if err != nil {
		if err.Error() == "not found" {
			msg.Data = getDefaultConfig()
			err = nil
		} else {
			msg.Error = err.Error()
		}
	} else {
		msg.Data = config
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Devuelve las categorías asignadas a los movimientos registrados
func getCategoriasHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	categorias, err := getCategorias()
	if err != nil {
		msg.Error = err.Error()
	} else {
		msg.Data = categorias
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Modifica una categoría
func modCategoriaHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var cambioCategoria CambioCategoria

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&cambioCategoria)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := modCategoria(&cambioCategoria)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Devuelve los conceptos de los movimientos registrados
func getConceptosHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	conceptos, err := getConceptos()
	if err != nil {
		msg.Error = err.Error()
	} else {
		msg.Data = conceptos
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Crea un movimiento
func addMovimientoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var mov Movimiento

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&mov)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := addMovimiento(&mov)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Devuelve los movimientos registrados entre las 2 fechas pasadas por parámetro
// en la URL que cumplen con el filtro indicado en la colección 'configuracion'
func getMovimientosHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	config, err := getConfig()
	if err != nil {
		if err.Error() == "not found" {
			config = getDefaultConfig()
			err = nil
		} else {
			msg.Error = err.Error()
		}
	}

	if err == nil {
		params := mux.Vars(req)
		fechaDesde, err := paramDateToTime(params["fechaDesde"])
		if err != nil {
			msg.Error = err.Error()
		} else {
			fechaHasta, err := paramDateToTime(params["fechaHasta"])
			if err != nil {
				msg.Error = err.Error()
			} else {
				if fechaDesde.After(fechaHasta) {
					msg.Error = "'fechaDesde (" + params["fechaDesde"] + ")' posterior a 'fechaHasta (" + params["fechaHasta"] + ")'"
				} else {
					if config.TipoVista == DetalleDiario {
						movimientos, err := getMovimientos(config.Categorias, config.Ingresos, config.Gastos, fechaDesde, fechaHasta)
						if err != nil {
							msg.Error = err.Error()
						} else {
							msg.Data = movimientos
						}
					} else {
						agregacion, err := getAgregacion(&config, fechaDesde, fechaHasta)
						if err != nil {
							msg.Error = err.Error()
						} else {
							msg.Data = agregacion
						}
					}
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Modifica un movimiento
func modMovimientoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var mov Movimiento

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&mov)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := modMovimiento(&mov)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Elimina un movimiento
func delMovimientoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	params := mux.Vars(req)

	err := delMovimiento(params["id"])

	if err != nil {
		msg.Error = err.Error()
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Obtiene la evolución de la liquidez entre 2 meses pasados por parámetro
func getLiquidezMensualHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	config, err := getConfig()
	if err != nil {
		if err.Error() == "not found" {
			config = getDefaultConfig()
			err = nil
		} else {
			msg.Error = err.Error()
		}
	}

	if err == nil {
		params := mux.Vars(req)
		mesDesde := params["mesDesde"]
		mesHasta := params["mesHasta"]

		if mesDesde == "" && mesHasta == "" {
			mesDesde = config.Liquidez.Fecha.Format("01") + "-" + config.Liquidez.Fecha.Format("2006")
			mesHasta = time.Now().Format("01") + "-" + time.Now().Format("2006")
		}

		splitMesDesde := strings.Split(mesDesde, "-")
		splitMesHasta := strings.Split(mesHasta, "-")

		if (splitMesDesde[1] + splitMesDesde[0]) > (splitMesHasta[1] + splitMesHasta[0]) {
			msg.Error = "Mes inicio del periodo (" + mesDesde + ") posterior al mes fin del periodo (" + mesHasta + ")"
		} else {
			fechaRegistroLiquidez := config.Liquidez.Fecha
			diasMesHasta := numDiasMes(mesHasta)
			fechaHasta, err := paramDateToTime(strconv.Itoa(diasMesHasta) + "-" + mesHasta)
			if err != nil {
				msg.Error = err.Error()
			} else {
				if fechaHasta.Before(fechaRegistroLiquidez) {
					msg.Error = "Fecha fin del periodo solicitado (" + fechaHasta.Format("02/01/2006") + ") anterior a la fecha de registro de la liquidez (" + fechaRegistroLiquidez.Format("02/01/2006") + ")"
				} else {
					totales, err := getTotalesMensuales(fechaRegistroLiquidez.AddDate(0, 0, 1), fechaHasta)

					if err != nil {
						msg.Error = err.Error()
					} else {
						liquidez := getLiquidezMensual(&config.Liquidez, totales)

						ultimoMesLiquidez := liquidez[len(liquidez)-1]["mes"].(string)
						splitUltimoMesLiquidez := strings.Split(ultimoMesLiquidez, " ")
						ultimoMesLiquidez = splitUltimoMesLiquidez[1] + stringMesToNumber(splitUltimoMesLiquidez[0])

						if (splitMesDesde[1] + splitMesDesde[0]) > ultimoMesLiquidez {
							msg.Error = "No hay disponible información sobre la evolución de la liquidez para el periodo " + mesDesde + " / " + mesHasta
						} else {
							rangoLiquidez := []bson.M{}
							mesDesde = splitMesDesde[1] + splitMesDesde[0]
							mesHasta = splitMesHasta[1] + splitMesHasta[0]
							for _, saldoMes := range liquidez {
								splitSaldoMes := strings.Split(saldoMes["mes"].(string), " ")
								mesSaldoMes := splitSaldoMes[1] + stringMesToNumber(splitSaldoMes[0])

								if mesSaldoMes >= mesDesde && mesSaldoMes <= mesHasta {
									rangoLiquidez = append(rangoLiquidez, saldoMes)
								}
							}

							msg.Data = rangoLiquidez
						}
					}
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Obtiene la evolución de la liquidez entre 2 años pasados por parámetro
func getLiquidezAnualHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	config, err := getConfig()
	if err != nil {
		if err.Error() == "not found" {
			config = getDefaultConfig()
			err = nil
		} else {
			msg.Error = err.Error()
		}
	}

	if err == nil {
		params := mux.Vars(req)
		agnoDesde := params["agnoDesde"]
		agnoHasta := params["agnoHasta"]

		if agnoDesde == "" && agnoHasta == "" {
			agnoDesde = config.Liquidez.Fecha.Format("2006")
			agnoHasta = time.Now().Format("2006")
		}

		if agnoDesde > agnoHasta {
			msg.Error = "Año inicio del periodo (" + agnoDesde + ") posterior al año fin del periodo (" + agnoHasta + ")"
		} else {
			fechaRegistroLiquidez := config.Liquidez.Fecha
			fechaHasta, err := paramDateToTime("31-12-" + agnoHasta)
			if err != nil {
				msg.Error = err.Error()
			} else {
				if fechaHasta.Before(fechaRegistroLiquidez) {
					msg.Error = "Fecha fin del periodo solicitado (" + fechaHasta.Format("02/01/2006") + ") anterior a la fecha de registro de la liquidez (" + fechaRegistroLiquidez.Format("02/01/2006") + ")"
				} else {
					totales, err := getTotalesAnuales(fechaRegistroLiquidez.AddDate(0, 0, 1), fechaHasta)
					if err != nil {
						msg.Error = err.Error()
					} else {
						liquidez := getLiquidezAnual(&config.Liquidez, totales)

						ultimoAgnoLiquidez := liquidez[len(liquidez)-1]["agno"].(string)

						if agnoDesde > ultimoAgnoLiquidez {
							msg.Error = "No hay disponible información sobre la evolución de la liquidez para el periodo " + agnoDesde + " / " + agnoHasta
						} else {
							rangoLiquidez := []bson.M{}
							for _, saldoAgno := range liquidez {
								if saldoAgno["agno"].(string) >= agnoDesde && saldoAgno["agno"].(string) <= agnoHasta {
									rangoLiquidez = append(rangoLiquidez, saldoAgno)
								}
							}

							msg.Data = rangoLiquidez
						}
					}
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Devuelve los activos registrados
func getActivosHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	activos, err := getActivos()
	if err != nil {
		msg.Error = err.Error()
	} else {
		msg.Data = activos
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Crea un activo
func addActivoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var activo Activo

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&activo)

	if err != nil {
		msg.Error = err.Error()
	} else {
		existe, err := existeActivo(activo.Codigo)

		if err != nil {
			msg.Error = err.Error()
		} else if existe {
			msg.Error = "El activo " + activo.Codigo + " ya existe"
		} else {
			err := addActivo(&activo)
			if err != nil {
				msg.Error = err.Error()
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Elimina un activo
func delActivoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	params := mux.Vars(req)

	existeOperacion, err := existeOperacionActivo(params["codigo"])

	if err != nil {
		msg.Error = err.Error()
	} else if existeOperacion {
		msg.Error = "Existen operaciones sobre el activo"
	} else {
		err = delActivo(params["codigo"])

		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Modifica un activo
func modActivoHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var activo Activo

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&activo)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := modActivo(&activo)
		if err != nil {
			msg.Error = err.Error()
		} else if activo.Codigo != activo.CodigoOriginal {
			err = modActivoOperaciones(activo.CodigoOriginal, activo.Codigo)
			if err != nil {
				msg.Error = err.Error()
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Devuelve un map con los activos registrados
func getMapActivos() (map[string]Activo, error) {
	activos, err := getActivos()
	if err != nil {
		return nil, err
	} else {
		mapActivos := map[string]Activo{}
		for _, a := range activos {
			mapActivos[a.Codigo] = a
		}

		return mapActivos, nil
	}
}

// Devuelve las operaciones registradas
func getOperacionesHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	activos, err := getMapActivos()
	if err != nil {
		msg.Error = err.Error()
	} else {
		operaciones, err := getOperaciones()
		if err != nil {
			msg.Error = err.Error()
		} else {
			for i := 0; i < len(operaciones); i++ {
				operaciones[i].Descripcion = activos[operaciones[i].Activo].Descripcion
			}

			msg.Data = operaciones
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Crea una operación
func addOperacionHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var operacion Operacion

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&operacion)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := addOperacion(&operacion)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Modifica una operación
func modOperacionHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg
	var operacion Operacion

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&operacion)

	if err != nil {
		msg.Error = err.Error()
	} else {
		err := modOperacion(&operacion)
		if err != nil {
			msg.Error = err.Error()
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Elimina una operación
func delOperacionHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	params := mux.Vars(req)

	err := delOperacion(params["id"])

	if err != nil {
		msg.Error = err.Error()
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// En base a las operaciones realizadas devuelve la posición por activo
// y la posición global agregada.
func getPosicionHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	config, err := getConfig()
	if err != nil {
		msg.Error = err.Error()
	} else {
		activos, err := getActivos()
		if err != nil {
			msg.Error = err.Error()
		} else if len(activos) == 0 {
			msg.Data = Posicion{}
		} else {
			mapPrecios, err := getPrecios(activos, false)
			if err != nil {
				msg.Error = err.Error()
			} else {
				mapActivos := arrayActivosToMap(activos)
				operaciones, err := getOperacionesPeriodo(config.PeriodoInversiones)
				if err != nil {
					msg.Error = err.Error()
				} else if len(operaciones) == 0 {
					msg.Data = Posicion{}
				} else {
					for i := 0; i < len(operaciones); i++ {
						operaciones[i].Descripcion = mapActivos[operaciones[i].Activo].Descripcion
					}

					posicion := Posicion{}
					posicion.Global = PosicionGlobal{}
					posicion.Activos = []PosicionActivo{}

					mapPosicionActivo := make(map[string]*PosicionActivo)
					mapFifoVentasActivo := make(map[string]*FifoVentasActivo)

					for i := 0; i < len(operaciones); i++ {
						op := operaciones[i]
						pos, existe := mapPosicionActivo[op.Activo]
						if !existe {
							pos = &PosicionActivo{}
							pos.Activo = op.Activo
							pos.Descripcion = op.Descripcion

							if len(mapActivos[pos.Activo].WsUrl) != 0 {
								pos.OrigenPrecio = "ONLINE"
							} else {
								pos.OrigenPrecio = "MANUAL"
							}

							pos.Precio = mapPrecios[pos.Activo]

							mapPosicionActivo[pos.Activo] = pos
							mapFifoVentasActivo[pos.Activo] = &FifoVentasActivo{}
						}

						if op.Tipo == "COMPRA" {
							pos.Posicion += op.Titulos
							pos.Coste += op.Importe + op.Comision

							ca := &CompraActivo{op.Titulos, (op.Importe + op.Comision) / op.Titulos}
							mapFifoVentasActivo[pos.Activo].Push(ca)
							posicion.Global.Inversion -= op.Importe + op.Comision
						} else { /* VENTA */
							if pos.Posicion < op.Titulos {
								msg.Error = "Las ventas del activo " + pos.Activo + " superan su posición en el periodo de fechas analizado"
								break
							} else {
								pos.Posicion -= op.Titulos
								posicion.Global.Inversion += op.Importe - op.Comision

								for op.Titulos > 0 {
									ca := mapFifoVentasActivo[pos.Activo].Head()

									if floatEquals((*ca).Posicion, op.Titulos) || (*ca).Posicion > op.Titulos {
										if floatEquals((*ca).Posicion, op.Titulos) {
											_ = mapFifoVentasActivo[pos.Activo].Pop()
										}

										(*ca).Posicion -= op.Titulos
										pos.Coste -= op.Titulos * (*ca).Precio
										op.Titulos = 0
									} else {
										_ = mapFifoVentasActivo[pos.Activo].Pop()
										pos.Coste -= (*ca).Posicion * (*ca).Precio
										op.Titulos -= (*ca).Posicion
									}
								}
							}
						}
					}

					if len(msg.Error) == 0 {
						for _, pos := range mapPosicionActivo {
							if pos.Precio != -1 {
								pos.ValorPosicion = pos.Posicion * pos.Precio
								pos.PerdidaGanancia = pos.ValorPosicion - pos.Coste
							} else {
								pos.ValorPosicion = -1
								pos.PerdidaGanancia = -1
							}
						}

						for _, v := range mapPosicionActivo {
							if (*v).Posicion != 0 {
								posicion.Activos = append(posicion.Activos, *v)
								posicion.Global.ValorPosicion += (*v).ValorPosicion
							}
						}

						posicion.Global.PerdidaGanancia = posicion.Global.ValorPosicion + posicion.Global.Inversion

						msg.Data = posicion
					}
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Obtiene la evolución de las inversiones entre 2 meses pasados por parámetro
func getInversionesMensualHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	params := mux.Vars(req)
	mesDesde := params["mesDesde"]
	mesHasta := params["mesHasta"]

	if mesDesde == "" && mesHasta == "" {
		mesDesde = "01-2000"
		mesHasta = time.Now().Format("01") + "-" + time.Now().Format("2006")
	}

	splitMesDesde := strings.Split(mesDesde, "-")
	splitMesHasta := strings.Split(mesHasta, "-")

	if (splitMesDesde[1] + splitMesDesde[0]) > (splitMesHasta[1] + splitMesHasta[0]) {
		msg.Error = "Mes inicio del periodo (" + mesDesde + ") posterior al mes fin del periodo (" + mesHasta + ")"
	} else {
		diasMesHasta := numDiasMes(mesHasta)
		fechaHasta, err := paramDateToTime(strconv.Itoa(diasMesHasta) + "-" + mesHasta)
		if err != nil {
			msg.Error = err.Error()
		} else {
			fechaDesde, err := paramDateToTime("01-01-2000")
			if err != nil {
				msg.Error = err.Error()
			} else {
				periodo := Periodo{fechaDesde, fechaHasta}
				operaciones, err := getOperacionesPeriodo(periodo)
				if err != nil {
					msg.Error = err.Error()
				} else {
					rangoInversiones := []bson.M{}
					if len(operaciones) > 0 {
						activos, err := getActivos()
						if err != nil {
							msg.Error = err.Error()
						} else {
							precios, err := getPrecios(activos, true)
							if err != nil {
								msg.Error = err.Error()
							} else {
								mesAux := ""
								mesOperacion := ""
								mapPosicion := make(map[string]float64)
								for _, operacion := range operaciones {
									mesOperacion = operacion.Fecha.Format("01") + "-" + operacion.Fecha.Format("2006")
									if mesAux != "" && mesOperacion != mesAux {
										rangoInversiones = append(rangoInversiones, bson.M{"mes": mesAux, "valoracion": valorar(&mapPosicion, &precios, mesAux)})
										rellenarValoracionesMeses(&rangoInversiones, &mapPosicion, &precios, mesOperacion)
										mesAux = mesOperacion
									} else if mesAux == "" {
										mesAux = mesOperacion
									}

									titulos, existe := mapPosicion[operacion.Activo]
									if !existe {
										mapPosicion[operacion.Activo] = operacion.Titulos
									} else if operacion.Tipo == Compra {
										mapPosicion[operacion.Activo] = titulos + operacion.Titulos
									} else {
										mapPosicion[operacion.Activo] = titulos - operacion.Titulos
									}
								}

								rangoInversiones = append(rangoInversiones, bson.M{"mes": mesOperacion, "valoracion": valorar(&mapPosicion, &precios, mesOperacion)})
								rellenarValoracionesMeses(&rangoInversiones, &mapPosicion, &precios, mesSiguiente(mesHasta))

								for _, inversion := range rangoInversiones {
									inversion["mes"] = numberMesToString(inversion["mes"].(string)[0:2]) + " " + inversion["mes"].(string)[3:7]
								}
							}
						}
					}

					// Acotamos la salida con el "mesDesde" pasado por parámetro.
					mesDesde = numberMesToString(splitMesDesde[0]) + " " + splitMesDesde[1]
					indice := 0
					for i := indice; i < len(rangoInversiones); i++ {
						if rangoInversiones[i]["mes"] == mesDesde {
							indice = i
							break
						}
					}

					msg.Data = rangoInversiones[indice:]
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}

// Obtiene la evolución de las inversiones entre 2 años pasados por parámetro
func getInversionesAnualHandler(res http.ResponseWriter, req *http.Request) {
	var msg Msg

	params := mux.Vars(req)
	agnoDesde := params["agnoDesde"]
	agnoHasta := params["agnoHasta"]

	if agnoDesde == "" && agnoHasta == "" {
		agnoDesde = "2000"
		agnoHasta = time.Now().Format("2006")
	}

	if agnoDesde > agnoHasta {
		msg.Error = "Año inicio del periodo (" + agnoDesde + ") posterior al año fin del periodo (" + agnoHasta + ")"
	} else {
		fechaHasta, err := paramDateToTime("31-12-" + agnoHasta)
		if err != nil {
			msg.Error = err.Error()
		} else {
			fechaDesde, err := paramDateToTime("01-01-2000")
			if err != nil {
				msg.Error = err.Error()
			} else {
				periodo := Periodo{fechaDesde, fechaHasta}
				operaciones, err := getOperacionesPeriodo(periodo)
				if err != nil {
					msg.Error = err.Error()
				} else {
					rangoInversiones := []bson.M{}
					if len(operaciones) > 0 {
						activos, err := getActivos()
						if err != nil {
							msg.Error = err.Error()
						} else {
							precios, err := getPrecios(activos, true)
							if err != nil {
								msg.Error = err.Error()
							} else {
								agnoAux := ""
								agnoOperacion := ""
								mapPosicion := make(map[string]float64)
								for _, operacion := range operaciones {
									agnoOperacion = operacion.Fecha.Format("2006")
									if agnoAux != "" && agnoOperacion != agnoAux {
										rangoInversiones = append(rangoInversiones, bson.M{"agno": agnoAux, "valoracion": valorar(&mapPosicion, &precios, "12-"+agnoAux)})
										rellenarValoracionesAgnos(&rangoInversiones, &mapPosicion, &precios, agnoOperacion)
										agnoAux = agnoOperacion
									} else if agnoAux == "" {
										agnoAux = agnoOperacion
									}

									titulos, existe := mapPosicion[operacion.Activo]
									if !existe {
										mapPosicion[operacion.Activo] = operacion.Titulos
									} else if operacion.Tipo == Compra {
										mapPosicion[operacion.Activo] = titulos + operacion.Titulos
									} else {
										mapPosicion[operacion.Activo] = titulos - operacion.Titulos
									}
								}

								intAgnoHasta, _ := strconv.Atoi(agnoHasta)
								rangoInversiones = append(rangoInversiones, bson.M{"agno": agnoOperacion, "valoracion": valorar(&mapPosicion, &precios, "12-"+agnoOperacion)})
								rellenarValoracionesAgnos(&rangoInversiones, &mapPosicion, &precios, strconv.Itoa(intAgnoHasta+1))
							}
						}
					}

					// Acotamos la salida con el "agnoDesde" pasado por parámetro.
					indice := 0
					for i := indice; i < len(rangoInversiones); i++ {
						if rangoInversiones[i]["agno"] == agnoDesde {
							indice = i
							break
						}
					}

					msg.Data = rangoInversiones[indice:]
				}
			}
		}
	}

	resJson, err := json.Marshal(msg)
	if err != nil {
		resJson = toJson(err)
	}

	res.Header().Set("Content-Type", "application/json; charset=utf-8")
	res.Write(resJson)
}
