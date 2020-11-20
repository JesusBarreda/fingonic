<div id="divFiltroAnual" class="card text-center mr-1">
  <div class="card-header p-1">Periodo</div>
  <div class="card-block p-1">
    <div class="mt-2">Año desde</div>
    <div class="mt-1">
      <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoDesde" required>
    </div>
    <div class="mt-3">Año hasta</div>
    <div class="mt-1">
      <input type="text" class="text-center width50" ng-model="ctrlFiltro.agnoHasta" required>
    </div>
    <div class="mt-3 mb-2">
      <button class="btn btn-sm btn-success cursorPointer" ng-click="ctrlFiltro.aceptar()">Aceptar</button>
    </div>
  </div>
</div>

<script type="text/javascript">
  $(function() {
    updateView();
  });

  $(window).resize(function() {
    updateView();
  });
</script>
