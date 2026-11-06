# Valopedia

Wiki de VALORANT hecha por fans, en español e inglés, con agentes, habilidades, mapas y armas. Los datos se actualizan solos después de cada parche, sin editar nada a mano.

**Sitio:** https://nahuelbenitezs.github.io/valopedia/

## Cómo se mantiene actualizada

El sitio es estático (GitHub Pages, sin servidor) y combina tres capas:

1. **Copia guardada en `data/`.** Una GitHub Action corre cada 6 horas, baja los datos de [valorant-api.com](https://valorant-api.com/), los valida y hace commit solo si cambiaron. Cada página arranca mostrando esta copia, que es rápida y no depende de nadie.
2. **Control en vivo.** Después, el navegador pide `/v1/version` a la fuente, una respuesta de menos de 1 KB. Si el parche coincide con la copia, no pide nada más.
3. **Datos en vivo.** Si salió un parche que la Action todavía no levantó, el navegador baja esa sección directo de la fuente y la reemplaza en pantalla.

| Situación | Qué ve la persona |
| --- | --- |
| Primera carga | Bloques de carga, y se anuncia a lectores de pantalla |
| Copia al día | Los datos y un aviso con el parche, como "Al día con el parche 13.09" |
| Parche nuevo todavía sin copia | Los datos en vivo y un aviso de que vienen directo de la fuente |
| La fuente está caída | La copia guardada y un aviso visible con su parche y su fecha |
| Fallan la fuente y la copia | Un mensaje de error con botón para reintentar |
| No cargan las imágenes | Un recuadro con la inicial en lugar de la imagen rota |

La Action no pisa la copia si la respuesta viene rota, trae muy pocos elementos o una lista se achicó más de un 30 %. En esos casos el workflow falla y GitHub lo avisa.

## Idiomas

El selector EN / ES del encabezado guarda la elección en el navegador. Sin elección guardada, el sitio usa español si el navegador está en español, y si no, inglés.

Los textos de la interfaz están en `js/i18n.js`. Los del juego ya vienen traducidos de la fuente: `en-US` y `es-MX`, la variante latinoamericana, cada una con su copia guardada. El aviso legal de Riot queda en inglés en los dos idiomas para no alterar su texto.

## Fuentes de datos

Revisado el 5 de noviembre de 2026.

| Fuente | Clave | Contenido | Actualización | Conclusión |
| --- | --- | --- | --- | --- |
| [valorant-api.com](https://valorant-api.com/) | No | Agentes, habilidades, mapas, armas, skins y más, con imágenes y 18 idiomas | Estaba en el parche actual, 13.09, compilado el 28/10/2026 | **Elegida** |
| [API oficial de Riot](https://developer.riotgames.com/docs/valorant) (`val-content-v1`) | Sí, de producción y con aprobación de Riot | Contenido filtrable por idioma (no pude confirmar si incluye imágenes y textos de habilidades, porque su referencia no cargó) | Oficial | **Alternativa si la elegida desaparece** |
| [Public Content Catalog de Riot](https://developer.riotgames.com/docs/valorant) | No | Imágenes y JSON de uso libre | Manual: el enlace publicado es `release-08.09`, de mayo de 2024, y pesa unos 510 MB | Muy atrasado para este objetivo |
| [HenrikDev](https://docs.henrikdev.xyz/general/rate-limiting.md) | Sí, los límites van por clave | Orientada a datos de jugadores; no verifiqué si sirve para agentes y mapas | No verificado | Descartada, porque una clave no puede ir en un sitio estático |

**Por qué valorant-api.com:** no pide clave, permite llamadas desde cualquier origen (`Access-Control-Allow-Origin: *`) y trae todo lo que el sitio necesita.

**La API oficial no sirve hoy de forma directa:** Riot [no acepta claves personales para VALORANT](https://developer.riotgames.com/docs/valorant), exige registrar el producto y pide no incluir la clave en el código. Para usarla, la clave tendría que quedar como secreto de la Action y Riot tendría que aprobar el proyecto.

### Límites de la fuente elegida

- **No es oficial.** Es un proyecto de fans sin relación con Riot, sin garantía de disponibilidad y sin condiciones de uso publicadas que yo haya encontrado. Puede cambiar o desaparecer.
- **Límites de uso:** no publica ninguno. El sitio igual la consulta lo mínimo posible.
- **Caché:** las respuestas de la API se guardan hasta 4 horas (`max-age=14400`) y las imágenes hasta 14 días, así que un parche puede tardar unas horas en verse.
- **Imágenes:** siempre salen de `media.valorant-api.com`. La copia de `data/` guarda solo los textos y las direcciones, así que si ese servidor cae el texto sigue y las imágenes muestran el recuadro de reemplazo.
- **Peso:** `/v1/weapons` pesa unos 3,6 MB sin comprimir porque incluye todas las skins. La copia guardada, sin skins, pesa unos 16 KB por idioma, y por eso la versión en vivo se pide solo si hace falta.
- **Datos que no ofrece:** los mapas no traen descripción (`narrativeDescription` viene vacío) y la API no indica qué mapas están en rotación. Por eso el sitio no muestra ninguna de las dos cosas.
- **Regla propia:** se consideran mapas los que tienen minimapa, lo que deja afuera The Range, Basic Training y las arenas de Skirmish. "Other game modes" agrupa los que no tienen sitios de bomba.

### Límites de GitHub Actions

- [GitHub desactiva los workflows programados](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/disabling-and-enabling-a-workflow) de un repositorio público tras 60 días sin actividad. Si pasa, el sitio sigue al día gracias al control en vivo, y se vuelve a activar con:

  ```bash
  gh workflow enable update-data.yml
  ```

- Las ejecuciones programadas pueden demorarse cuando GitHub tiene mucha carga.

## Aviso legal

Valopedia was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.

El [aviso de Riot](https://www.riotgames.com/en/legal) aparece al pie de todas las páginas. Esa política cubre proyectos de fans gratuitos y sin muro de pago.

## Desarrollo

No hay dependencias ni paso de compilación. Hace falta Node 20 o superior para los tests y el script de datos.

Levantar el sitio en `http://localhost:4173`:

```bash
npx http-server . -p 4173 -c-1
```

Correr los tests:

```bash
npm test
```

Refrescar la copia guardada a mano:

```bash
npm run update-data
```

### Estructura

- `js/valorant-data.js`: pedidos a la fuente, limpieza y validación. Lo comparten el navegador y el script.
- `js/loader.js`: decide de dónde salen los datos (copia, en vivo o error).
- `js/i18n.js`: textos de la interfaz y elección de idioma.
- `js/site.js`: menú y estados de carga, error y aviso.
- `pages/*/js/`: el dibujo de cada página. Todo lo que viene de la fuente entra como texto, nunca como HTML.
- `scripts/update-data.mjs` y `.github/workflows/update-data.yml`: la actualización programada.
- `data/<idioma>/`: la copia guardada, generada por el script. No se edita a mano.
