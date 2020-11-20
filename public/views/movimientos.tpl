<div class="container-fluid">
  <div class="row marginTop65" ng-show="ctrlMovimientos.error != ''">
    <div class="alert alert-danger text-center col-12">
      {{ctrlMovimientos.error}}
    </div>
  </div>
  <div class="row marginTop65" ng-show="ctrlMovimientos.error == ''">
    <div id="divMovimientos" class="col-12 col-sm-8 col-md-9 col-lg-10">
      <div ui-view="movimientos"></div>
    </div>    
    <div id="divFiltroResumen" class="col-12 col-sm-4 col-md-3 col-lg-2 text-center">
      <div ui-view="filtro"></div>
      <div id="divResumen" class="card text-center mt-4 mr-1 zIndexBack">
        <div class="card-header p-1">Resumen &euro;</div>
        <div class="card-block p-1">
          <div ng-show="ctrlMovimientos.showIngresos" class="mt-2">
            <div class="colorVerde">Ingresos</div>
            <div class="mx-auto boxImporte borderVerde colorVerde">{{ctrlMovimientos.ingresos | number: 2}}</div>
          </div>
          <div ng-show="ctrlMovimientos.showGastos" class="mt-3">
            <div class="colorRojo">Gastos</div>
            <div class="mx-auto boxImporte borderRojo colorRojo">{{ctrlMovimientos.gastos | number: 2}}</div>
          </div>
          <div ng-show="ctrlMovimientos.showBalance" class="mt-3 mb-2">
            <div class="colorAzul">Balance</div>
            <div class="mx-auto boxImporte borderAzul colorAzul" ng-class="{'colorAzul': ctrlMovimientos.balance == 0, 'colorRojo': ctrlMovimientos.balance < 0, 'colorVerde': ctrlMovimientos.balance > 0}">{{ctrlMovimientos.balance | number: 2}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script type="text/javascript">
  function fixedFiltroResumen() {
    $("#divFiltroResumen").css({
      "margin-top" : ($(window).scrollTop()) + "px",
      "margin-left": ($(window).scrollLeft()) + "px"
    });
  }

  function updateView() {
    var viewportWidth = $(window).width();
    if (viewportWidth <= 576) {
      $('#divMovimientos').addClass('flex-last');
      $("#divMovimientos").addClass("mt-4");
      $('#divFiltroResumen').addClass('flex-first');
      $(window).off('scroll');
    } else {
      $('#divMovimientos').removeClass('flex-last');
      $("#divMovimientos").removeClass("mt-4");
      $('#divFiltroResumen').removeClass('flex-first');
      $(window).on('scroll', fixedFiltroResumen);
    }
  }
</script>
