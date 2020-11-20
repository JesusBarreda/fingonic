<div class="alert alert-danger text-center col-12 mt-3" ng-show="ctrlInversionesActivo.error != ''">
  {{ctrlInversionesActivo.error}}
</div>

<form name="form" class="col-12 mt-3" ng-show="ctrlInversionesActivo.error == ''">
  <div class="card">
    <div class="card-header p-2 fontBold fontSize15 colorAzul">Nuevo activo</div>
    <div class="card-block">
      <div id="divNuevoActivoCodigo">
        <div class="fontGris fontSize15">C&oacute;digo</div>
        <div class="mt-1">
          <input type="text" name="codigo" class="text-center width100" ng-model="ctrlInversionesActivo.activo.codigo" required>
        </div>
      </div>
      <div id="divNuevoActivoDescripcion">
        <div class="fontGris fontSize15">Descripci&oacute;n</div>
        <div class="mt-1">
          <input type="text" name="descripcion" class="width200" ng-model="ctrlInversionesActivo.activo.descripcion" required>
        </div>
      </div>
      <div id="divNuevoActivoWsUrl">
        <div class="fontGris fontSize15">WS url</div>
        <div class="mt-1">
          <input type="text" ng-model="ctrlInversionesActivo.activo.ws_url">
        </div>
      </div>
      <div id="divNuevoActivoWsPathPrecio">
        <div class="fontGris fontSize15">WS path precio</div>
        <div class="mt-1"><input type="text" class="text-right width200" ng-model="ctrlInversionesActivo.activo.ws_path_precio"></div>
      </div>
      <div id="divNuevoActivoPrecioManual">
        <div class="fontGris fontSize15">Precio manual</div>
        <div class="mt-1"><input type="text" class="text-right width100" ng-model="ctrlInversionesActivo.activo.precio_manual">&nbsp;&euro;</div>
      </div>
      <div id="divNuevoActivoButtonAceptar">
        <button type="button" class="btn btn-sm btn-success cursorPointer" ng-click="ctrlInversionesActivo.aceptar()" ng-disabled="form.codigo.$error.required || form.descripcion.$error.required">Aceptar</button>
      </div>
    </div>
  </div>
</form>

<div class="alert alert-{{ctrlInversionesActivo.msg.tipo}} text-center col-12 mt-3 clearBoth" ng-show="ctrlInversionesActivo.msg.texto != ''">
  {{ctrlInversionesActivo.msg.texto}}
</div>
