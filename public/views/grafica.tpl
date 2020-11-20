<div class="alert alert-danger text-center col-12 marginTop65" ng-show="ctrlGrafica.error != ''">
  {{ctrlGrafica.error}}
</div>

<div class="container-fluid marginTop65" ng-show="ctrlGrafica.error == ''">
  <div class="row">
    <div class="col-md-12">
      <div ui-view="filtro"></div>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <div ui-view="grafica"></div>
    </div>
  </div>
</div>
