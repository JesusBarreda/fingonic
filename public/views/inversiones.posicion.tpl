<div class="alert alert-danger text-center col-12 mt-3" ng-show="ctrlInversionesPosicion.error != ''">
  {{ctrlInversionesPosicion.error}}
</div>

<div class="container-fluid mt-3" ng-show="ctrlInversionesPosicion.error == ''">
  <div class="alert alert-info text-center col-10" ng-show="ctrlInversionesPosicion.posicion.activos == null">
    No hay registradas inversiones
  </div>
  <table class="table table-hover table-bordered table-responsive" ng-show="ctrlInversionesPosicion.posicion.activos != null">
    <thead>
      <tr class="bgVerdeClaro">
        <th class="text-center p-2 align-middle" colspan="2">Periodo an&aacute;lisis</th>
        <th class="text-center p-2 align-middle">Inversi&oacute;n</th>
        <th class="text-center p-2 align-middle">Valor posici&oacute;n</th>
        <th class="text-center p-2 align-middle">P&eacute;rdida / Ganancia</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="text-center p-2 align-middle width100" nowrap>{{ctrlInversionesPosicion.config.periodo_inversiones.fecha_desde | date: 'dd/MM/yyyy'}}</td>
        <td class="text-center p-2 align-middle width100" nowrap>{{ctrlInversionesPosicion.config.periodo_inversiones.fecha_hasta | date: 'dd/MM/yyyy'}}</td>
        <td class="text-center p-2 align-middle" ng-class="{'colorRojo': ctrlInversionesPosicion.posicion.global.inversion < 0, 'colorVerde': ctrlInversionesPosicion.posicion.global.inversion > 0, 'colorAzul': ctrlInversionesPosicion.posicion.global.inversion == 0}">{{ctrlInversionesPosicion.posicion.global.inversion | number: 2}}</td>
        <td class="text-center p-2 align-middle" ng-class="{'colorRojo': ctrlInversionesPosicion.posicion.global.valor_posicion < 0, 'colorVerde': ctrlInversionesPosicion.posicion.global.valor_posicion > 0, 'colorAzul': ctrlInversionesPosicion.posicion.global.valor_posicion == 0}">{{ctrlInversionesPosicion.posicion.global.valor_posicion | number: 2}}</td>
        <td class="text-center p-2 align-middle" ng-class="{'colorRojo': ctrlInversionesPosicion.posicion.global.perdida_ganancia < 0, 'colorVerde': ctrlInversionesPosicion.posicion.global.perdida_ganancia > 0, 'colorAzul': ctrlInversionesPosicion.posicion.global.perdida_ganancia == 0}">{{ctrlInversionesPosicion.posicion.global.perdida_ganancia | number: 2}}</td>
      </tr>
    </tbody>
  </table>
  <br>
  <table class="table table-hover table-striped table-bordered table-responsive" ng-show="(ctrlInversionesPosicion.posicion.activos != null) && (ctrlInversionesPosicion.posicion.activos.length > 0)">
    <thead>
      <tr class="bgVerdeClaro">
        <th class="text-center p-2 align-middle">Activo</th>
        <th class="p-2 align-middle">Descripci&oacute;n</th>
        <th class="text-center p-2 align-middle">Posici&oacute;n</th>
        <th class="text-center p-2 align-middle">Precio</th>
        <th class="text-center p-2 align-middle">Origen precio</th>
        <th class="text-center p-2 align-middle">Coste</th>
        <th class="text-center p-2 align-middle">Valor posici&oacute;n</th>
        <th class="text-center p-2 align-middle">P&eacute;rdida / Ganancia</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="p in (ctrlInversionesPosicion.posicion.activos | orderBy: 'descripcion')">
        <td class="text-center p-2 align-middle">{{p.activo}}</td>
        <td class="p-2 align-middle">{{p.descripcion}}</td>
        <td class="text-center p-2 align-middle">{{p.posicion | number}}</td>
        <td class="text-center p-2 align-middle">
        	<span ng-if="p.error_precio == ''">{{p.precio | number: 2}}</span>
        	<span ng-if="p.error_precio != ''" class="colorRojo">{{p.error_precio}}</span>
        </td>
        <td class="text-center p-2 align-middle" ng-class="{'online': p.origen_precio == 'ONLINE', 'manual': p.origen_precio == 'MANUAL'}">{{p.origen_precio}}</td>
        <td class="text-center p-2 align-middle">{{p.coste | number: 2}}</td>
        <td class="text-center p-2 align-middle">
          <span ng-if="p.error_precio == ''">{{p.valor_posicion | number: 2}}</span>
          <span ng-if="p.error_precio != ''">-</span>
        </td>
        <td class="text-center p-2 align-middle" ng-class="{'colorRojo': p.perdida_ganancia < 0, 'colorVerde': p.perdida_ganancia > 0, 'colorAzul': p.perdida_ganancia == 0}">
        	<span ng-if="p.error_precio ==''">{{p.perdida_ganancia | number: 2}}</span>
        	<span ng-if="p.error_precio != ''">-</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>