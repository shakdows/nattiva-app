# Créditos y origen de los activos

Este archivo deja constancia de dónde salió cada cosa que se publica en el
sitio. Sirve para dos fines: poder responder si alguien reclama, y saber qué
hay que reemplazar si una licencia cambia.

**Mantenerlo al día es parte del trabajo.** Cada vez que entre una imagen,
un logo o una fuente nueva, se anota aquí antes de publicarla.

---

## Código

| Qué | Origen | Licencia |
|---|---|---|
| Todo el código de `index.html`, `herramientas/`, `crm.html`, `sw.js` | Propio | Propietaria — ver `LICENSE` |
| `herramientas/explorador/sync_datos.py` | Propio | Propietaria — ver `LICENSE` |

---

## Tipografías

| Qué | Origen | Licencia |
|---|---|---|
| Fraunces | Google Fonts | SIL Open Font License 1.1 — uso comercial permitido, sin atribución obligatoria |
| Manrope | Google Fonts | SIL Open Font License 1.1 — uso comercial permitido, sin atribución obligatoria |

Sin pendientes.

---

## Mapas

| Qué | Origen | Licencia |
|---|---|---|
| Mapa de la ficha de proyecto | OpenStreetMap (iframe de `openstreetmap.org/export/embed.html`) | ODbL 1.0 |

La atribución «© Colaboradores de OpenStreetMap» la pinta el propio iframe y
**no debe ocultarse con CSS**: hacerlo incumple la licencia.

---

## Imágenes de arquitectura — `img/arquitectura/arq-01..24.webp`

> ⚠️ **PENDIENTE DE DOCUMENTAR.** Origen no confirmado.

Se usan como portada y galería de los 221 proyectos, con el sello «Imagen
referencial» visible en la ficha. Son imágenes de ejemplo, no fotografías de
los edificios reales.

Antes de seguir publicándolas hay que anotar aquí:

- [ ] Quién las creó y con qué herramienta
- [ ] Fecha
- [ ] Si vienen de un banco de imágenes: nombre, número de licencia y si la
      licencia cubre uso comercial y modificación
- [ ] Si se generaron con IA: qué herramienta, qué plan (los planes gratuitos
      de varias herramientas **no** permiten uso comercial) y guardar el
      recibo o captura de los términos vigentes al generarlas

**Riesgo si no se documenta:** están publicadas como portada de 221 fichas en
un sitio comercial. Es el material más visible del proyecto y el más fácil de
rastrear con una búsqueda inversa de imágenes.

Originales sin optimizar en `fotos nattiva departamentos/` (24 PNG).

`arq-01.webp` es una captura de la propia interfaz de Nattiva y no se usa.
`arq-02.webp` se retiró del banco de portadas: su render trae el cielo en
negro y como portada se veía como un hueco.

---

## Logotipos de desarrolladoras — `logos/` (54 archivos)

Marcas registradas de sus respectivos titulares. Nattiva no es titular de
ninguna.

Se muestran para identificar a cada desarrolladora aliada dentro del
portafolio. En la mayoría de jurisdicciones esto se ampara en el **uso
nominativo o referencial** de marca: usar la marca ajena para señalar de qué
empresa se habla, sin sugerir patrocinio ni asociación falsa.

Ese amparo se pierde si:

- la empresa **no** es aliada real de Nattiva;
- el logo se usa de forma que sugiera que la empresa avala o patrocina a
  Nattiva más allá de la relación que existe;
- la empresa pide que se retire.

Por eso:

- [ ] Tener por escrito (aunque sea un correo) la autorización de cada
      desarrolladora para mostrar su marca y sus precios
- [ ] Retirar de inmediato el logo de cualquiera que lo pida

Precedente: **Grupo T&C** pidió salir del carrusel de aliados y se retiró.

---

## Datos de proyectos y unidades

| Qué | Origen |
|---|---|
| `var DB=` dentro de `herramientas/explorador/index.html` | Hoja «base de datos de nattiva locker» en Google Drive |
| `herramientas/explorador/nattiva_data_limpia.csv` | Generado por `sync_datos.py` desde la misma hoja |
| `herramientas/explorador/datos-faltantes.csv` | Ídem |

Son datos que **cada desarrolladora entrega a Nattiva** para que los venda:
precios, cuotas, áreas, disponibilidad, banco y fecha de entrega de 14,743
unidades de 45 desarrolladoras.

Esto **no es un asunto de derecho de autor sino contractual**. La pregunta no
es si están protegidos por copyright, sino qué autorizó cada desarrolladora al
entregarlos.

- [ ] Confirmar con cada desarrolladora que el permiso cubre publicarlos en
      un sitio web accesible al público, y no solo usarlos internamente
- [ ] Mantener el repositorio en **privado**: en un repositorio público estos
      CSV son descargables por cualquiera

---

## Brochures

La ficha enlaza brochures en PDF alojados en Google Drive (`BROCHURES` y
`PROJFOLDERS` en `herramientas/explorador/index.html`).

Son material de cada desarrolladora. Se **enlazan**, no se copian ni se
rehospedan, que es la forma de menor riesgo. Mantenerlo así.

---

## Contenido generado automáticamente

La descripción de zona que abre cada ficha (`zonaDesc()`) se arma con datos de
la hoja y del propio portafolio: distrito, tipologías, áreas, entrega y
comparación del precio por m² contra la mediana del distrito.

No es texto copiado de ninguna parte ni redacción promocional: si un dato
falta, la frase no se escribe. Por eso todo lo que dice se puede sostener
frente a un cliente.
