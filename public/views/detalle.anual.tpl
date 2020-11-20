<div class="alert alert-danger text-center col-12" ng-show="ctrlDetalleAnual.error != ''">
  {{ctrlDetalleAnual.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="5">{{ctrlDetalleAnual.nombreVista}}</th>
      </tr>
      <tr>
        <th colspan="5" class="hidden-xl-up width150">Buscador</th>      
        <th class="text-center hidden-lg-down width150">Año</th>
        <th class="hidden-lg-down">Categor&iacute;a</th>
        <th class="hidden-lg-down">Concepto</th>
        <th class="hidden-lg-down text-center">Importe</th>
        <th class="hidden-lg-down"></th>
      </tr>
      <tr>
        <th colspan="5" class="hidden-xl-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlDetalleAnual.ESC($event)">
        </th>
        <th class="text-center hidden-lg-down">
          <input type="text" class="text-center width120" ng-model="criterio.agno" ng-keyup="ctrlDetalleAnual.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width200" ng-model="criterio.categoria" ng-keyup="ctrlDetalleAnual.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width400" ng-model="criterio.concepto" ng-keyup="ctrlDetalleAnual.ESC($event)">
        </th>
        <th class="text-right hidden-lg-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlDetalleAnual.ESC($event)">
        </th>
        <th class="text-left hidden-lg-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlDetalleAnual.movimientos | filter: criterio)" ng-class="{'noBorder': m.agno == movimientosFiltro[$index-1].agno}">
        <td class="text-center">
          <div ng-if="m.agno != movimientosFiltro[$index-1].agno">
            {{m.agno}}
          </div>
        </td>
        <td class="cursorPointer" colspan="2" ng-mouseover="ctrlDetalleAnual.mostrarCategoria($index, $event)" ng-mousemove="ctrlDetalleAnual.mostrarCategoria($index, $event)" ng-mouseout="ctrlDetalleAnual.ocultarCategoria($index)">
          {{m.concepto}}
          <div id="divCategoria{{$index}}" class="alert alert-dismissible alert-info p-1 displayNone positionAbsolute">
            {{m.categoria}}
          </div>
        </td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlDetalleAnual.toNumber(m.importe) < 0, 'colorVerde': ctrlDetalleAnual.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td class="text-center width30"></td>
      </tr>
    </tbody>
  </table>
</div>
