package server

import (
	"io/ioutil"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/globalsign/mgo/bson"
	"github.com/tidwall/gjson"
)

const (
	HttpResponseOk = 200
	Epsilon        = 0.00000001
)

var api_prices_ws string
var api_prices_key string
var abreviaturasMeses = []string{"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"}
var abreviaturasDiasSemana = []string{"Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"}

func init() {
	api_prices_ws = os.Getenv("API_PRICES_WS")
	api_prices_key = os.Getenv("API_PRICES_KEY")
}

func floatEquals(f1, f2 float64) bool {
	if math.Abs(f1-f2) < Epsilon {
		return true
	} else {
		return false
	}
}

func getLiquidezAnual(liquidez *Liquidez, totales []bson.M) []bson.M {
	evolucionLiquidez := []bson.M{}

	agnoRegistroLiquidez := liquidez.Fecha.Format("2006")

	if len(totales) == 0 {
		evolucionLiquidez = append(evolucionLiquidez, bson.M{"agno": agnoRegistroLiquidez, "saldo": liquidez.Saldo})
	} else {
		agnoInicioTotales := totales[0]["agno"].(string)

		if agnoRegistroLiquidez != agnoInicioTotales {
			evolucionLiquidez = append(evolucionLiquidez, bson.M{"agno": agnoRegistroLiquidez, "saldo": liquidez.Saldo})
		}

		saldoLiquidez := liquidez.Saldo
		for _, total := range totales {
			saldoLiquidez += total["importe"].(float64)
			evolucionLiquidez = append(evolucionLiquidez, bson.M{"agno": total["agno"].(string), "saldo": saldoLiquidez})
		}
	}

	return evolucionLiquidez
}

func getLiquidezMensual(liquidez *Liquidez, totales []bson.M) []bson.M {
	evolucionLiquidez := []bson.M{}

	mesRegistroLiquidez := numberMesToString(liquidez.Fecha.Format("01"))

	if len(totales) == 0 {
		mesRegistroLiquidez += " " + liquidez.Fecha.Format("2006")
		evolucionLiquidez = append(evolucionLiquidez, bson.M{"mes": mesRegistroLiquidez, "saldo": liquidez.Saldo})
	} else {
		splitMesInicioTotales := strings.Split(totales[0]["mes"].(string), " ")
		mesInicioTotales := splitMesInicioTotales[0]

		if mesRegistroLiquidez != mesInicioTotales {
			mesRegistroLiquidez += " " + liquidez.Fecha.Format("2006")
			evolucionLiquidez = append(evolucionLiquidez, bson.M{"mes": mesRegistroLiquidez, "saldo": liquidez.Saldo})
		}

		saldoLiquidez := liquidez.Saldo
		for _, total := range totales {
			saldoLiquidez += total["importe"].(float64)
			evolucionLiquidez = append(evolucionLiquidez, bson.M{"mes": total["mes"].(string), "saldo": saldoLiquidez})
		}
	}

	return evolucionLiquidez
}

/**
 * Modificamos esta función para adaptarla a los cambios realizados en el API por el proveedor de precios
 * (coinmarketcap.com). No obstante, a pesar de su adaptación, dejamos de utilizarla debido a que, además
 * de estos cambios en el API, el proveedor ha restringido las peticiones a 333 diarias para el plan BASIC
 * que es el que estamos utilizando.
 * En su lugar, utilizaremos la función getPrecios(activos []Activo, historicos) donde realizamos una única
 * petición para obtener los precios de todos los activos.
 */
func getPrecio(activo Activo) (float64, error) {
	if len(activo.WsUrl) == 0 {
		return activo.PrecioManual, nil
	}

	client := &http.Client{}
	req, err := http.NewRequest("GET", activo.WsUrl, nil)
	if err != nil {
		return -1, err
	}

	q := url.Values{}
	q.Add("symbol", activo.Codigo)
	q.Add("convert", "EUR")

	req.Header.Set("Accepts", "application/json")
	req.Header.Add("X-CMC_PRO_API_KEY", api_prices_key)
	req.URL.RawQuery = q.Encode()

	res, err := client.Do(req)
	if err != nil {
		return -1, err
	}

	respBody, _ := ioutil.ReadAll(res.Body)
	precio := gjson.Get(string(respBody), activo.WsPathPrecio)

	return precio.Float(), nil
}

/**
 * Devuelve en un map todos los precios de los activos tanto históricos a cierre de cada mes (en caso
 * de que se soliciten) como los online del momento actual.
 *
 *    - Precios históricos a cierre de cada mes -> map[Codigo + "#" + YYYY/MM] = Precio
 *    - Precios online -> map[Codigo] = Precio
 */
func getPrecios(activos []Activo, historicos bool) (map[string]float64, error) {
	if len(activos) == 0 {
		return map[string]float64{}, nil
	}

	var err error
	mapPrecios := map[string]float64{}

	if historicos {
		mapPrecios, err = getPreciosHistoricos()
		if err != nil {
			return mapPrecios, err
		}
	}

	client := &http.Client{}
	q := url.Values{}
	req, err := http.NewRequest("GET", api_prices_ws, nil)
	if err != nil {
		return mapPrecios, err
	}

	pedirPrecios := false

	symbols := ""
	for _, a := range activos {
		if len(a.WsUrl) == 0 {
			mapPrecios[a.Codigo] = a.PrecioManual
		} else {
			if len(symbols) == 0 {
				symbols += a.Codigo
			} else {
				symbols += "," + a.Codigo
			}
			pedirPrecios = true
		}
	}

	q.Add("symbol", symbols)
	q.Add("convert", "EUR")

	if pedirPrecios {
		req.Header.Set("Accepts", "application/json")
		req.Header.Add("X-CMC_PRO_API_KEY", api_prices_key)
		req.URL.RawQuery = q.Encode()

		res, err := client.Do(req)
		if err != nil {
			return mapPrecios, err
		}

		resBody, _ := ioutil.ReadAll(res.Body)
		strBody := string(resBody)
		for _, a := range activos {
			if len(a.WsUrl) != 0 {
				precio := gjson.Get(strBody, a.WsPathPrecio)
				mapPrecios[a.Codigo] = precio.Float()
			}
		}
	}

	return mapPrecios, nil
}

func isLeapYear(y int) bool {
	year := time.Date(y, time.December, 31, 0, 0, 0, 0, time.Local)
	days := year.YearDay()

	if days > 365 {
		return true
	} else {
		return false
	}
}

func numberMesToString(mes string) string {
	switch mes {
	case "01":
		return "Ene"
	case "02":
		return "Feb"
	case "03":
		return "Mar"
	case "04":
		return "Abr"
	case "05":
		return "May"
	case "06":
		return "Jun"
	case "07":
		return "Jul"
	case "08":
		return "Ago"
	case "09":
		return "Sep"
	case "10":
		return "Oct"
	case "11":
		return "Nov"
	case "12":
		return "Dic"
	default:
		return ""
	}
}

func numDiasMes(mes string) int {
	splitMes := strings.Split(mes, "-")
	numMes := splitMes[0]

	switch numMes {
	case "01", "03", "05", "07", "08", "10", "12":
		return 31
	case "02":
		agno, _ := strconv.Atoi(splitMes[1])
		if isLeapYear(agno) {
			return 29
		} else {
			return 28
		}
	case "04", "06", "09", "11":
		return 30
	default:
		return -1
	}
}

func paramDateToTime(fecha string) (time.Time, error) {
	layout := "02-01-2006"
	date, err := time.Parse(layout, fecha)

	if err != nil {
		return date, err
	} else {
		return date, nil
	}
}

func stringMesToNumber(mes string) string {
	switch mes {
	case "Ene":
		return "01"
	case "Feb":
		return "02"
	case "Mar":
		return "03"
	case "Abr":
		return "04"
	case "May":
		return "05"
	case "Jun":
		return "06"
	case "Jul":
		return "07"
	case "Ago":
		return "08"
	case "Sep":
		return "09"
	case "Oct":
		return "10"
	case "Nov":
		return "11"
	case "Dic":
		return "12"
	default:
		return ""
	}
}

func toJson(e error) []byte {
	return []byte("{\"error\": \"" + strings.Replace(e.Error(), "\"", "'", -1) + "\"}")
}

func traducirDiaSemana(fecha string) string {
	var split = strings.Split(fecha, " ")
	var traduccion = split[1]

	switch split[0] {
	case "Mon":
		traduccion = "Lun " + traduccion
	case "Tue":
		traduccion = "Mar " + traduccion
	case "Wed":
		traduccion = "Mié " + traduccion
	case "Thu":
		traduccion = "Jue " + traduccion
	case "Fri":
		traduccion = "Vie " + traduccion
	case "Sat":
		traduccion = "Sab " + traduccion
	case "Sun":
		traduccion = "Dom " + traduccion
	}

	return traduccion
}

func mesSiguiente(mes string) string {
	splitMes := strings.Split(mes, "-")
	intMes, _ := strconv.Atoi(splitMes[0])
	intAgno, _ := strconv.Atoi(splitMes[1])

	intMes += 1
	if intMes == 13 {
		intMes = 1
		intAgno++
	}

	if intMes < 10 {
		return "0" + strconv.Itoa(intMes) + "-" + strconv.Itoa(intAgno)
	} else {
		return strconv.Itoa(intMes) + "-" + strconv.Itoa(intAgno)
	}
}

func rellenarValoracionesMeses(valoraciones *[]bson.M, posicion *map[string]float64, precios *map[string]float64, mesHasta string) {
	mesDesde := (*valoraciones)[len(*valoraciones)-1]["mes"].(string)
	mesActual := time.Now().Format("2006") + time.Now().Format("01")

	for mesAux := mesSiguiente(mesDesde); mesAux != mesHasta; mesAux = mesSiguiente(mesAux) {
		splitMesAux := strings.Split(mesAux, "-")
		if splitMesAux[1]+splitMesAux[0] > mesActual {
			break
		}

		if mesAux != mesHasta {
			*valoraciones = append(*valoraciones, bson.M{"mes": mesAux, "valoracion": valorar(posicion, precios, mesAux)})
		}
	}
}

func rellenarValoracionesAgnos(valoraciones *[]bson.M, posicion *map[string]float64, precios *map[string]float64, agnoHasta string) {
	agnoDesde, _ := strconv.Atoi((*valoraciones)[len(*valoraciones)-1]["agno"].(string))
	mesActual := time.Now().Format("01")
	agnoActual, _ := strconv.Atoi(time.Now().Format("2006"))

	for agnoAux := agnoDesde + 1; strconv.Itoa(agnoAux) != agnoHasta; agnoAux++ {
		if agnoAux > agnoActual {
			break
		}

		if strconv.Itoa(agnoAux) != agnoHasta {
			if agnoAux != agnoActual {
				*valoraciones = append(*valoraciones, bson.M{"agno": strconv.Itoa(agnoAux), "valoracion": valorar(posicion, precios, "12-"+strconv.Itoa(agnoAux))})
			} else {
				*valoraciones = append(*valoraciones, bson.M{"agno": strconv.Itoa(agnoAux), "valoracion": valorar(posicion, precios, mesActual+"-"+strconv.Itoa(agnoAux))})
			}
		}
	}
}

func arrayActivosToMap(activos []Activo) map[string]Activo {
	mapActivos := map[string]Activo{}
	for _, a := range activos {
		mapActivos[a.Codigo] = a
	}

	return mapActivos
}

func arrayPreciosToMap(precios []Precio) map[string]float64 {
	mapPrecios := map[string]float64{}
	for _, p := range precios {
		mapPrecios[p.Activo+"#"+p.Fecha] = p.Precio
	}

	return mapPrecios
}

func valorar(posicion *map[string]float64, precios *map[string]float64, mes string) float64 {
	mesActual := time.Now().Format("01") + "-" + time.Now().Format("2006")
	valoracion := 0.0
	precio := 0.0
	existe := true

	for activo, titulos := range *posicion {
		if mes != mesActual {
			precio, existe = (*precios)[activo+"#"+mes[3:]+"/"+mes[0:2]]
		} else {
			precio, existe = (*precios)[activo]
		}

		if existe {
			valoracion += titulos * precio
		}
	}

	return valoracion
}
