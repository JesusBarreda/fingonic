package server

import (
	"os"
	"time"

	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

var conexion *mgo.Session

// Abrimos conexión con la base de datos
func init() {
	var err error
	entorno := os.Getenv("ENTORNO")

	if entorno == "PRO" {
		db_user := os.Getenv("DB_USER")
		db_password := os.Getenv("DB_PASSWORD")
		db_shard0 := os.Getenv("DB_SHARD0")
		db_shard1 := os.Getenv("DB_SHARD1")
		db_shard2 := os.Getenv("DB_SHARD2")
		db_database := os.Getenv("DB_DATABASE")
		conexion, err = mgo.Dial("mongodb://" + db_user + ":" + db_password + "@" + db_shard0 + "," + db_shard1 + "," + db_shard2 + "/" + db_database + "?ssl=true&replicaSet=atlas-ou44b7-shard-0&authSource=admin&w=majority")
	} else {
		conexion, err = mgo.Dial(os.Getenv("DB_URL"))
	}
	if err != nil {
		panic(err)
	}
}

// Graba la configuración con la que se presenta la información
func setConfig(config *Configuracion) error {
	c := conexion.DB("fingonic").C("configuracion")

	err := c.Remove(nil)
	if err == nil || err.Error() == "not found" {
		err = c.Insert(config)
		if err != nil {
			return err
		}
	}

	return nil
}

// Devuelve la configuración con la que se presenta la información
func getConfig() (Configuracion, error) {
	c := conexion.DB("fingonic").C("configuracion")

	config := Configuracion{}
	err := c.Find(nil).One(&config)

	if err != nil {
		return config, err
	} else {
		return config, nil
	}
}

// Devuelve las categorías asignadas a los movimientos registrados
func getCategorias() ([]Categoria, error) {
	c := conexion.DB("fingonic").C("movimientos")

	categorias := []Categoria{}
	err := c.Find(nil).Distinct("categoria", &categorias)

	if err != nil {
		return categorias, err
	} else {
		return categorias, nil
	}
}

// Modifica una categoría
func modCategoria(cambioCategoria *CambioCategoria) error {
	c := conexion.DB("fingonic").C("movimientos")

	_, err := c.UpdateAll(bson.M{"categoria": cambioCategoria.CategoriaAntigua}, bson.M{"$set": bson.M{"categoria": cambioCategoria.CategoriaNueva}})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Devuelve los conceptos de los movimientos registrados
func getConceptos() ([]string, error) {
	c := conexion.DB("fingonic").C("movimientos")

	conceptos := []string{}
	err := c.Find(nil).Distinct("concepto", &conceptos)

	if err != nil {
		return conceptos, err
	} else {
		return conceptos, nil
	}
}

// Crea un movimiento
func addMovimiento(mov *Movimiento) error {
	c := conexion.DB("fingonic").C("movimientos")

	err := c.Insert(mov)
	if err != nil {
		return err
	} else {
		return nil
	}
}

// Modifica el movimiento
func modMovimiento(mov *Movimiento) error {
	c := conexion.DB("fingonic").C("movimientos")

	err := c.Update(bson.M{"_id": mov.Id}, bson.M{"fecha": mov.Fecha, "categoria": mov.Categoria, "concepto": mov.Concepto, "importe": mov.Importe})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Elimina el movimiento con el id indicado
func delMovimiento(id string) error {
	c := conexion.DB("fingonic").C("movimientos")

	err := c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return err
	} else {
		return nil
	}
}

func getFiltro(categorias []Categoria, ingresos bool, gastos bool, fechaDesde time.Time, fechaHasta time.Time) bson.M {
	filtro := bson.M{}

	if len(categorias) != 1 || categorias[0] != "*" {
		filtro["categoria"] = bson.M{"$in": categorias}
	}

	if ingresos && gastos {
		filtro["$or"] = []bson.M{bson.M{"importe": bson.M{"$lt": 0}}, bson.M{"importe": bson.M{"$gt": 0}}}
	} else if ingresos {
		filtro["importe"] = bson.M{"$gt": 0}
	} else {
		filtro["importe"] = bson.M{"$lt": 0}
	}

	filtro["fecha"] = bson.M{"$gte": fechaDesde, "$lte": fechaHasta}

	return filtro
}

// Devuelve los movimientos que cumplen con los filtros indicados en los parámetros
func getMovimientos(categorias []Categoria, ingresos bool, gastos bool, fechaDesde time.Time, fechaHasta time.Time) ([]Movimiento, error) {
	c := conexion.DB("fingonic").C("movimientos")

	movimientos := []Movimiento{}

	filtro := getFiltro(categorias, ingresos, gastos, fechaDesde, fechaHasta)

	err := c.Find(filtro).All(&movimientos)

	if err != nil {
		return movimientos, err
	} else {
		return movimientos, nil
	}
}

// Devuelve los movimientos agregados entre las fechas indicadas que cumplen con los filtros
// indicados en el objeto 'config'
func getAgregacion(config *Configuracion, fechaDesde time.Time, fechaHasta time.Time) ([]bson.M, error) {
	c := conexion.DB("fingonic").C("movimientos")

	agregacion := []bson.M{}
	query := []bson.M{}

	// $match: selección de movimientos (categorias, ingresos y/o gastos, periodo de fechas)
	match := getFiltro(config.Categorias, config.Ingresos, config.Gastos, fechaDesde, fechaHasta)
	query = append(query, bson.M{"$match": match})

	if config.TipoVista == DetalleMensual {
		/*****************************
		 * TipoVista = DetalleMensual *
		 ******************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "mes": bson.M{"$month": "$fecha"}, "categoria": "$categoria", "concepto": "$concepto"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "mes": "$_id.mes", "categoria": "$_id.categoria", "concepto": "$_id.concepto", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasan el año y el mes a string para poder posteriormente concatenarlos
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "mes": bson.M{"$substr": []interface{}{"$mes", 0, -1}}, "categoria": 1, "concepto": 1, "importe": 1}
		query = append(query, bson.M{"$project": project2})

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $strLenCP sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, no podemos utilizar esta combinación de sentencias.
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: se obtiene la longitud del mes (número de caracteres) para, a la hora de concatenarlo con el año para
		//              construir la fecha, saber si hay que incluirle un cero por delante o no
		//
		// project3 := bson.M{"agno": 1, "mes": 1, "categoria": 1, "concepto": 1, "importe": 1, "lenMes": bson.M{"$strLenCP": "$mes"}}
		// query = append(query, bson.M{"$project": project3})

		// 4) $project: se construye la fecha concatenando el mes al año (MM/yyyy). En la concatenación se incluye un cero por
		//              delante del mes en el caso de que éste tenga un sólo dígito
		//
		// project4 := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$lt": []interface{}{"$lenMes", 2}}, "then": bson.M{"$concat": []interface{}{"0", "$mes", "/", "$agno"}}, "else": bson.M{"$concat": []interface{}{"$mes", "/", "$agno"}}}}, "categoria": 1, "concepto": 1, "importe": 1}
		// query = append(query, bson.M{"$project": project4})
		//--------------------------------------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: se obtienen los 3 primeros caracteres del mes para luego construir la fecha
		project3 := bson.M{"mes": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "1"}}, "then": "Ene"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "2"}}, "then": "Feb"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "4"}}, "then": "Abr"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "5"}}, "then": "May"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "6"}}, "then": "Jun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "7"}}, "then": "Jul"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "8"}}, "then": "Ago"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "9"}}, "then": "Sep"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "10"}}, "then": "Oct"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "11"}}, "then": "Nov"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "12"}}, "then": "Dic"}}, "default": "-"}}, "agno": 1, "categoria": 1, "concepto": 1, "importe": 1}
		query = append(query, bson.M{"$project": project3})

		// 3) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
		//
		// for i := 0; i < 12; i++ {
		//   projectMes := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$mes", strconv.Itoa(i + 1)}}, "then": abreviaturasMeses[i], "else": "$mes"}}, "agno": 1, "categoria": 1, "concepto": 1, "importe": 1}
		//   query = append(query, bson.M{"$project": projectMes})
		// }
		//--------------------------------------------------------------------------------------------------------------------------

		// 4) $project: se construye la fecha concatenando el mes con el año
		project4 := bson.M{"mes": bson.M{"$concat": []interface{}{"$mes", " ", "$agno"}}, "categoria": 1, "concepto": 1, "importe": 1}
		query = append(query, bson.M{"$project": project4})
	} else if config.TipoVista == DetalleAnual {
		/***************************
		 * TipoVista = DetalleAnual *
		 ****************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "categoria": "$categoria", "concepto": "$concepto"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "categoria": "$_id.categoria", "concepto": "$_id.concepto", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasa el año a string
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "categoria": 1, "concepto": 1, "importe": 1}
		query = append(query, bson.M{"$project": project2})
	} else if config.TipoVista == DetalleTotal {
		/***************************
		 * TipoVista = DetalleTotal *
		 ****************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"categoria": "$categoria", "concepto": "$concepto"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "categoria": "$_id.categoria", "concepto": "$_id.concepto", "importe": 1}
		query = append(query, bson.M{"$project": project1})
	} else if config.TipoVista == CategoriaDiario {
		/******************************
		 * TipoVista = CategoriaDiario *
		 *******************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"fecha": "$fecha", "categoria": "$categoria"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "fecha": "$_id.fecha", "categoria": "$_id.categoria", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: pasamos la fecha a formato:
		//              'diaSemana': %w
		//              'fecha'    : %d/%m/%Y
		project2 := bson.M{"diaSemana": bson.M{"$dateToString": bson.M{"format": "%w", "date": "$fecha"}}, "fecha": bson.M{"$dateToString": bson.M{"format": "%d/%m/%Y", "date": "$fecha"}}, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project2})

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: pasamos el día de la semana de formato numérico a formato texto de 3 caracteres
		project3 := bson.M{"diaSemana": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "1"}}, "then": "Dom"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "2"}}, "then": "Lun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "4"}}, "then": "Mié"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "5"}}, "then": "Jue"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "6"}}, "then": "Vie"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "7"}}, "then": "Sab"}}, "default": "-"}}, "fecha": 1, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project3})

		// 3) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
		//
		// for i := 0; i < 7; i++ {
		//   projectDiaSemana := bson.M{"diaSemana": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$diaSemana", strconv.Itoa(i + 1)}}, "then": abreviaturasDiasSemana[i], "else": "$diaSemana"}}, "fecha": 1, "categoria": 1, "importe": 1}
		//   query = append(query, bson.M{"$project": projectDiaSemana})
		// }
		//--------------------------------------------------------------------------------------------------------------------------

		// 4) $project: concatenamos el día de la semana a la fecha
		project4 := bson.M{"fecha": bson.M{"$concat": []interface{}{"$diaSemana", " ", "$fecha"}}, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project4})
	} else if config.TipoVista == CategoriaMensual {
		/*******************************
		 * TipoVista = CategoriaMensual *
		 ********************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "mes": bson.M{"$month": "$fecha"}, "categoria": "$categoria"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "mes": "$_id.mes", "categoria": "$_id.categoria", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasan el año y el mes a string para poder posteriormente concatenarlos
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "mes": bson.M{"$substr": []interface{}{"$mes", 0, -1}}, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project2})

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $strLenCP sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, no podemos utilizar esta combinación de sentencias.
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: se obtiene la longitud del mes (número de caracteres) para, a la hora de concatenarlo con el año para
		//              construir la fecha, saber si hay que incluirle un cero por delante o no
		//
		// project3 := bson.M{"agno": 1, "mes": 1, "categoria": 1, "importe": 1, "lenMes": bson.M{"$strLenCP": "$mes"}}
		// query = append(query, bson.M{"$project": project3})

		// 4) $project: se construye la fecha concatenando el mes al año (MM/yyyy). En la concatenación se incluye un cero por
		//              delante del mes en el caso de que éste tenga un sólo dígito
		//
		// project4 := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$lt": []interface{}{"$lenMes", 2}}, "then": bson.M{"$concat": []interface{}{"0", "$mes", "/", "$agno"}}, "else": bson.M{"$concat": []interface{}{"$mes", "/", "$agno"}}}}, "categoria": 1, "importe": 1}
		// query = append(query, bson.M{"$project": project4})
		//--------------------------------------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: se obtienen los 3 primeros caracteres del mes para luego construir la fecha
		project3 := bson.M{"mes": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "1"}}, "then": "Ene"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "2"}}, "then": "Feb"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "4"}}, "then": "Abr"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "5"}}, "then": "May"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "6"}}, "then": "Jun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "7"}}, "then": "Jul"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "8"}}, "then": "Ago"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "9"}}, "then": "Sep"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "10"}}, "then": "Oct"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "11"}}, "then": "Nov"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "12"}}, "then": "Dic"}}, "default": "-"}}, "agno": 1, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project3})

		// 3) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
		//
		// for i := 0; i < 12; i++ {
		//   projectMes := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$mes", strconv.Itoa(i + 1)}}, "then": abreviaturasMeses[i], "else": "$mes"}}, "agno": 1, "categoria": 1, "importe": 1}
		//   query = append(query, bson.M{"$project": projectMes})
		// }
		//--------------------------------------------------------------------------------------------------------------------------

		// 4) $project: se construye la fecha concatenando el mes con el año
		project4 := bson.M{"mes": bson.M{"$concat": []interface{}{"$mes", " ", "$agno"}}, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project4})
	} else if config.TipoVista == CategoriaAnual {
		/*****************************
		 * TipoVista = CategoriaAnual *
		 ******************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "categoria": "$categoria"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "categoria": "$_id.categoria", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasa el año a string
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "categoria": 1, "importe": 1}
		query = append(query, bson.M{"$project": project2})
	} else if config.TipoVista == CategoriaTotal {
		/*****************************
		 * TipoVista = CategoriaTotal *
		 ******************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"categoria": "$categoria"}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "categoria": "$_id.categoria", "importe": 1}
		query = append(query, bson.M{"$project": project1})
	} else if config.TipoVista == TotalDiario {
		/**************************
		 * TipoVista = TotalDiario *
		 ***************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": "$fecha", "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: convertimos la fecha al formato que queremos dd/MM/yyyy y obtenemos el número del día de la semana
		project1 := bson.M{"_id": 0, "fecha": bson.M{"$dateToString": bson.M{"format": "%d/%m/%Y", "date": "$_id"}}, "diaSemana": bson.M{"$dateToString": bson.M{"format": "%w", "date": "$_id"}}, "importe": 1}
		query = append(query, bson.M{"$project": project1})

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
		//--------------------------------------------------------------------------------------------------------------------------
		// 2) $project: se convierte el número del día de la semana a texto de 3 caracteres
		project2 := bson.M{"fecha": 1, "diaSemana": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "1"}}, "then": "Dom"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "2"}}, "then": "Lun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "4"}}, "then": "Mié"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "5"}}, "then": "Jue"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "6"}}, "then": "Vie"}, bson.M{"case": bson.M{"$eq": []interface{}{"$diaSemana", "7"}}, "then": "Sab"}}, "default": "-"}}, "importe": 1}
		query = append(query, bson.M{"$project": project2})

		// 2) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
		//
		// for i := 0; i < 7; i++ {
		//   projectDiaSemana := bson.M{"fecha": 1, "diaSemana": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$diaSemana", strconv.Itoa(i + 1)}}, "then": abreviaturasDiasSemana[i], "else": "$diaSemana"}}, "importe": 1}
		//   query = append(query, bson.M{"$project": projectDiaSemana})
		// }
		//--------------------------------------------------------------------------------------------------------------------------

		// 3) $project: concatenamos el día de la semana con la fecha
		project3 := bson.M{"fecha": bson.M{"$concat": []interface{}{"$diaSemana", " ", "$fecha"}}, "importe": 1}
		query = append(query, bson.M{"$project": project3})
	} else if config.TipoVista == TotalMensual || config.TipoVista == GraficaCurvaMensual || config.TipoVista == GraficaBarrasMensual || config.TipoVista == GraficaCurvaPatrimonioMensual || config.TipoVista == GraficaBarrasPatrimonioMensual {
		/*****************************************************************************************************************************************
		 * TipoVista = TotalMensual | GraficaCurvaMensual | GraficaBarrasMensual | GraficaCurvaPatrimonioMensual | GraficaBarrasPatrimonioMensual *
		 ******************************************************************************************************************************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "mes": bson.M{"$month": "$fecha"}}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "mes": "$_id.mes", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasan el año y el mes a string para poder posteriormente concatenarlos
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "mes": bson.M{"$substr": []interface{}{"$mes", 0, -1}}, "importe": 1}
		query = append(query, bson.M{"$project": project2})

		//--------------------------------------------------------------------------------------------------------------------------
		// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
		// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
		//--------------------------------------------------------------------------------------------------------------------------
		// 3) $project: se obtienen los 3 primeros caracteres del mes para luego construir la fecha
		project3 := bson.M{"mes": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "1"}}, "then": "Ene"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "2"}}, "then": "Feb"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "4"}}, "then": "Abr"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "5"}}, "then": "May"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "6"}}, "then": "Jun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "7"}}, "then": "Jul"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "8"}}, "then": "Ago"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "9"}}, "then": "Sep"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "10"}}, "then": "Oct"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "11"}}, "then": "Nov"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "12"}}, "then": "Dic"}}, "default": "-"}}, "agno": 1, "importe": 1}
		query = append(query, bson.M{"$project": project3})

		// 3) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
		//
		// for i := 0; i < 12; i++ {
		//   projectMes := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$mes", strconv.Itoa(i + 1)}}, "then": abreviaturasMeses[i], "else": "$mes"}}, "agno": 1, "importe": 1}
		//   query = append(query, bson.M{"$project": projectMes})
		// }
		//--------------------------------------------------------------------------------------------------------------------------

		// 4) $project: se construye la fecha concatenando el mes al año
		project4 := bson.M{"mes": bson.M{"$concat": []interface{}{"$mes", " ", "$agno"}}, "importe": 1}
		query = append(query, bson.M{"$project": project4})
	} else if config.TipoVista == TotalAnual || config.TipoVista == GraficaCurvaAnual || config.TipoVista == GraficaBarrasAnual || config.TipoVista == GraficaCurvaPatrimonioAnual || config.TipoVista == GraficaBarrasPatrimonioAnual {
		/*******************************************************************************************************************************
		 * TipoVista = TotalAnual | GraficaCurvaAnual | GraficaBarrasAnual | GraficaCurvaPatrimonioAnual | GraficaBarrasPatrimonioAnual *
		 ********************************************************************************************************************************/

		// $group: criterios de agrupación
		group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}}, "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
		project1 := bson.M{"_id": 0, "agno": "$_id.agno", "importe": 1}
		query = append(query, bson.M{"$project": project1})

		// 2) $project: se pasan el año y el mes a string para poder posteriormente concatenarlos
		project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "importe": 1}
		query = append(query, bson.M{"$project": project2})
	} else if config.TipoVista == Total {
		/********************
		 * TipoVista = Total *
		 *********************/
		// $group: se suman todos los importes
		group := bson.M{"_id": "", "importe": bson.M{"$sum": "$importe"}}
		query = append(query, bson.M{"$group": group})

		// $project: se elimina el identificador (_id)
		project1 := bson.M{"_id": 0, "importe": 1}
		query = append(query, bson.M{"$project": project1})
	}

	err := c.Pipe(query).All(&agregacion)

	if err != nil {
		return agregacion, err
	} else {
		return agregacion, nil
	}
}

// Devuelve los movimientos entre las fechas indicadas agregados por meses
func getTotalesMensuales(fechaDesde time.Time, fechaHasta time.Time) ([]bson.M, error) {
	c := conexion.DB("fingonic").C("movimientos")

	totales := []bson.M{}
	query := []bson.M{}

	// $match: selección de movimientos entre el periodo de fechas indicado
	match := getFiltro([]Categoria{"*"}, true, true, fechaDesde, fechaHasta)
	query = append(query, bson.M{"$match": match})

	// $group: criterios de agrupación
	group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}, "mes": bson.M{"$month": "$fecha"}}, "importe": bson.M{"$sum": "$importe"}}
	query = append(query, bson.M{"$group": group})

	// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
	project1 := bson.M{"_id": 0, "agno": "$_id.agno", "mes": "$_id.mes", "importe": 1}
	query = append(query, bson.M{"$project": project1})

	// 2) $project: se pasan el año y el mes a string para poder posteriormente concatenarlos
	project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "mes": bson.M{"$substr": []interface{}{"$mes", 0, -1}}, "importe": 1}
	query = append(query, bson.M{"$project": project2})

	//--------------------------------------------------------------------------------------------------------------------------
	// El operador $strLenCP sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
	// todavía en la versión 3.2.13, no podemos utilizar esta combinación de sentencias.
	//--------------------------------------------------------------------------------------------------------------------------
	// 3) $project: se obtiene la longitud del mes (número de caracteres) para, a la hora de concatenarlo con el año para
	//              construir la fecha, saber si hay que incluirle un cero por delante o no
	//
	project3 := bson.M{"agno": 1, "mes": 1, "importe": 1, "lenMes": bson.M{"$strLenCP": "$mes"}}
	query = append(query, bson.M{"$project": project3})

	// 4) $project: se construye una fecha concatenando el año y el mes (yyyy/MM). En la concatenación se incluye un cero por
	//              delante del mes en el caso de que éste tenga un sólo dígito. Esta fecha servirá para posteriormente
	//              ordenar el array
	//
	project4 := bson.M{"fecha": bson.M{"$cond": bson.M{"if": bson.M{"$lt": []interface{}{"$lenMes", 2}}, "then": bson.M{"$concat": []interface{}{"$agno", "/", "0", "$mes"}}, "else": bson.M{"$concat": []interface{}{"$agno", "/", "$mes"}}}}, "agno": 1, "mes": 1, "importe": 1}
	query = append(query, bson.M{"$project": project4})
	//--------------------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------------------------------------------------
	// El operador $switch sólo es válido a partir de la versión 3.4.1 de MongoDB. Como el proveedor de producción (mLab) está
	// todavía en la versión 3.2.13, tenemos que sustituir este operador por $cond (if/then/else)
	//--------------------------------------------------------------------------------------------------------------------------
	// 5) $project: se obtienen los 3 primeros caracteres del mes para construir la fecha de visualización
	project5 := bson.M{"mes": bson.M{"$switch": bson.M{"branches": []bson.M{bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "1"}}, "then": "Ene"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "2"}}, "then": "Feb"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "3"}}, "then": "Mar"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "4"}}, "then": "Abr"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "5"}}, "then": "May"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "6"}}, "then": "Jun"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "7"}}, "then": "Jul"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "8"}}, "then": "Ago"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "9"}}, "then": "Sep"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "10"}}, "then": "Oct"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "11"}}, "then": "Nov"}, bson.M{"case": bson.M{"$eq": []interface{}{"$mes", "12"}}, "then": "Dic"}}, "default": "-"}}, "fecha": 1, "agno": 1, "importe": 1}
	query = append(query, bson.M{"$project": project5})

	// 5) Opción compatible con versiones de MongoDB anteriores a la 3.4.1
	//
	// for i := 0; i < 12; i++ {
	//   projectMes := bson.M{"mes": bson.M{"$cond": bson.M{"if": bson.M{"$eq": []string{"$mes", strconv.Itoa(i + 1)}}, "then": abreviaturasMeses[i], "else": "$mes"}}, "fecha": 1, "agno": 1, "importe": 1}
	//   query = append(query, bson.M{"$project": projectMes})
	// }
	//--------------------------------------------------------------------------------------------------------------------------

	// 6) $project: se construye la fecha de visualización concatenando el mes al año
	project6 := bson.M{"mes": bson.M{"$concat": []interface{}{"$mes", " ", "$agno"}}, "fecha": 1, "importe": 1}
	query = append(query, bson.M{"$project": project6})

	// 7) $sort: se ordenan los totales por fecha ascendente
	query = append(query, bson.M{"$sort": bson.M{"fecha": 1}})

	// 8) $project: se elimina el campo fecha utilizado para la ordenación
	project7 := bson.M{"mes": 1, "importe": 1}
	query = append(query, bson.M{"$project": project7})

	err := c.Pipe(query).All(&totales)

	if err != nil {
		return totales, err
	} else {
		return totales, nil
	}
}

// Devuelve los movimientos entre las fechas indicadas agregados por años
func getTotalesAnuales(fechaDesde time.Time, fechaHasta time.Time) ([]bson.M, error) {
	c := conexion.DB("fingonic").C("movimientos")

	totales := []bson.M{}
	query := []bson.M{}

	// $match: selección de movimientos entre el periodo de fechas indicado
	match := getFiltro([]Categoria{"*"}, true, true, fechaDesde, fechaHasta)
	query = append(query, bson.M{"$match": match})

	// $group: criterios de agrupación
	group := bson.M{"_id": bson.M{"agno": bson.M{"$year": "$fecha"}}, "importe": bson.M{"$sum": "$importe"}}
	query = append(query, bson.M{"$group": group})

	// 1) $project: se pasan al primer nivel del objeto JSON los campos utilizados para la agrupación
	project1 := bson.M{"_id": 0, "agno": "$_id.agno", "importe": 1}
	query = append(query, bson.M{"$project": project1})

	// 2) $project: se pasa el año a string
	project2 := bson.M{"agno": bson.M{"$substr": []interface{}{"$agno", 0, -1}}, "importe": 1}
	query = append(query, bson.M{"$project": project2})

	// 3) $sort: se ordenan los totales por año ascendente
	query = append(query, bson.M{"$sort": bson.M{"agno": 1}})

	err := c.Pipe(query).All(&totales)

	if err != nil {
		return totales, err
	} else {
		return totales, nil
	}
}

// Devuelve los activos registrados
func getActivos() ([]Activo, error) {
	c := conexion.DB("fingonic").C("activos")

	activos := []Activo{}
	err := c.Find(nil).All(&activos)

	if err != nil {
		return activos, err
	} else {
		return activos, nil
	}
}

// Comprueba si el activo ya existe
func existeActivo(codigo string) (bool, error) {
	c := conexion.DB("fingonic").C("activos")

	activo := Activo{}
	err := c.Find(bson.M{"codigo": codigo}).One(&activo)

	if err != nil {
		if err.Error() == "not found" {
			return false, nil
		} else {
			return false, err
		}
	} else {
		return true, nil
	}
}

// Crea un movimiento
func addActivo(activo *Activo) error {
	c := conexion.DB("fingonic").C("activos")

	err := c.Insert(activo)
	if err != nil {
		return err
	} else {
		return nil
	}
}

// Elimina el activo con el código indicado
func delActivo(codigo string) error {
	c := conexion.DB("fingonic").C("activos")

	err := c.Remove(bson.M{"codigo": codigo})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Modifica el activo
func modActivo(activo *Activo) error {
	c := conexion.DB("fingonic").C("activos")

	err := c.Update(bson.M{"_id": activo.Id}, bson.M{"codigo": activo.Codigo, "descripcion": activo.Descripcion, "ws_url": activo.WsUrl, "ws_path_precio": activo.WsPathPrecio, "precio_manual": activo.PrecioManual})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Devuelve todas las operaciones registradas
func getOperaciones() ([]Operacion, error) {
	c := conexion.DB("fingonic").C("operaciones")

	operaciones := []Operacion{}
	err := c.Find(nil).Sort("fecha").All(&operaciones)

	if err != nil {
		return operaciones, err
	} else {
		return operaciones, nil
	}
}

// Devuelve las operaciones registradas en el periodo indicado
func getOperacionesPeriodo(periodo Periodo) ([]Operacion, error) {
	c := conexion.DB("fingonic").C("operaciones")

	operaciones := []Operacion{}
	err := c.Find(bson.M{"fecha": bson.M{"$gte": periodo.FechaDesde, "$lte": periodo.FechaHasta}}).Sort("fecha").All(&operaciones)

	if err != nil {
		return operaciones, err
	} else {
		return operaciones, nil
	}
}

// Crea una operación
func addOperacion(operacion *Operacion) error {
	c := conexion.DB("fingonic").C("operaciones")

	err := c.Insert(operacion)
	if err != nil {
		return err
	} else {
		return nil
	}
}

// Modifica la operación
func modOperacion(operacion *Operacion) error {
	c := conexion.DB("fingonic").C("operaciones")

	err := c.Update(bson.M{"_id": operacion.Id}, bson.M{"fecha": operacion.Fecha, "activo": operacion.Activo, "tipo": operacion.Tipo, "titulos": operacion.Titulos, "importe": operacion.Importe, "comision": operacion.Comision})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Elimina la operación con el id indicado
func delOperacion(id string) error {
	c := conexion.DB("fingonic").C("operaciones")

	err := c.RemoveId(bson.ObjectIdHex(id))

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Comprueba si existe al menos una operación sobre el activo indicado
func existeOperacionActivo(codigo string) (bool, error) {
	c := conexion.DB("fingonic").C("operaciones")

	operacion := Operacion{}

	err := c.Find(bson.M{"activo": codigo}).One(&operacion)

	if err != nil {
		if err.Error() == "not found" {
			return false, nil
		} else {
			return false, err
		}
	} else {
		return true, nil
	}
}

// Actualiza el código del activo en todas las operaciones
func modActivoOperaciones(codigoOriginal string, codigo string) error {
	c := conexion.DB("fingonic").C("operaciones")

	_, err := c.UpdateAll(bson.M{"activo": codigoOriginal}, bson.M{"$set": bson.M{"activo": codigo}})

	if err != nil {
		return err
	} else {
		return nil
	}
}

// Devuelve los precios históricos registrados
func getPreciosHistoricos() (map[string]float64, error) {
	c := conexion.DB("fingonic").C("historico_precios")

	precios := []Precio{}
	err := c.Find(nil).All(&precios)

	if err != nil {
		return map[string]float64{}, err
	} else {
		return arrayPreciosToMap(precios), nil
	}
}
