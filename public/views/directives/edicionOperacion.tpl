<div id="divEdicionOperacion" class="displayNone">
  <form class="form">
    <div class="form-group">
      <label for="inputFecha">Fecha</label>
      <input id="inputFecha" type="text" class="form-control width110">
    </div>
    <div class="form-group">
      <label for="inputActivo">Activo</label>
      <select id="inputActivo" class="form-control width350" ng-model="void" ng-options="activo.codigo as activo.descripcion for activo in (activos | orderBy: 'descripcion') track by activo.codigo"></select>
    </div>
    <div class="form-group">
      <label for="inputOperacion">Operaci&oacute;n</label>
      <select id="inputTipo" class="form-control width150">
        <option value="COMPRA">COMPRA</option>
        <option value="VENTA">VENTA</option>
      </select>
    </div>
    <div class="form-group">
      <label for="inputTitulos">T&iacute;tulos</label>
      <input id="inputTitulos" type="text" class="form-control width150">
    </div>
    <div class="form-group">
      <label for="inputImporte">Importe&nbsp;&euro;</label>
      <input id="inputImporte" type="text" class="form-control width150">
    </div>
    <div class="form-group">
      <label for="inputComision">Comisi&oacute;n&nbsp;&euro;</label>
      <input id="inputComision" type="text" class="form-control width150">
    </div>
  </form>
</div>
