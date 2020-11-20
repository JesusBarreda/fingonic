<div class="alert alert-danger text-center col-12" ng-show="ctrlTotalAnual.error != ''">
  {{ctrlTotalAnual.error}}
</div>

<div class="table-responsive">
  <table class="table table-hover table-striped">
    <thead>
      <tr>
        <th class="p-1 pl-2 bgGrisClaro colorAzul fontSize15" colspan="3">{{ctrlTotalAnual.nombreVista}}</th>
      </tr>
      <tr>
        <th class="text-center width150">Año</th>
        <th class="text-right pr-4">Importe</th>
        <th class="text-left width25"><i class="fa fa-eur fa-lg"></i></th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="m in ctrlTotalAnual.movimientos">
        <td class="text-center">{{m.agno}}</td>
        <td class="text-right pr-4" ng-class="{'colorRojo': ctrlTotalAnual.toNumber(m.importe) < 0, 'colorVerde': ctrlTotalAnual.toNumber(m.importe) > 0}">{{m.importe | number: 2}}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
</div>
