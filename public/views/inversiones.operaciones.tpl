<div class="alert alert-danger text-center col-12 mt-3" ng-show="ctrlInversionesOperaciones.error != ''">
  {{ctrlInversionesOperaciones.error}}
</div>

<div class="container-fluid mt-3 mx-1" ng-show="ctrlInversionesOperaciones.error == ''">
  <div class="col-12 fixed-top marginTop130 zIndexMiddle">
    <div class="card mx-3">
      <div class="card-block p-3">
        <div id="divOperacionesFechaDesde">
          <div>Fecha desde</div>
          <div class="mt-1">
            <input id="inputFechaDesde" type="text" class="text-center width110" ng-model="ctrlInversionesOperaciones.fechaDesde">
            <div id="fechaDesdeContainer"></div>
          </div>
        </div>
        <div id="divOperacionesFechaHasta">
          <div>Fecha hasta</div>
          <div class="mt-1">
            <input id="inputFechaHasta" type="text" class="text-center width110" ng-model="ctrlInversionesOperaciones.fechaHasta">
            <div id="fechaHastaContainer"></div>
          </div>
        </div>
        <div id="divOperacionesActivo">
          <div>Activo</div>
          <div class="mt-1">
            <select name="activo" ng-model="ctrlInversionesOperaciones.activo" ng-options="activo.codigo as activo.descripcion for activo in (ctrlInversionesOperaciones.activos | orderBy: 'descripcion')">
              <option value="" selected hidden></option>
            </select>
          </div>
        </div>
        <div id="divOperacionesButtonAceptar">
          <button class="btn btn-sm btn-success cursorPointer" ng-click="ctrlInversionesOperaciones.filtrar()">Aceptar</button>
        </div>
      </div>
    </div>
    <div class="mt-0 height20 bgWhite"></div>
  </div>
  <div id="divTableOperaciones" class="col-12">
    <table class="table table-hover table-striped table-bordered table-responsive">
      <thead>
        <tr class="bgVerdeClaro">
          <th class="text-center p-2">
            <button type="button" class="btn btn-success btn-sm text-center cursorPointer" ui-sref="home.inversiones.operacion">+</button>
          </th>
          <th class="text-center p-2 align-middle">Fecha</th>
          <th class="text-center p-2 align-middle">Activo</th>
          <th class="p-2 align-middle">Descripci&oacute;n</th>
          <th class="text-center p-2 align-middle">Operaci&oacute;n</th>
          <th class="text-center p-2 align-middle">T&iacute;tulos</th>
          <th class="text-center p-2 align-middle">Precio</th>
          <th class="text-center p-2 align-middle">Importe</th>
          <th class="text-center p-2 align-middle">Comisi&oacute;n</th>
          <th class="text-center p-2 align-middle">Coste</th>
          <th class="text-center p-2 align-middle">Reembolso</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="o in (ctrlInversionesOperaciones.operacionesFiltro | orderBy: '-fecha')">
          <td class="text-center p-2 align-middle">
            <i class="fa fa-pencil fa-lg cursorPointer" aria-hidden="true" ng-click="ctrlInversionesOperaciones.editar(o)" title="Modificar operación"></i>
          </td>
          <td class="text-center p-2 align-middle">{{o.fecha | date: 'dd/MM/yyyy'}}</td>
          <td class="text-center p-2 align-middle">{{o.activo}}</td>
          <td class="p-2 align-middle">{{o.descripcion}}</td>
          <td class="text-center p-2 align-middle" ng-class="{'compra': o.tipo == 'COMPRA', 'venta': o.tipo == 'VENTA'}">{{o.tipo}}</td>
          <td class="text-center p-2 align-middle">{{o.titulos | number}}</td>
          <td class="text-center p-2 align-middle">{{o.importe/o.titulos | number: 2}}</td>
          <td class="text-center p-2 align-middle">{{o.importe | number: 2}}</td>
          <td class="text-center p-2 align-middle">{{o.comision | number: 2}}</td>
          <td class="text-center p-2 align-middle">
            <span ng-show="o.tipo == 'COMPRA'">{{o.importe+o.comision | number: 2}}</span>
          </td>
          <td class="text-center p-2 align-middle">
            <span ng-show="o.tipo == 'VENTA'">{{o.importe-o.comision | number: 2}}</span>
          </td>
          <td class="text-center p-2 align-middle">
            <i class="fa fa-trash-o fa-lg cursorPointer" ng-click="ctrlInversionesOperaciones.eliminar(o.id)" title="Eliminar operación"></i>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<edicion-operacion activos="ctrlInversionesOperaciones.activos"></edicion-operacion>

<script type="text/javascript">
  var options = {
    orientation: 'left',
    language: 'es',
    autoclose: true,
    format: 'dd/mm/yyyy',
    daysOfWeekHighlighted: '0,6',
    todayHighlight: true
  };

  $('#fechaDesdeContainer').css('position', 'absolute');
  $('#fechaHastaContainer').css('position', 'absolute');

  var optionsFechaDesde = _.clone(options);
  optionsFechaDesde.container = '#fechaDesdeContainer';
  $('#inputFechaDesde').datepicker(optionsFechaDesde);

  var optionsFechaHasta = _.clone(options);
  optionsFechaHasta.container = '#fechaHastaContainer';
  $('#inputFechaHasta').datepicker(optionsFechaHasta);
</script>