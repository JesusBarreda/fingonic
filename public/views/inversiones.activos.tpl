<div class="alert alert-danger text-center col-12 mt-3" ng-show="ctrlInversionesActivos.error != ''">
  {{ctrlInversionesActivos.error}}
</div>

<div class="container-fluid mt-3" ng-show="ctrlInversionesActivos.error == ''">
  <table class="table table-hover table-striped table-bordered table-responsive">
    <thead>
      <tr class="bgVerdeClaro">
      	<th class="text-center p-2 align-middle">
          <button type="button" class="btn btn-success btn-sm text-center cursorPointer" ui-sref="home.inversiones.activo">+</button>
        </th>
        <th class="text-center p-2 align-middle">Código</th>
        <th class="p-2 align-middle">Descripción</th>
        <th class="p-2 align-middle">WS url</th>
        <th class="text-center p-2 align-middle">WS path precio</th>
        <th class="text-center p-2 align-middle">Precio manual</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="a in ctrlInversionesActivos.activos">
      	<td class="text-center p-2 align-middle">
          <i class="fa fa-pencil fa-lg cursorPointer" aria-hidden="true" ng-click="ctrlInversionesActivos.editar(a)" title="Modificar activo"></i>
      	</td>
        <td class="text-center p-2 align-middle">{{a.codigo}}</td>
        <td class="p-2 align-middle">{{a.descripcion}}</td>
        <td class="p-2 align-middle">{{a.ws_url}}</td>
        <td class="text-center p-2 align-middle">{{a.ws_path_precio}}</td>
        <td class="text-center p-2 align-middle">
          <span ng-if="a.precio_manual != 0.0">{{a.precio_manual | number: 2}}</span>
        </td>
        <td class="text-center p-2 align-middle">
          <i class="fa fa-trash-o fa-lg cursorPointer" ng-click="ctrlInversionesActivos.eliminar(a.codigo)" title="Eliminar activo"></i>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<div class="alert alert-{{ctrlInversionesActivos.msg.tipo}} text-center col-12 mt-3 clearBoth" ng-show="ctrlInversionesActivos.msg.texto != ''">
  {{ctrlInversionesActivos.msg.texto}}
</div>

<edicion-activo></edicion-activo>