<div class="alert alert-danger text-center col-12" ng-show="ctrlDetalleMensual.error != ''">
  {{ctrlDetalleMensual.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="5">{{ctrlDetalleMensual.nombreVista}}</th>
      </tr>
      <tr>
        <th colspan="5" class="hidden-xl-up width150">Buscador</th>      
        <th class="text-center hidden-lg-down width150">Mes</th>
        <th class="hidden-lg-down">Categor&iacute;a</th>
        <th class="hidden-lg-down">Concepto</th>
        <th class="hidden-lg-down text-center">Importe</th>
        <th class="hidden-lg-down"></th>
      </tr>
      <tr>
        <th colspan="5" class="hidden-xl-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlDetalleMensual.ESC($event)">
        </th>
        <th class="text-center hidden-lg-down">
          <input type="text" class="text-center width120" ng-model="criterio.mes" ng-keyup="ctrlDetalleMensual.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width200" ng-model="criterio.categoria" ng-keyup="ctrlDetalleMensual.ESC($event)">
        </th>
        <th class="hidden-lg-down">
          <input type="text" class="width400" ng-model="criterio.concepto" ng-keyup="ctrlDetalleMensual.ESC($event)">
        </th>
        <th class="text-right hidden-lg-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlDetalleMensual.ESC($event)">
        </th>
        <th class="text-left hidden-lg-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlDetalleMensual.movimientos | filter: criterio)" ng-class="{'noBorder': m.mes == movimientosFiltro[$index-1].mes}">
        <td class="text-center">
        	<div ng-if="m.mes != movimientosFiltro[$index-1].mes">
         	  {{m.mes}}
         	</div>
        </td>
        <td class="cursorPointer" colspan="2" ng-mouseover="ctrlDetalleMensual.mostrarCategoria($index, $event)" ng-mousemove="ctrlDetalleMensual.mostrarCategoria($index, $event)" ng-mouseout="ctrlDetalleMensual.ocultarCategoria($index)">
          {{m.concepto}}
          <div id="divCategoria{{$index}}" class="alert alert-dismissible alert-info p-1 displayNone positionAbsolute">
            {{m.categoria}}
          </div>
        </td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlDetalleMensual.toNumber(m.importe) < 0, 'colorVerde': ctrlDetalleMensual.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td class="text-center width30"></td>
      </tr>
    </tbody>
  </table>
</div>
