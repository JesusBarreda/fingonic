<div class="card mb-4">
  <div class="card-header p-2">{{ctrlFiltro.nombreVista}}</div>
  <div class="card-block p-2">
    <div id="divGraficaFechaDesde" class="card">
      <div class="card-header p-2 bgAzulClaro">Año desde</div>
      <div class="card-block p-2">
        <div>
          <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoDesde" required>
        </div>
      </div>
    </div>
    <div id="divGraficaFechaHasta" class="card">
      <div class="card-header p-2 bgAzulClaro">Año hasta</div>
      <div class="card-block p-2">
        <div>
          <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoHasta" required>
        </div>
      </div>
    </div>
    <div id="divGraficaButtonAceptar">
      <button class="btn btn-sm btn-success" ng-click="ctrlFiltro.aceptar()">Aceptar</button>
    </div>
  </div>
</div>
