# Cómo actualizar los datos del Explorador

Los datos viven dentro de `index.html` (en el bloque `var DB=`), no se leen de
un archivo aparte. Para actualizarlos se corre un script que los reconstruye
desde la hoja de Google Drive.

## La hoja

**"base de datos de nattiva locker"** — `1s0RBSd4A8r2ck-KuLkLABuXx2ZrgpYahBEP9IQxdwng`

| Pestaña | Rol |
|---|---|
| `Cotizador Nattiva_Online_Tabla` | **Hoja 1, la principal.** Manda siempre. |
| `performance` | **Hoja 2.** Solo aporta lo que no exista en la hoja 1. |

La hoja 2 nunca pisa un dato de la hoja 1. Sus precios son *precio lista* (sin
descuento) y numera las unidades con otro criterio, así que tomarla como
fuente de verdad daría precios equivocados.

## Los pasos

1. En Drive: **Archivo → Descargar → Microsoft Excel (.xlsx)**
2. En la carpeta de este archivo:

   ```bash
   pip install openpyxl        # solo la primera vez
   python3 sync_datos.py ~/Descargas/base_de_datos_de_nattiva_locker.xlsx
   ```

3. **Lee el reporte.** Al final salen los AVISOS: son los proyectos donde la
   hoja 2 quiere agregar muchas unidades respecto a lo que la hoja 1 tiene, o
   donde un nombre nuevo se parece a uno que ya existe. Casi siempre significa
   que las dos hojas numeran distinto y habría que agregar un alias (ver abajo)
   en vez de dejar que entren como unidades nuevas.

4. Si todo cuadra:

   ```bash
   git add -A && git commit -m "Explorador: datos al <fecha>" && git push
   ```

   Vercel publica solo. Toma un par de minutos.

## Cuando aparece un aviso

Las dos hojas escriben algunos nombres distinto. Sin un alias, el mismo
edificio entra dos veces y las unidades se duplican. Los alias están arriba de
todo en `sync_datos.py`, son diccionarios normales:

- `ALIAS_DEV` — la desarrolladora se llama distinto (`VyV` ↔ `V&V`).
- `ALIAS_PROYECTO` — el proyecto se llama distinto (`Santa Catalina` ↔
  `TORRE SANTA CATALINA`).
- `ALIAS_PROYECTO_POR_TORRE` — un proyecto de la hoja 2 son en realidad dos de
  la hoja 1, separados por la columna `TORRE` (`Villaran` → `VILLARÁN 1` y
  `VILLARÁN 2`).
- `NOMBRE_CANONICO` — el nombre definitivo, venga de la hoja que venga.

Para emparejar unidades el script ignora la torre en el número: `H-1103`,
`1103` y `1105B` se comparan por su número base. Eso resuelve la mayoría de los
casos sin tocar nada.

## Un detalle de la hoja

La celda del proyecto **28 DE JULIO 0360** está autoformateada como fecha:
Google la exporta como `28 DE julio 0360` en CSV y `28 DE July 0360` en XLSX.
Está cubierta por `NOMBRE_CANONICO`, pero conviene arreglarla en la hoja
(seleccionar la celda → Formato → Número → Texto sin formato) para que no siga
cambiando sola.

## Qué reescribe el script

- `index.html` — el bloque `var DB=`, el conteo de proyectos por desarrolladora
  en las fichas de aliados, y las dos cifras escritas a mano en el texto.
- `nattiva_data_limpia.csv` — la data plana, con una columna `ORIGEN` que dice
  si cada fila vino de la hoja 1 o de la hoja 2.
