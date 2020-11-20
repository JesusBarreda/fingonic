<div class="alert alert-danger text-center col-12" ng-show="ctrlCategoriaAnual.error != ''">
  {{ctrlCategoriaAnual.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="4">{{ctrlCategoriaAnual.nombreVista}}</th>
      </tr>
      <tr>
        <th colspan="4" class="hidden-md-up width150">Buscador</th>      
        <th class="text-center hidden-sm-down width150">Año</th>
        <th class="hidden-sm-down">Categor&iacute;a</th>
        <th class="hidden-sm-down text-right pr-4">Importe</th>
        <th class="hidden-sm-down"></th>
      </tr>
      <tr>
        <th colspan="4" class="hidden-md-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlCategoriaAnual.ESC($event)">
        </th>
        <th class="text-center hidden-sm-down">
          <input type="text" class="text-center width120" ng-model="criterio.agno" ng-keyup="ctrlCategoriaAnual.ESC($event)">
        </th>
        <th class="hidden-sm-down">
          <input type="text" class="width300" ng-model="criterio.categoria" ng-keyup="ctrlCategoriaAnual.ESC($event)">
        </th>
        <th class="text-right hidden-sm-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlCategoriaAnual.ESC($event)">
        </th>
        <th class="text-left hidden-sm-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlCategoriaAnual.movimientos | filter: criterio)" ng-class="{'noBorder': m.agno == movimientosFiltro[$index-1].agno}">
        <td class="text-center">
          <div ng-if="m.agno != movimientosFiltro[$index-1].agno">{{m.agno}}</div>
        </td>
        <td>{{m.categoria}}</div>
        </td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlCategoriaAnual.toNumber(m.importe) < 0, 'colorVerde': ctrlCategoriaAnual.toNumber(m.importe) > 0}">
          {{m.importe | number: 2}}
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>
