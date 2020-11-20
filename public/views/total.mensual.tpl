<div class="alert alert-danger text-center col-12" ng-show="ctrlTotalMensual.error != ''">
  {{ctrlTotalMensual.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="3">{{ctrlTotalMensual.nombreVista}}</th>
      </tr>
      <tr>
        <th class="text-center width150">Mes</th>
        <th class="text-right pr-4">Importe</th>
        <th class="text-left width25"><i class="fa fa-eur fa-lg"></i></th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in ctrlTotalMensual.movimientos">
        <td class="text-center">{{m.mes}}</td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlTotalMensual.toNumber(m.importe) < 0, 'colorVerde': ctrlTotalMensual.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>
