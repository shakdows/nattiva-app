# Expediente para el registro de obra de software · INDECOPI

Paquete preparado para solicitar el **registro de programa de ordenador
(software)** ante la Dirección de Derecho de Autor (DDA) del INDECOPI, Perú.

> **Esto no es asesoría legal.** Los requisitos y las tasas los fija INDECOPI
> y cambian. Antes de presentar, confírmalos en
> <https://www.indecopi.gob.pe> o en la Mesa de Partes de la DDA. Lo que hay
> aquí es el contenido técnico ya redactado para que solo tengas que
> completar los datos personales y pagar la tasa.

---

## ⚠️ Antes que nada: la autoría

Tu historial de git tiene **116 commits**, de los cuales **60 figuran a
nombre de `Claude <noreply@anthropic.com>`** y 56 a nombre de
`shakdows <aramramirez1995@gmail.com>`.

Esto es un hecho público en tu repositorio y un abogado o un examinador lo va
a ver. Conviene que lo tengas claro antes de declarar la autoría:

- **Una IA no puede ser autora.** El derecho de autor protege creaciones de
  personas naturales. En el Perú, el Decreto Legislativo 822 define al autor
  como persona natural (art. 2).
- El código escrito con asistencia de IA, **bajo la dirección, las decisiones
  y las especificaciones de una persona**, se atribuye a esa persona. Tú
  definiste el producto, aportaste los datos, decidiste el diseño, revisaste
  y aprobaste cada cambio.
- Los commits dicen «Claude» porque así quedó configurado el entorno de
  trabajo, no porque la obra sea de otro. Los mensajes llevan
  `Co-Authored-By`, que en Git significa asistencia, no titularidad.

**Qué hacer:** declara la autoría a tu nombre y sé transparente si te
preguntan cómo se desarrolló. Ocultarlo es peor que explicarlo: si algún día
litigas y la contraparte saca el historial, un registro obtenido callando eso
se vuelve un problema. Conversa este punto con tu abogado antes de firmar la
declaración jurada.

---

## 1 · Datos de la solicitud

Completa lo que está entre corchetes.

| Campo | Valor |
|---|---|
| **Título de la obra** | NATTIVA — Plataforma de Inteligencia Inmobiliaria |
| **Tipo de obra** | Programa de ordenador (software) |
| **Autor** | Aram Ramírez |
| **Seudónimo / usuario** | shakdows |
| **Nacionalidad** | [Peruana] |
| **Documento de identidad** | [DNI N.° …] |
| **Domicilio** | [Dirección completa] |
| **Correo** | aramramirez1995@gmail.com |
| **Titular de los derechos patrimoniales** | Aram Ramírez — ver `LICENSE` |
| **Obra por encargo** | [Sí / No — según el contrato con NATTIVA] |
| **Fecha de creación** | 12 de mayo de 2026 |
| **Fecha de última modificación** | 20 de septiembre de 2026 |
| **Lugar de creación** | Lima, Perú |
| **¿Publicada?** | Sí |
| **Fecha de publicación** | [Fecha del primer despliegue en Vercel] |
| **Lugar de publicación** | Internet — https://nattiva-app-tau.vercel.app |
| **Obra originaria o derivada** | Originaria |

---

## 2 · Memoria descriptiva

*(Este es el texto que pide el formulario. Puedes pegarlo tal cual.)*

### 2.1. Objeto

NATTIVA es una aplicación web que centraliza, normaliza y presenta la oferta
de departamentos y oficinas en venta de proyectos inmobiliarios en Lima,
Perú, con el fin de que un asesor comercial pueda comparar proyectos y
cerrar una venta sin salir de la herramienta.

A la fecha de este expediente procesa **14,743 unidades de 221 proyectos de
45 desarrolladoras** en 20 distritos.

### 2.2. Problema que resuelve

Cada desarrolladora inmobiliaria entrega su lista de precios en un formato
distinto: numeración de unidades propia, nombres de proyecto inconsistentes,
fechas de entrega en formatos mezclados y campos incompletos. Comparar dos
proyectos exige un trabajo manual que se repite cada quincena.

La obra automatiza esa consolidación y la convierte en una interfaz de
consulta y venta.

### 2.3. Funcionalidades

1. **Consolidación de fuentes.** Fusiona dos hojas de cálculo con criterios
   de numeración distintos, resolviendo duplicados mediante un sistema de
   alias y de comparación por número base de unidad.
2. **Corrección de datos corrompidos.** Detecta y corrige campos de texto que
   la hoja de cálculo autoconvirtió a fecha —un defecto que afectaba al 68%
   de las fechas de entrega— y reconstruye el valor original.
3. **Portafolio navegable.** 221 proyectos con filtros combinables por
   distrito, desarrolladora, número de dormitorios, tipo de inmueble
   (departamento u oficina), fecha de entrega, vista, rango de precio y
   rango de área.
4. **Ficha de proyecto.** Galería de imágenes, indicadores del proyecto,
   descripción de zona generada automáticamente a partir de los datos,
   ubicación cartográfica y tabla de unidades disponibles.
5. **Análisis de posición de precio.** Calcula la mediana de precio por metro
   cuadrado de cada distrito y sitúa cada proyecto respecto de ella,
   identificando oportunidades por debajo de la mediana.
6. **Simulador de crédito hipotecario.** Calcula la cuota mensual estimada
   por sistema de cuota fija a partir del precio, la cuota inicial, la tasa
   efectiva anual y el plazo.
7. **Comparador de unidades.** Confronta hasta cuatro unidades lado a lado y
   resalta la mejor en cada criterio.
8. **Herramientas de venta.** Búsqueda dentro del listado de unidades,
   generación de mensajes de WhatsApp con la ficha de una unidad o de un
   proyecto, copiado al portapapeles y exportación de ficha a PDF.
9. **Aplicación web progresiva (PWA).** Instalable en móvil, con service
   worker propio para funcionamiento con conectividad intermitente.

### 2.4. Arquitectura

Aplicación de página única, sin framework ni dependencias de terceros en
tiempo de ejecución. El conjunto de datos viaja embebido en el propio
documento HTML como una estructura de arreglos indexados, lo que permite
filtrar 14,743 registros en el navegador sin servidor de consultas: el
portafolio completo se renderiza en 42 ms y la ficha del proyecto más grande
—590 unidades— se abre en 177 ms.

La sincronización con la fuente de datos es un proceso aparte, escrito en
Python, que se ejecuta fuera de línea y reescribe el documento.

### 2.5. Lenguajes y tecnologías

| Componente | Tecnología |
|---|---|
| Interfaz | HTML5, CSS3, JavaScript (ECMAScript 5, sin transpilación) |
| Sincronización de datos | Python 3 con openpyxl |
| Aplicación instalable | Manifiesto PWA y Service Worker propios |
| Cartografía | OpenStreetMap embebido (licencia ODbL) |
| Tipografía | Fraunces y Manrope (licencia SIL OFL 1.1) |
| Despliegue | Vercel, sitio estático |

Sin frameworks, sin librerías de terceros, sin dependencias npm.

### 2.6. Volumen de la obra

| Componente | Líneas |
|---|---|
| `herramientas/explorador/index.html` — aplicación principal | 2,958 |
| `index.html` — sitio de marca | 2,214 |
| `herramientas/explorador/styles/portfolio-premium.css` | 978 |
| `herramientas/explorador/sync_datos.py` | 652 |
| `crm.html` | 357 |
| Otros (documentación, manifiesto, service worker) | ~560 |

**133 archivos versionados**, con un historial de **116 revisiones**
registradas entre el 12 de mayo y el 20 de septiembre de 2026.

### 2.7. Elementos originales

Lo que distingue a esta obra de una aplicación de catálogo convencional:

1. **Algoritmo de fusión de fuentes heterogéneas** con tablas de alias por
   desarrolladora, por proyecto y por torre, y comparación por número base de
   unidad, que permite reconocer que `H-1103`, `1103` y `1105B` son la misma
   unidad en fuentes distintas.
2. **Detección y reconstrucción de fechas corrompidas** por autoconversión de
   la hoja de cálculo, con umbral de aviso configurable.
3. **Derivación determinista del factor de cuota** a partir de pares
   precio-cuota emparejados uno a uno, en vez de un valor codificado a mano
   (acierta en 2,142 de 2,142 casos verificados).
4. **Cálculo de posición de precio por distrito** con mediana, rango y
   detección automática de oportunidades.
5. **Generación de descripción de proyecto a partir de datos**, que redacta
   el párrafo de cada ficha sin texto promocional: si un dato falta, la frase
   no se escribe.
6. **Sistema de diseño propio** con una paleta y una tipografía definidas
   para la marca, aplicado como capa de presentación separable.

---

## 3 · Ejemplar de la obra

INDECOPI suele pedir el código fuente en soporte digital, o bien las primeras
y últimas páginas impresas. Este expediente incluye:

| Archivo | Contenido |
|---|---|
| `inventario-archivos.txt` | Los 133 archivos con tamaño, fecha de primera versión y hash SHA-256 |
| `codigo-fuente-muestra.txt` | Primeras y últimas 20 páginas del código, para la versión impresa |

Para el soporte digital, entrega el repositorio completo en un CD o USB.

---

## 4 · Pasos

1. **Confirma los requisitos vigentes** en la Mesa de Partes de la DDA o en
   indecopi.gob.pe. Pregunta expresamente por el registro de *programa de
   ordenador*, que tiene un formulario propio.
2. **Paga la tasa** y guarda el comprobante.
3. **Completa el formulario** con la tabla de la sección 1 y pega la memoria
   descriptiva de la sección 2.
4. **Adjunta el ejemplar** de la sección 3.
5. **Presenta** en Mesa de Partes o por la vía virtual.
6. **Guarda la resolución** junto a este expediente.

---

## 5 · Qué protege y qué no este registro

**Protege:** el código fuente como obra literaria. Si alguien lo copia,
tienes un documento oficial con fecha cierta que dice que era tuyo antes.

**No protege:**

- **La idea** de hacer un portafolio inmobiliario. Las ideas no se registran;
  cualquiera puede hacer algo parecido escribiendo su propio código.
- **El nombre «Nattiva».** Eso es marca, no derecho de autor, y va por un
  trámite distinto en la Dirección de Signos Distintivos de INDECOPI. **Es lo
  único de todo esto que tiene urgencia**: si otro registra el nombre antes,
  te obliga a ti a cambiarlo.
- **Los datos de las desarrolladoras.** Son de ellas, y su uso depende de lo
  que cada una te haya autorizado.
- **Las imágenes.** Fueron generadas con ChatGPT y su uso comercial está
  permitido, pero **no son registrables como obra**: falta autoría humana.
  Puedes usarlas; no puedes impedir que otro use unas idénticas. Ver
  `CREDITOS.md`.

---

## 6 · Anexo: evidencia técnica de autoría

Además del registro, tu historial de git es evidencia por sí mismo: 116
revisiones fechadas desde el 12 de mayo de 2026, cada una con su diferencia
exacta respecto de la anterior. Consérvalo — no lo reescribas ni lo borres.

El archivo `inventario-archivos.txt` fija el estado de la obra en la fecha de
este expediente mediante el hash SHA-256 de cada archivo: si mañana alguien
publica un archivo idéntico, el hash lo demuestra.

Commit de referencia: `8e9a05c68522b33bb982e29f82ef7c1189557b6e`
