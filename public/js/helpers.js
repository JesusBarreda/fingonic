var diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];

var meses = {
  'Ene': '01',
  'Feb': '02',
  'Mar': '03',
  'Abr': '04',
  'May': '05',
  'Jun': '06',
  'Jul': '07',
  'Ago': '08',
  'Sep': '09',
  'Oct': '10',
  'Nov': '11',
  'Dic': '12'
};

function arraysIguales(array1, array2) {
	return array1.length == array2.length && array1.every(function(v, i) { return ($.inArray(v, array2) != -1) });
}

// Convierte un Date al formato string: yyyy-MM-dd
function dateToISO(fecha) {
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1;
  var agno = fecha.getFullYear();

  if(dia < 10) {
    dia = '0' + dia;
  }

  if(mes < 10) {
    mes = '0' + mes;
  }

  return agno + '-' + mes + '-' + dia;
}

// Convierte un Date al formato string: dd[sep]MM[sep]yyyy
function dateToDateString(fecha, sep) {
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1;
  var agno = fecha.getFullYear();

  if(dia < 10) {
    dia = '0' + dia;
  }

  if(mes < 10) {
    mes = '0' + mes;
  }

  return dia + sep + mes + sep + agno;
}

// Convierte un Date al formato string: DDD dd/MM/yyyy
function dateToDateStringWithWeekDay(fecha) {
  var diaSemana = diasSemana[fecha.getDay()];
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1;
  var agno = fecha.getFullYear();

  if(dia < 10) {
    dia = '0' + dia;
  }

  if(mes < 10) {
    mes = '0' + mes;
  }

  return diaSemana + ' ' + dia + '/' + mes + '/' + agno;
}

// Convierte una fecha con formato string dd/MM/yyyy a un Date
function dateStringToDate(fecha) {
  return new Date(fecha.substring(6, 10) + '-' + fecha.substring(3, 5) + '-' + fecha.substring(0, 2));
}

function formatImporte(importe) {
  var x = importe.toFixed(2);
  var y = x.replace(".", ",");
  var z = y.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

  return z;
}

function getAgnos(movimientos) {
  return _.pluck(movimientos, 'agno');
}

function getImportes(movimientos) {
  return _.map(_.pluck(movimientos, 'importe'), function(importe) { return importe.toFixed(2); });
}

function getMeses(movimientos) {
  return _.pluck(movimientos, 'mes');
}

function getSaldos(estructura) {
  return _.map(_.pluck(estructura, 'saldo'), function(saldo) { return saldo.toFixed(2); });
}

function getValoracion(estructura) {
  return _.map(_.pluck(estructura, 'valoracion'), function(valoracion) { return valoracion.toFixed(2); });
}

function getVistaMovimientos(tipoVista) {
	var vistaMovimientos = 'home.';

	switch(tipoVista) {
    case 'DD':
      vistaMovimientos += 'movimientos.detalleDiario';
      break;
    case 'DM':
      vistaMovimientos += 'movimientos.detalleMensual';
      break;
    case 'DA':
      vistaMovimientos += 'movimientos.detalleAnual';
      break;
    case 'DT':
      vistaMovimientos += 'movimientos.detalleTotal';
      break;
    case 'CD':
      vistaMovimientos += 'movimientos.categoriaDiario';
      break;
    case 'CM':
      vistaMovimientos += 'movimientos.categoriaMensual';
      break;
    case 'CA':
      vistaMovimientos += 'movimientos.categoriaAnual';
      break;
    case 'CT':
      vistaMovimientos += 'movimientos.categoriaTotal';
      break;
    case 'TD':
      vistaMovimientos += 'movimientos.totalDiario';
      break;
    case 'TM':
      vistaMovimientos += 'movimientos.totalMensual';
      break;
    case 'TA':
      vistaMovimientos += 'movimientos.totalAnual';
      break;
    case 'GCM':
      vistaMovimientos += 'grafica.curvaMensual';
      break;
    case 'GCA':
      vistaMovimientos += 'grafica.curvaAnual';
      break;
    case 'GBM':
      vistaMovimientos += 'grafica.barrasMensual';
      break;
    case 'GBA':
      vistaMovimientos += 'grafica.barrasAnual';
      break;
    case 'GCPM':
      vistaMovimientos += 'grafica.curvaPatrimonioMensual';
      break;
    case 'GCPA':
      vistaMovimientos += 'grafica.curvaPatrimonioAnual';
      break;
    case 'GBPM':
      vistaMovimientos += 'grafica.barrasPatrimonioMensual';
      break;
    case 'GBPA':
      vistaMovimientos += 'grafica.barrasPatrimonioAnual';
      break;
  }

  return vistaMovimientos;
}

function isNumber(txt) {
  var num = new Number(txt);

  if('' + num == 'NaN') {
    return false;
  } else {
    return true;
  }
}

function numDiasMes(month, year) {
  return new Date(year || new Date().getFullYear(), month, 0).getDate();
}

function obtenerBalance(movimientos) {
  var ingresos = 0;
  var gastos = 0;

  for(var i = 0; i < movimientos.length; i++) {
    if(movimientos[i].importe > 0) {
      ingresos += movimientos[i].importe;
    } else if(movimientos[i].importe < 0) {
      gastos += movimientos[i].importe;
    }
  }

  return {
    "ingresos": ingresos,
    "gastos": gastos,
    "balance": ingresos + gastos
  };
}

function sortMovimientosByAgno(movimientos, ascendente) {
  return movimientos.sort(function(m1, m2) {
    var agno1 = parseInt(m1.agno);
    var agno2 = parseInt(m2.agno);

    if(ascendente) {
      return agno1 - agno2;
    } else {
      return agno2 - agno1;
    }
  });
}

function sortMovimientosByAgnoCategoria(movimientos) {
  return movimientos.sort(function(m1, m2) {
    if(m1.agno != m2.agno) {
      return parseInt(m2.agno) - parseInt(m1.agno);
    } else if(m1.categoria < m2.categoria) {
      return -1;      
    } else if(m1.categoria == m2.categoria) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByAgnoConcepto(movimientos) {
  return movimientos.sort(function(m1, m2) {
    if(m1.agno != m2.agno) {
      return parseInt(m2.agno) - parseInt(m1.agno);
    } else if(m1.concepto < m2.concepto) {
      return -1;      
    } else if(m1.concepto == m2.concepto) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByCategoria(movimientos) {
  return movimientos.sort(function(m1, m2) {
    if(m1.categoria < m2.categoria) {
      return -1;      
    } else if(m1.categoria == m2.categoria) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByConcepto(movimientos) {
  return movimientos.sort(function(m1, m2) {
    if(m1.concepto < m2.concepto) {
      return -1;      
    } else if(m1.concepto == m2.concepto) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByFecha(movimientos) {
  return movimientos.sort(function(m1, m2) {
    var fecha1 = m1.fecha.split(' ')[1];
    var fecha2 = m2.fecha.split(' ')[1];

    fecha1 = parseInt(fecha1.substring(6, 10) + fecha1.substring(3, 5) + fecha1.substring(0, 2));
    fecha2 = parseInt(fecha2.substring(6, 10) + fecha2.substring(3, 5) + fecha2.substring(0, 2));

    return fecha2 - fecha1;
  });
}

function sortMovimientosByFechaCategoria(movimientos) {
  return movimientos.sort(function(m1, m2) {
    var fecha1 = m1.fecha.split(' ')[1];
    var fecha2 = m2.fecha.split(' ')[1];

    fecha1 = parseInt(fecha1.substring(6, 10) + fecha1.substring(3, 5) + fecha1.substring(0, 2));
    fecha2 = parseInt(fecha2.substring(6, 10) + fecha2.substring(3, 5) + fecha2.substring(0, 2));

    if(fecha1 != fecha2) {
      return fecha2 - fecha1;
    } else if(m1.categoria < m2.categoria) {
      return -1;
    } else if(m1.categoria == m2.categoria) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByFechaConcepto(movimientos) {
  return movimientos.sort(function(m1, m2) {
    var fecha1 = m1.fecha.split(' ')[1];
    var fecha2 = m2.fecha.split(' ')[1];

    fecha1 = parseInt(fecha1.substring(6, 10) + fecha1.substring(3, 5) + fecha1.substring(0, 2));
    fecha2 = parseInt(fecha2.substring(6, 10) + fecha2.substring(3, 5) + fecha2.substring(0, 2));

    if(fecha1 != fecha2) {
      return fecha2 - fecha1;
    } else if(m1.concepto < m2.concepto) {
      return -1;
    } else if(m1.concepto == m2.concepto) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByMes(movimientos, ascendente) {
  return movimientos.sort(function(m1, m2) {
    var splitMes1 = m1.mes.split(' ');
    var splitMes2 = m2.mes.split(' ');

    var mesFecha1 = meses[splitMes1[0]];
    var agnoFecha1 = splitMes1[1];
    var mesFecha2 = meses[splitMes2[0]];
    var agnoFecha2 = splitMes2[1];

    fecha1 = parseInt(agnoFecha1 + mesFecha1);
    fecha2 = parseInt(agnoFecha2 + mesFecha2);

    if(ascendente) {
      return fecha1 - fecha2;
    } else {
      return fecha2 - fecha1;
    }
  });
}

function sortMovimientosByMesCategoria(movimientos) {
  return movimientos.sort(function(m1, m2) {
    var splitMes1 = m1.mes.split(' ');
    var splitMes2 = m2.mes.split(' ');

    var mesFecha1 = meses[splitMes1[0]];
    var agnoFecha1 = splitMes1[1];
    var mesFecha2 = meses[splitMes2[0]];
    var agnoFecha2 = splitMes2[1];

    fecha1 = parseInt(agnoFecha1 + mesFecha1);
    fecha2 = parseInt(agnoFecha2 + mesFecha2);

    if(fecha1 != fecha2) {
      return fecha2 - fecha1;
    } else if(m1.categoria < m2.categoria) {
      return -1;
    } else if(m1.categoria == m2.categoria) {
      return 0;
    } else {
      return 1;
    }
  });
}

function sortMovimientosByMesConcepto(movimientos) {
  return movimientos.sort(function(m1, m2) {
    var splitMes1 = m1.mes.split(' ');
    var splitMes2 = m2.mes.split(' ');

    var mesFecha1 = meses[splitMes1[0]];
    var agnoFecha1 = splitMes1[1];
    var mesFecha2 = meses[splitMes2[0]];
    var agnoFecha2 = splitMes2[1];

    fecha1 = parseInt(agnoFecha1 + mesFecha1);
    fecha2 = parseInt(agnoFecha2 + mesFecha2);

    if(fecha1 != fecha2) {
      return fecha2 - fecha1;
    } else if(m1.concepto < m2.concepto) {
      return -1;
    } else if(m1.concepto == m2.concepto) {
      return 0;
    } else {
      return 1;
    }
  });
}

function toNumber(txt) {
  return parseFloat(txt);
}

// arrayObjects debe ser un Array de Objetos con campo 'fecha'
function getMaxFecha(arrayObjects) {
  var maxFecha = '';
  for(var i = 0; i < arrayObjects.length; i++) {
    var fecha = new Date(arrayObjects[i].fecha);
    if(maxFecha == '' || maxFecha < fecha) {
      maxFecha = fecha;
    }
  }

  return maxFecha;
}

function getInterseccionPorCampo(campo, array1, array2) {
  var indiceInicial = -1;
  var valorCampo = array1[0][campo];
  for(var i = 0; i < array2.length; i++) {
    if(array2[i][campo] == valorCampo) {
      indiceInicial = i;
      break;
    }
  }

  var indiceFinal = -1;
  valorCampo = array1[array1.length - 1][campo];
  for(var i = array2.length - 1; i >= 0; i--) {
    if(array2[i][campo] == valorCampo) {
      indiceFinal = i;
      break;
    }
  }

  if(indiceInicial != -1 && indiceFinal != -1) {
    return array2.slice(indiceInicial, indiceFinal + 1);
  } else {
    return [];
  }
}
