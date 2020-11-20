<div class="jumbotron-fluid p-5 bgAzul">
  <div class="brand mx-auto text-center colorBlanco">
    Fin<font class="colorAzul">Go</font>nic
  </div>
  <form class="text-center">
    <div id="divUsername" class="mt-5">
      <input id="inputUsername" type="text" class="form-control mx-auto text-center width150" ng-model="ctrlLogin.user.name" placeholder="Login">
    </div>
    <div id="divPassword" class="mt-2">
      <input id="inputPassword" type="password" class="form-control mx-auto text-center width150" ng-model="ctrlLogin.user.password" placeholder="Password">
    </div>
    <div id="divLogin" class="text-center mt-3">
      <button id="buttonLogin" type="submit" class="btn btn-success width100 cursorPointer" ng-click="ctrlLogin.login()">Login</button>
    </div>
  </form>
</div>

<div id="divMsgLogin" class="container alert alert-{{ctrlLogin.msg.tipo}} text-center col-8 col-md-4 mx-auto mt-4" ng-show="ctrlLogin.msg.texto != ''">
  {{ctrlLogin.msg.texto}}
</div>