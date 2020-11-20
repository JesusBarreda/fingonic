<div class="alert alert-danger text-center col-12" ng-show="ctrlDetalleDiario.error != ''">
  pp{{ctrlDetalleDiario.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="6">{{ctrlDetalleDiario.nombreVista}}</th>
      </tr>
      <tr>
        <th class="width50"></th>
        <th colspan="6" class="hidden-xl-up width150">Buscador</th>
        <th class="text-center hidden-lg-down width150">Fecha</th>
        <th class="hidden-lg-down">Categor&iacute;a</th>
        <th class="hidden-lg-down">Concepto</th>
        <th class="hidden-lg-down text-center">Importe</th>
        <th class="hidden-lg-down"></th>
      </tr>
      <tr>
        <th></th>
        <th colspan="5" class="hidden-xl-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlDetalleDiario.ESC($event)">
        </th>
        <th class="text-center hidden-lg-down">
          <input type="text" class="text-center width120" ng-model="criterio.fecha" ng-keyup="ctrlDetalleDiario.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width200" ng-model="criterio.categoria" ng-keyup="ctrlDetalleDiario.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width400" ng-model="criterio.concepto" ng-keyup="ctrlDetalleDiario.ESC($event)">
        </th>
        <th class="text-right hidden-lg-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlDetalleDiario.ESC($event)">
        </th>
        <th class="text-left hidden-lg-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlDetalleDiario.movimientos | filter: criterio)" ng-class="{'noBorder': m.fecha == movimientosFiltro[$index-1].fecha}">
        <td class="text-center">
          <i class="fa fa-pencil fa-lg cursorPointer" aria-hidden="true" ng-click="ctrlDetalleDiario.editar(m)" title="Modificar movimiento"></i>
        </td>
        <td class="text-center">
          <div ng-if="m.fecha != movimientosFiltro[$index-1].fecha">{{m.fecha}}</div>
        </td>
        <td class="cursorPointer" colspan="2" ng-mouseover="ctrlDetalleDiario.mostrarCategoria($index, $event)" ng-mousemove="ctrlDetalleDiario.mostrarCategoria($index, $event)" ng-mouseout="ctrlDetalleDiario.ocultarCategoria($index)">
          {{m.concepto}}
          <div id="divCategoria{{$index}}" class="alert alert-dismissible alert-info p-1 displayNone positionAbsolute">
            {{m.categoria}}
          </div>
        </td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlDetalleDiario.toNumber(m.importe) < 0, 'colorVerde': ctrlDetalleDiario.toNumber(m.importe) > 0}">
          {{m.importe | number: 2}}
        </td>
        <td class="text-left width25">
          <i class="fa fa-trash-o fa-lg cursorPointer" ng-click="ctrlDetalleDiario.eliminar(m.id)" title="Eliminar movimiento"></i>
        </td>    
      </tr>
    </tbody>
  </table>
</div>

<edicion-movimiento></edicion-movimiento>
