<nav class="navbar navbar-toggleable navbar-light fixed-top pl-3 pt-0 pb-0 bgAzul zIndexTop">
  <button class="navbar-toggler navbar-toggler-right mt-2" type="button" data-toggle="collapse" data-target="#divBarraNavegacion" aria-controls="divBarraNavegacion" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon cursorPointer"></span>
  </button>
  <span class="navbar-brand">
    <a href="#" class="navbar-brand fontSize26" title="Home"><font class="colorBlanco">Fin</font><font class="colorAzul">Go</font><font class="colorBlanco">nic</font></a>
  </span>

  <div id="divBarraNavegacion" class="navbar-collapse collapse justify-content-end">
    <ul class="navbar-nav">
      <li class="nav-item">
	      <button type="button" class="btn btn-success text-center px-4 width80 menuButton cursorPointer" ui-sref="home.movimiento">+</button>
	      <button type="button" class="btn btn-success btn-sm text-center width100 menuList cursorPointer" ui-sref="home.movimiento" data-toggle="collapse" data-target=".navbar-collapse">+</button>
      </li>
      <li class="nav-item">
        <button type="button" class="btn btn-warning text-center ml-2 px-3 width120 menuButton cursorPointer" ui-sref="home.inversiones.posicion">Inversiones</button>
        <button type="button" class="btn btn-warning btn-sm text-center mt-2 width100 menuList cursorPointer" ui-sref="home.inversiones.posicion" data-toggle="collapse" data-target=".navbar-collapse">Inversiones</button>
      </li>
      <li class="nav-item">
        <button type="button" class="btn btn-info text-center ml-2 px-3 width80 menuButton cursorPointer" ui-sref="home.config">Config</button>
	      <button type="button" class="btn btn-info btn-sm text-center mt-2 width100 menuList cursorPointer" ui-sref="home.config" data-toggle="collapse" data-target=".navbar-collapse">Config</button>
      </li>
      <li class="nav-item">
	      <button type="button" class="btn btn-danger text-center ml-2 px-3 width80 menuButton cursorPointer" ng-click="ctrlHome.logout()">Logout</button>
        <button type="button" class="btn btn-danger btn-sm text-center mt-2 mb-3 width100 menuList cursorPointer" ng-click="ctrlHome.logout()" data-toggle="collapse" data-target=".navbar-collapse">Logout</button>
      </li>
    </ul>		
  </div>
</nav>

<div ui-view></div>