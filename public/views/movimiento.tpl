<div class="alert alert-danger text-center col-12 marginTop65" ng-show="ctrlMovimiento.error != ''">
  {{ctrlMovimiento.error}}
</div>

<form name="form" class="col-12 marginTop65" ng-show="ctrlMovimiento.error == ''">
  <div class="card">
    <div class="card-header p-2 fontBold fontSize15 colorAzul">{{ctrlMovimiento.nombreVista}}</div>
    <div class="card-block">
      <div id="divNuevoMovimientoFecha">
        <div class="fontGris fontSize15">Fecha</div>
        <div class="mt-1">
          <input id="inputFecha" type="text" class="text-center width100" ng-model="ctrlMovimiento.movimiento.fecha">
          <div id="fechaContainer"></div>
        </div>
      </div>
      <div id="divNuevoMovimientoCategoria">
        <div class="fontGris fontSize15">Categor&iacute;a</div>
        <div class="mt-1">
          <input id="inputCategoria" type="text" name="categoria" ng-model="ctrlMovimiento.movimiento.categoria" ng-change="ctrlMovimiento.mostrarBusquedaCategoria = true" ng-keyup="ctrlMovimiento.checkEsc($event)" required>
          <div class="list-group" ng-show="ctrlMovimiento.mostrarBusquedaCategoria">
            <a class="list-group-item cursorPointer p-2 fontSize13" ng-click="ctrlMovimiento.selCategoria(categoria)" ng-repeat="categoria in ctrlMovimiento.categorias | orderBy: categoria | filter: ctrlMovimiento.filtroBusquedaCategoria" ng-show="ctrlMovimiento.movimiento.categoria.length > 2">
              {{categoria}}
            </a>
          </div>
        </div>
      </div>
      <div id="divNuevoMovimientoConcepto">
        <div class="fontGris fontSize15">Concepto</div>
        <div class="mt-1">
          <input id="inputConcepto" type="text" name="concepto" ng-model="ctrlMovimiento.movimiento.concepto" ng-change="ctrlMovimiento.mostrarBusquedaConcepto = true" ng-keyup="ctrlMovimiento.checkEsc($event)" required>
          <div class="list-group" ng-show="ctrlMovimiento.mostrarBusquedaConcepto">
            <a class="list-group-item cursorPointer p-2 fontSize13" ng-click="ctrlMovimiento.selConcepto(concepto)" ng-repeat="concepto in ctrlMovimiento.conceptos | orderBy: concepto | filter: ctrlMovimiento.filtroBusquedaConcepto" ng-show="ctrlMovimiento.movimiento.concepto.length > 2">
              {{concepto}}
            </a>
          </div>
        </div>
      </div>
      <div id="divNuevoMovimientoImporte">
        <div class="fontGris fontSize15">Importe</div>
        <div class="mt-1"><input id="inputImporte" type="text" name="importe" class="text-right width100" ng-model="ctrlMovimiento.movimiento.importe" required>&nbsp;&euro;</div>
      </div>
      <div id="divNuevoMovimientoButtonAceptar">
        <button type="button" class="btn btn-sm btn-success cursorPointer" ng-click="ctrlMovimiento.aceptar()" ng-disabled="form.fecha.$error.required || form.categoria.$error.required || form.concepto.$error.required || form.importe.$error.required">Aceptar</button>
      </div>
    </div>
  </div>
</form>

<div class="alert alert-{{ctrlMovimiento.msg.tipo}} text-center col-12 mt-3 clearBoth" ng-show="ctrlMovimiento.msg.texto != ''">
  {{ctrlMovimiento.msg.texto}}
</div>

<script type="text/javascript">
  var options = {
    orientation: 'left',
    language: 'es',
    autoclose: true,
    format: 'dd/mm/yyyy',
    daysOfWeekHighlighted: '0,6',
    todayHighlight: true
  };

  $('#fechaContainer').css('position', 'absolute');
  options.container = '#fechaContainer';
  $('#inputFecha').datepicker(options);
</script>
