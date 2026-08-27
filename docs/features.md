# Features

## Sedes (Places)

Gestión de sedes/locales para torneos, con soporte de geolocalización y mapa interactivo.

### Crear sede

- Formulario con nombre, dirección, capacidad
- **LocationPicker**: autocomplete con Nominatim (OpenStreetMap), mapa interactivo con pin arrastrable
- Al hacer click en el mapa o arrastrar el pin, se hace **reverse geocoding** para autocompletar la dirección
- Guarda lat/lng para geolocalización precisa

### Editar sede

- Dialog modal (`EditPlaceDialog`) con el mismo formulario que creación
- Modifica nombre, ubicación, capacidad y coordenadas
- Botón ✏️ visible solo para admins/propietarios del torneo

### Eliminar sede

- Botón 🗑️ con confirmación, visible solo para admins/propietarios

### Lista de sedes

- Layout horizontal (`flex`) con scroll si hay muchas sedes
- Cada card muestra: nombre, mini mapa (PlaceMap), dirección, capacidad
- Link "Cómo llegar" a Google Maps usando coordenadas
- Formulario de creación y lista al 50% del ancho en desktop (`lg:grid-cols-2`)

### PlaceLink (en partidos)

- Componente reutilizable que muestra nombre de sede + link a Google Maps
- Integrado en:
  - **MatchesSection** (público + admin): footer de cada partido
  - **Referee dashboard**: cards de partidos asignados
  - **Referee match control**: header del partido
  - **Player match detail**: info del partido (arreglado bug que no mostraba nombre)
  - **Player matches list**: cards de partidos
  - **Player dashboard**: partidos próximos

### Detalles técnicos

- **Z-index**: Leaflet usa `zIndex: 0` en el `MapContainer` inline style para no superponer modales
- **API**: `GET /places`, `POST /places`, `PUT /places/:id`, `DELETE /places/:id`
- **Backend**: Place entity con `latitude?`, `longitude?`, validación con Zod
- **i18n**: Keys en `Places.*`, `CreatePlaceForm.*`, `EditPlace.*`, `Common.*`
- **Util compartido**: `getPlaceName`, `getPlace`, `getGoogleMapsUrl` en `@/lib/places`
