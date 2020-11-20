<div id="divFiltroDiario" class="card text-center mr-1">
  <div class="card-header p-1">Periodo</div>
  <div class="card-block p-1">
    <div class="mt-2">Fecha desde</div>
    <div class="mt-1">
      <input id="inputFechaDesde" type="text" class="text-center inputFecha" ng-model="ctrlFiltro.fechaDesde">
      <div id="fechaDesdeContainer"></div>
    </div>
    <div class="mt-3">Fecha hasta</div>
    <div class="mt-1">
      <input id="inputFechaHasta" type="text" class="text-center inputFecha" ng-model="ctrlFiltro.fechaHasta">
      <div id="fechaHastaContainer"></div>
    </div>
    <div class="mt-3 mb-2">
      <button class="btn btn-sm btn-success cursorPointer" ng-click="ctrlFiltro.aceptar()">Aceptar</button>
    </div>
  </div>
</div>

<script type="text/javascript">
  var options = {
    orientation: 'auto',
    language: 'es',
    autoclose: true,
    format: 'dd/mm/yyyy',
    daysOfWeekHighlighted: '0,6',
    todayHighlight: true
  };

  $('#fechaDesdeContainer').css('position', 'absolute');
  $('#fechaHastaContainer').css('position', 'absolute');

  var optionsFechaDesde = _.clone(options);
  optionsFechaDesde.container = '#fechaDesdeContainer';
  $('#inputFechaDesde').datepicker(optionsFechaDesde);

  var optionsFechaHasta = _.clone(options);
  optionsFechaHasta.container = '#fechaHastaContainer';
  $('#inputFechaHasta').datepicker(optionsFechaHasta);

  $(function() {
    updateView();
  });

  $(window).resize(function() {
    updateView();
  });
</script>