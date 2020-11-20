<div class="alert alert-danger text-center col-12" ng-show="ctrlCategoriaTotal.error != ''">
  {{ctrlCategoriaTotal.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="3">{{ctrlCategoriaTotal.nombreVista}}</th>
      </tr>
      <tr>
        <th colspan="3" class="hidden-sm-up width150">Buscador</th>
        <th class="hidden-xs-down">Categor&iacute;a</th>
        <th class="hidden-xs-down text-right pr-4">Importe</th>
        <th class="hidden-xs-down"></th>
      </tr>
      <tr>
        <th colspan="3" class="hidden-sm-up">
          <input type="text" class="width200" ng-model="criterio.$" ng-keyup="ctrlCategoriaTotal.ESC($event)">
        </th>
        <th class="hidden-xs-down">
          <input type="text" class="width200" ng-model="criterio.categoria" ng-keyup="ctrlCategoriaTotal.ESC($event)">
        </th>
        <th class="text-right hidden-xs-down">
          <input type="text" class="text-center width100" ng-model="criterio.importe" ng-keyup="ctrlCategoriaTotal.ESC($event)">
        </th>
        <th class="text-left hidden-xs-down width25">
          <i class="fa fa-eur fa-lg"></i>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in movimientosFiltro = (ctrlCategoriaTotal.movimientos | filter: criterio)">
        <td>{{m.categoria}}</td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlCategoriaTotal.toNumber(m.importe) < 0, 'colorVerde': ctrlCategoriaTotal.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td class="text-center width30"></td>
      </tr>
    </tbody>
  </table>
</div>
