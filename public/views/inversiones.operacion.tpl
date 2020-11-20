<div class="alert alert-danger text-center col-12 mt-3" ng-show="ctrlInversionesOperacion.error != ''">
  {{ctrlInversionesOperacion.error}}
</div>

<form name="form" class="col-12 mt-3" ng-show="ctrlInversionesOperacion.error == ''">
  <div class="card">
    <div class="card-header p-2 fontBold fontSize15 colorAzul">Nueva operaci&oacute;n</div>
    <div class="card-block">
      <div id="divNuevaOperacionFecha">
        <div class="fontGris fontSize15">Fecha</div>
        <div class="mt-1">
          <input id="inputFecha" type="text" class="text-center width100" name="fecha" ng-model="ctrlInversionesOperacion.operacion.fecha" required>
          <div id="fechaContainer"></div>
        </div>
      </div>
      <div id="divNuevaOperacionActivo">
        <div class="fontGris fontSize15">Activo</div>
        <div class="mt-1">
          <select name="activo" ng-model="ctrlInversionesOperacion.operacion.activo" ng-options="activo.codigo as activo.descripcion for activo in (ctrlInversionesOperacion.activos | orderBy: 'descripcion')" required></select>
        </div>
      </div>
      <div id="divNuevaOperacionTipo">
        <div class="fontGris fontSize15">Operaci&oacute;n</div>
        <div class="mt-1">
          <select name="tipo" ng-model="ctrlInversionesOperacion.operacion.tipo" required>
            <option value="COMPRA">COMPRA</option>
            <option value="VENTA">VENTA</option>
          </select>
        </div>
      </div>
      <div id="divNuevaOperacionTitulos">
        <div class="fontGris fontSize15">T&iacute;tulos</div>
        <div class="mt-1">
          <input type="text" class="text-right width150" name="titulos" ng-model="ctrlInversionesOperacion.operacion.titulos" required>
        </div>
      </div>
      <div id="divNuevaOperacionImporte">
        <div class="fontGris fontSize15">Importe</div>
        <div class="mt-1"><input type="text" class="text-right width150" name="importe" ng-model="ctrlInversionesOperacion.operacion.importe" required>&nbsp;&euro;</div>
      </div>
      <div id="divNuevaOperacionComision">
        <div class="fontGris fontSize15">Comisi&oacute;n</div>
        <div class="mt-1"><input type="text" class="text-right width100" name="comision" ng-model="ctrlInversionesOperacion.operacion.comision" required>&nbsp;&euro;</div>
      </div>
      <div id="divNuevaOperacionButtonAceptar">
        <button type="button" class="btn btn-sm btn-success cursorPointer" ng-click="ctrlInversionesOperacion.aceptar()" ng-disabled="form.fecha.$error.required || form.activo.$error.required || form.tipo.$error.required || form.titulos.$error.required || form.importe.$error.required || form.comision.$error.required">Aceptar</button>
      </div>
    </div>
  </div>
</form>

<div class="alert alert-{{ctrlInversionesOperacion.msg.tipo}} text-center col-12 mt-3 clearBoth" ng-show="ctrlInversionesOperacion.msg.texto != ''">
  {{ctrlInversionesOperacion.msg.texto}}
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