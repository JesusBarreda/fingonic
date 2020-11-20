package server

import (
	"encoding/json"
	"time"

	"github.com/globalsign/mgo/bson"
)

type TipoVista string
type Categoria string
type TipoOperacion string

const (
	DetalleDiario  TipoVista = "DD"
	DetalleMensual TipoVista = "DM"
	DetalleAnual   TipoVista = "DA"
	DetalleTotal   TipoVista = "DT"

	CategoriaDiario  TipoVista = "CD"
	CategoriaMensual TipoVista = "CM"
	CategoriaAnual   TipoVista = "CA"
	CategoriaTotal   TipoVista = "CT"

	TotalDiario  TipoVista = "TD"
	TotalMensual TipoVista = "TM"
	TotalAnual   TipoVista = "TA"
	Total        TipoVista = "T"

	GraficaCurvaMensual TipoVista = "GCM"
	GraficaCurvaAnual   TipoVista = "GCA"

	GraficaBarrasMensual TipoVista = "GBM"
	GraficaBarrasAnual   TipoVista = "GBA"

	GraficaCurvaPatrimonioMensual TipoVista = "GCPM"
	GraficaCurvaPatrimonioAnual   TipoVista = "GCPA"

	GraficaBarrasPatrimonioMensual TipoVista = "GBPM"
	GraficaBarrasPatrimonioAnual   TipoVista = "GBPA"

	Compra TipoOperacion = "COMPRA"
	Venta  TipoOperacion = "VENTA"
)

type User struct {
	Name     string `json:"name" bson:"name"`
	Password string `json:"password" bson:"password"`
	Token    string `json:"token,omitempty" bson:"token,omitempty"`
}

type Liquidez struct {
	Saldo float64   `json:"saldo" bson:"saldo"`
	Fecha time.Time `json:"fecha" bson:"fecha"`
}

type Periodo struct {
	FechaDesde time.Time `json:"fecha_desde" bson:"fecha_desde"`
	FechaHasta time.Time `json:"fecha_hasta" bson:"fecha_hasta"`
}

type Configuracion struct {
	Liquidez           Liquidez    `json:"liquidez" bson:"liquidez"`
	PeriodoInversiones Periodo     `json:"periodo_inversiones" bson:"periodo_inversiones"`
	TipoVista          TipoVista   `json:"tipo_vista" bson:"tipo_vista"`
	Categorias         []Categoria `json:"categorias" bson:"categorias"`
	Ingresos           bool        `json:"ingresos" bson:"ingresos"`
	Gastos             bool        `json:"gastos" bson:"gastos"`
}

type CambioCategoria struct {
	CategoriaAntigua string `json:"categoria_antigua" bson:"categoria_antigua"`
	CategoriaNueva   string `json:"categoria_nueva" bson:"categoria_nueva"`
}

type Movimiento struct {
	Id        bson.ObjectId `json:"id,omitempty" bson:"_id,omitempty"`
	Fecha     time.Time     `json:"fecha" bson:"fecha"`
	Categoria Categoria     `json:"categoria" bson:"categoria"`
	Concepto  string        `json:"concepto" bson:"concepto"`
	Importe   float64       `json:"importe" bson:"importe"`
}

type Activo struct {
	Id             bson.ObjectId `json:"id,omitempty" bson:"_id,omitempty"`
	Codigo         string        `json:"codigo" bson:"codigo"`
	CodigoOriginal string        `json:"codigo_original" bson:"codigo_original"`
	Descripcion    string        `json:"descripcion" bson:"descripcion"`
	WsUrl          string        `json:"ws_url" bson:"ws_url"`
	WsPathPrecio   string        `json:"ws_path_precio" bson:"ws_path_precio"`
	PrecioManual   float64       `json:"precio_manual" bson:"precio_manual"`
}

type Operacion struct {
	Id          bson.ObjectId `json:"id,omitempty" bson:"_id,omitempty"`
	Fecha       time.Time     `json:"fecha" bson:"fecha"`
	Activo      string        `json:"activo" bson:"activo"`
	Descripcion string        `json:"descripcion,omitempty" bson:"descripcion,omitempty"`
	Tipo        TipoOperacion `json:"tipo" bson:"tipo"`
	Titulos     float64       `json:"titulos" bson:"titulos"`
	Importe     float64       `json:"importe" bson:"importe"`
	Comision    float64       `json:"comision" bson:"comision"`
}

type PosicionActivo struct {
	Activo          string  `json:"activo" bson:"activo"`
	Descripcion     string  `json:"descripcion" bson:"descripcion"`
	Posicion        float64 `json:"posicion" bson:"posicion"`
	Precio          float64 `json:"precio" bson:"precio"`
	OrigenPrecio    string  `json:"origen_precio" bson:"origen_precio"`
	ErrorPrecio     string  `json:"error_precio" bson:"error_precio"`
	Coste           float64 `json:"coste" bson:"coste"`
	ValorPosicion   float64 `json:"valor_posicion" bson:"valor_posicion"`
	PerdidaGanancia float64 `json:"perdida_ganancia" bson:"perdida_ganancia"`
}

type PosicionGlobal struct {
	Inversion       float64 `json:"inversion" bson:"inversion"`
	ValorPosicion   float64 `json:"valor_posicion" bson:"valor_posicion"`
	PerdidaGanancia float64 `json:"perdida_ganancia" bson:"perdida_ganancia"`
}

type Posicion struct {
	Activos []PosicionActivo `json:"activos" bson:"activos"`
	Global  PosicionGlobal   `json:"global" bson:"global"`
}

type Msg struct {
	Error string      `json:"error" bson:"error"`
	Data  interface{} `json:"data" bson:"data"`
}

type Precio struct {
	Id     bson.ObjectId `json:"id,omitempty" bson:"_id,omitempty"`
	Activo string        `json:"activo" bson:"activo"`
	Fecha  string        `json:"fecha" bson:"fecha"`
	Precio float64       `json:"precio" bson:"precio"`
}

// Sobrescribe el método MarshalJSON del tipo Movimiento para que la fecha se genere
// en el formato deseado en el objeto JSON
func (m *Movimiento) MarshalJSON() ([]byte, error) {
	type AliasMov Movimiento

	return json.Marshal(&struct {
		Fecha string `json:"fecha"`
		*AliasMov
	}{
		Fecha:    traducirDiaSemana(m.Fecha.Format("Mon 02/01/2006")),
		AliasMov: (*AliasMov)(m),
	})
}

// FIFO ventas
type CompraActivo struct {
	Posicion float64
	Precio   float64
}

type FifoVentasActivo []*CompraActivo

func (fifo *FifoVentasActivo) Push(c *CompraActivo) {
	*fifo = append(*fifo, c)
}

func (fifo *FifoVentasActivo) Pop() (c *CompraActivo) {
	c = (*fifo)[0]
	*fifo = (*fifo)[1:]
	return
}

func (fifo *FifoVentasActivo) Head() (c *CompraActivo) {
	c = (*fifo)[0]
	return
}

func (fifo *FifoVentasActivo) Len() int {
	return len(*fifo)
}
