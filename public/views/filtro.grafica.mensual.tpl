<div class="card mb-4">
  <div class="card-header p-2">{{ctrlFiltro.nombreVista}}</div>
  <div class="card-block p-2">
    <div id="divGraficaFechaDesde" class="card">
      <div class="card-header p-2 bgAzulClaro">Mes desde</div>
      <div class="card-block p-2">
        <div>
          <select class="text-center" ng-model="ctrlFiltro.mesDesde" ng-options="mes.texto for mes in ctrlFiltro.meses" required>
          </select>
          <span class="mx-3">/</span>
          <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoDesde" required>
        </div>
      </div>
    </div>
    <div id="divGraficaFechaHasta" class="card">
      <div class="card-header p-2 bgAzulClaro">Mes hasta</div>
      <div class="card-block p-2">
        <div>
          <select class="text-center" ng-model="ctrlFiltro.mesHasta" ng-options="mes.texto for mes in ctrlFiltro.meses" required>
          </select>
          <span class="mx-3">/</span>
          <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoHasta" required>
        </div>
      </div>
    </div>
    <div id="divGraficaButtonAceptar">
      <button class="btn btn-sm btn-success" ng-click="ctrlFiltro.aceptar()">Aceptar</button>
    </div>
  </div>
</div>
