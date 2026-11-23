// 1. Captura del DOM
const pantalla = document.getElementById("pantalla");
const historial = document.getElementById("historial");

const operadores = ["+", "−", "×", "÷", "%"];

// 2. Funciones básicas de edición
function agregarValor(valor) {
  let actual = pantalla.value;
  const ultimoCaracter = actual.slice(-1);

  if (actual === "Error") {
    actual = "0";
  }

  // Evitar operadores duplicados consecutivos
  if (operadores.includes(valor)) {
    if (operadores.includes(ultimoCaracter)) {
      pantalla.value = actual.slice(0, -1) + valor;
      return;
    }
    if (ultimoCaracter === ".") {
      return;
    }
  }

  // Evitar puntos decimales duplicados en el mismo número
  if (valor === ".") {
    const partes = actual.split(/[\+\−\×\÷\%]/);
    const numeroActual = partes[partes.length - 1];
    if (numeroActual.includes(".")) {
      return;
    }
  }

  // Reemplazar "0" inicial
  if (actual === "0") {
    if (valor === "0" || valor === "00") {
      return;
    }
    if (valor === "." || operadores.includes(valor)) {
      pantalla.value = "0" + valor;
    } else {
      pantalla.value = valor;
    }
  } else {
    pantalla.value = actual + valor;
  }
}

function limpiarPantalla() {
  pantalla.value = "0";
  historial.textContent = "";
}

function borrarUltimo() {
  if (pantalla.value === "Error" || pantalla.value.length <= 1) {
    pantalla.value = "0";
  } else {
    pantalla.value = pantalla.value.slice(0, -1);
  }
}

function cambiarSigno() {
  if (pantalla.value === "0" || pantalla.value === "Error") return;

  if (pantalla.value.startsWith("-")) {
    pantalla.value = pantalla.value.slice(1);
  } else {
    pantalla.value = "-" + pantalla.value;
  }
}

// 3. Cálculos científicos con el objeto Math
function insertarPi() {
  const piFormateado = Math.PI.toFixed(6);
  const actual = pantalla.value;
  const ultimoCaracter = actual.slice(-1);

  if (actual === "0" || actual === "Error") {
    pantalla.value = piFormateado;
  } else if (operadores.includes(ultimoCaracter)) {
    pantalla.value += piFormateado;
  }
}

function calcularCientifica(operacion) {
  const numero = parseFloat(pantalla.value);

  if (isNaN(numero)) {
    pantalla.value = "Error";
    return;
  }

  let resultado;
  const radianes = (numero * Math.PI) / 180;

  switch (operacion) {
    case "sin":
      historial.textContent = `sin(${numero}°)`;
      resultado = Math.sin(radianes);
      break;

    case "cos":
      historial.textContent = `cos(${numero}°)`;
      resultado = Math.cos(radianes);
      break;

    case "tan":
      // Validar asíntotas (90°, 270°, etc.)
      if (Math.abs(numero % 180) === 90) {
        historial.textContent = `tan(${numero}°)`;
        pantalla.value = "Error";
        return;
      }
      historial.textContent = `tan(${numero}°)`;
      resultado = Math.tan(radianes);
      break;

    case "sqrt":
      if (numero < 0) {
        historial.textContent = `√(${numero})`;
        pantalla.value = "Error";
        return;
      }
      historial.textContent = `√(${numero})`;
      resultado = Math.sqrt(numero);
      break;

    case "pow2":
      historial.textContent = `(${numero})²`;
      resultado = Math.pow(numero, 2);
      break;

    case "log":
      if (numero <= 0) {
        historial.textContent = `log(${numero})`;
        pantalla.value = "Error";
        return;
      }
      historial.textContent = `log(${numero})`;
      resultado = Math.log10(numero);
      break;
  }

  // Redondeo limpio para evitar imprecisiones flotantes como sin(30°) = 0.49999999999999994
  resultado = Number(resultado.toFixed(10));
  pantalla.value = isFinite(resultado) ? resultado : "Error";
}

// 4. Evaluación segura (=)
function calcularResultado() {
  const expresionOriginal = pantalla.value;

  if (expresionOriginal === "Error") return;

  // Convertir símbolos visuales a operadores válidos en JS
  let expresionJS = expresionOriginal
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  // Evitar evaluar si termina en operador
  if (["+", "-", "*", "/", "%"].includes(expresionJS.slice(-1))) {
    return;
  }

  try {
    const resultado = Function('"use strict"; return (' + expresionJS + ')')();

    if (!isFinite(resultado) || isNaN(resultado)) {
      historial.textContent = expresionOriginal + " =";
      pantalla.value = "Error";
    } else {
      historial.textContent = expresionOriginal + " =";
      pantalla.value = Number(resultado.toFixed(10));
    }
  } catch (error) {
    pantalla.value = "Error";
  }
}