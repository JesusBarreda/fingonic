<div class="alert alert-danger text-center col-12" ng-show="ctrlGraficaBarras.error != ''">
  {{ctrlGraficaBarras.error}}
</div>

<div ng-show="ctrlGraficaBarras.error == ''">
  <canvas class="chart chart-bar" height="95%" chart-type="type" chart-data="data" chart-labels="labels" chart-series="series" chart-options="options" chart-dataset-override="datasetOverride" chart-colors="colors" chart-click="onClick"></canvas>
</div>
