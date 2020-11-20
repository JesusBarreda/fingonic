  <div class="alert alert-danger text-center col-12" ng-show="ctrlDetalleTotal.error != ''">
  {{ctrlDetalleTotal.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="4">{{ctrlDetalleTotal.nombreVista}}</th>
      </tr>
      <tr>
        <th colspan="4" class="hidden-lg-up width150">Buscador</th>
        <th class="hidden-md-down">Categor&iacute;a</th>
        <th class="hidden-md-down">Concepto</th>
        <th class="hidden-md-down text-center pl-5">Importe</th>
        <th class="hidden-md-down"></th>
      </tr>
      <tr>
        <th colspan="4" class="hidden-lg-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlDetalleTotal.ESC($event)">
        </th>
        <th class="hidden-md-down">
          <input type="text" class="width200" ng-model="criterio.categoria" ng-keyup="ctrlDetalleTotal.ESC($event)">
        </th>
        <th class="hidden-md-down">
          <input type="text" class="width400" ng-model="criterio.concepto" ng-keyup="ctrlDetalleTotal.ESC($event)">
        </th>
        <th class="text-right hidden-md-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlDetalleTotal.ESC($event)">
        </th>
        <th class="text-left hidden-md-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlDetalleTotal.movimientos | filter: criterio)">
        <td class="cursorPointer" colspan="2" ng-mouseover="ctrlDetalleTotal.mostrarCategoria($index, $event)" ng-mousemove="ctrlDetalleTotal.mostrarCategoria($index, $event)" ng-mouseout="ctrlDetalleTotal.ocultarCategoria($index)">
          {{m.concepto}}
          <div id="divCategoria{{$index}}" class="alert alert-dismissible alert-info p-1 displayNone positionAbsolute">
            {{m.categoria}}
          </div>
        </td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlDetalleTotal.toNumber(m.importe) < 0, 'colorVerde': ctrlDetalleTotal.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td class="text-center width30"></td>
      </tr>
    </tbody>
  </table>
</div>
