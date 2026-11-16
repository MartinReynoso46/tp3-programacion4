// Expresiones y ayudantes de validación compartidos por los formularios.

// Solo letras (con acentos y ñ), espacios, apóstrofes, puntos y guiones.
export const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;

// Letras, números y separadores (para marca / modelo: "Mercedes-Benz", "Volvo FH 16").
export const REGEX_ALFANUMERICO = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s'./-]+$/;

// Quita cualquier caracter que no sea una letra permitida.
export const soloLetras = (valor) => valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]/g, '');

// Quita cualquier caracter que no sea letra, número o separador.
export const soloAlfanumerico = (valor) => valor.replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s'./-]/g, '');

// Deja únicamente dígitos (para DNI, documento, etc.).
export const soloDigitos = (valor) => valor.replace(/\D/g, '');

// Deja únicamente números positivos o cero, sin signo negativo.
// Acepta coma o punto como separador decimal.
export const soloNumeroNoNegativo = (valor) => {
  const limpio = valor.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const [entero, ...decimales] = limpio.split('.');
  return decimales.length > 0 ? `${entero}.${decimales.join('')}` : entero;
};

// Bloquea las teclas que permiten escribir números negativos o notación científica.
export const bloquearNegativos = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
};
