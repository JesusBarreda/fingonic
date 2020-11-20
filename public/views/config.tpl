<div class="alert alert-danger text-center col-12 marginTop65" ng-show="ctrlConfig.error != ''">
  {{ctrlConfig.error}}
</div>

<div class="col-12 marginTop65" ng-show="ctrlConfig.error == ''">
  <div class="card">
    <div class="card-header p-2 fontBold fontSize15 colorAzul">{{ctrlConfig.nombreVista}}</div>
    <div class="card-block">
      <div id="divConfigLiquidezInversiones" class="align-top">
        <div class="card">
          <div class="card-header p-2 bgAzulClaro fontBold fontGris">Liquidez</div>
          <div class="card-block p-3">
            <div>
              <span class="fontGris">Saldo</span>
              <span>
                <input id="inputSaldoLiquidez" type="text" class="text-center width100 marginLeft3" ng-model="ctrlConfig.config.liquidez.saldo" required>&nbsp;&nbsp;<i class="fa fa-eur fa-md"></i>
              </span>
            </div>
            <div class="mt-3">
              <span class="fontGris">Fecha</span>
              <span>
                <input id="inputFechaLiquidez" type="text" class="text-center width100" ng-model="ctrlConfig.config.liquidez.fecha">
                <div id="fechaLiquidezContainer"></div>
              </span>
            </div>
          </div>
        </div>
        <div class="card marginTop20">
          <div class="card-header p-2 bgAzulClaro fontBold fontGris">An&aacute;lisis inversiones</div>
          <div class="card-block p-3">
            <div>
              <span class="fontGris">Desde</span>
              <span>
                <input id="inputFechaDesdeInversiones" type="text" class="text-center width100" ng-model="ctrlConfig.config.periodo_inversiones.fecha_desde">
                <div id="fechaDesdeInversionesContainer"></div>
              </span>
            </div>
            <div class="mt-3">
              <span class="fontGris">Hasta</span>
              <span class="marginLeft3">
                <input id="inputFechaHastaInversiones" type="text" class="text-center width100" ng-model="ctrlConfig.config.periodo_inversiones.fecha_hasta">
                <div id="fechaHastaInversionesContainer"></div>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div id="divConfigCategorias" class="align-top">
        <div class="card">
          <div class="card-header p-2 bgAzulClaro fontBold fontGris">Categor&iacute;as</div>
          <div class="card-block p-3">
            <input type="checkbox" ng-model="ctrlConfig.todasCategoriasSel" ng-click="ctrlConfig.checkTodas()">&nbsp;<font class="bold">TODAS</font>
            <hr class="mt-2 mb-2">
            <div ng-repeat="categoria in ctrlConfig.categorias | orderBy: categoria">
              <i class="fa fa-pencil fa-md mr-1 cursorPointer" aria-hidden="true" ng-click="ctrlConfig.editar(categoria)" title="Editar categoría"></i>
              <input type="checkbox" ng-checked="ctrlConfig.categoriaSel(categoria)" ng-click="ctrlConfig.check(categoria)">&nbsp;{{categoria}}
            </div>
          </div>
        </div>
      </div>
      <div id="divConfigMovimientos" class="align-top">
        <div class="card">
          <div class="card-header p-2 bgAzulClaro fontBold fontGris">Movimientos</div>
          <div class="card-block p-3">
            <div><input type="checkbox" ng-model="ctrlConfig.config.ingresos">&nbsp;Ingresos</div>
            <div><input type="checkbox" ng-model="ctrlConfig.config.gastos">&nbsp;Gastos</div>
          </div>
        </div>
      </div>
      <div id="divConfigTipoVista" class="align-top">
        <div class="card">
          <div class="card-header p-2 bgAzulClaro fontBold fontGris">Tipo vista</div>
          <div class="card-block p-3">
            <select ng-model="ctrlConfig.config.tipo_vista" ng-options="tipoVista.codigo as tipoVista.descripcion for tipoVista in ctrlConfig.tiposVista"></select>
          </div>
        </div>
      </div>
      <div id="divConfigButtonModificar" class="align-top">
        <button type="button" class="btn btn-sm btn-success" ng-click="ctrlConfig.modificar()">Modificar</button>
      </div>
    </div>
  </div>
 </div>

<div class="alert alert-{{ctrlConfig.msg.tipo}} text-center clearBoth col-12 mt-3" ng-show="ctrlConfig.msg.texto != ''">
  {{ctrlConfig.msg.texto}}
</div>

<edicion-categoria></edicion-categoria>

<script type="text/javascript">
  var options = {
    orientation: 'left',
    language: 'es',
    autoclose: true,
    format: 'dd/mm/yyyy',
    daysOfWeekHighlighted: '0,6',
    todayHighlight: true
  };

  $('#fechaLiquidezContainer').css('position', 'absolute');
  $('#fechaDesdeInversionesContainer').css('position', 'absolute');
  $('#fechaHastaInversionesContainer').css('position', 'absolute');

  var optionsFechaLiquidez = _.clone(options);
  optionsFechaLiquidez.container = '#fechaLiquidezContainer';
  $('#inputFechaLiquidez').datepicker(optionsFechaLiquidez);

  var optionsFechaDesdeInversiones = _.clone(options);
  optionsFechaDesdeInversiones.container = '#fechaDesdeInversionesContainer';
  $('#inputFechaDesdeInversiones').datepicker(optionsFechaDesdeInversiones);

  var optionsFechaHastaInversiones = _.clone(options);
  optionsFechaHastaInversiones.container = '#fechaHastaInversionesContainer';
  $('#inputFechaHastaInversiones').datepicker(optionsFechaHastaInversiones);
</script>
