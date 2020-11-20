package server

import (
  "net/http"
  "os"
)

var userValid User

func Init() {
  // Recuperamos variables de entorno
  port := os.Getenv("PORT")
	userValid.Name = os.Getenv("FINGONIC_NAME")
	userValid.Password = os.Getenv("FINGONIC_PASSWORD")

  // Configuramos el servidor estático de ficheros
  fileServer := http.FileServer(http.Dir("./public"))
	router.PathPrefix("/").Handler(fileServer)

  // Levantamos el servidor
  http.ListenAndServe(":" + port, router)
}
