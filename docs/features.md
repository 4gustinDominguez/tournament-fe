# Features

## Venues (Places)

Venue/location management for tournaments, with geolocation support and an interactive map.

### Create a venue

- Form with name, address and capacity
- **LocationPicker**: autocomplete with Nominatim (OpenStreetMap), interactive map with a draggable pin
- Clicking the map or dragging the pin triggers **reverse geocoding** to autofill the address
- Stores lat/lng for precise geolocation

### Edit a venue

- Modal dialog (`EditPlaceDialog`) with the same form as creation
- Edits name, location, capacity and coordinates
- ✏️ button visible only to tournament admins/owners

### Delete a venue

- 🗑️ button with confirmation, visible only to tournament admins/owners

### Venue list

- Horizontal (`flex`) layout with scrolling when there are many venues
- Each card shows: name, mini map (PlaceMap), address, capacity
- "Get directions" link to Google Maps using the coordinates
- Creation form and list side by side at 50% width on desktop (`lg:grid-cols-2`)

### PlaceLink (in matches)

- Reusable component showing the venue name + Google Maps link
- Integrated in:
  - **MatchesSection** (public + admin): footer of each match
  - **Referee dashboard**: assigned match cards
  - **Referee match control**: match header
  - **Player match detail**: match info (fixed a bug where the name was not shown)
  - **Player matches list**: match cards
  - **Player dashboard**: upcoming matches

### Technical details

- **Z-index**: Leaflet uses `zIndex: 0` on the `MapContainer` inline style so it does not overlay modals
- **API**: `GET /places`, `POST /places`, `PUT /places/:id`, `DELETE /places/:id`
- **Backend**: Place entity with `latitude?`, `longitude?`, Zod validation
- **i18n**: keys under `Places.*`, `CreatePlaceForm.*`, `EditPlace.*`, `Common.*`
- **Shared utilities**: `getPlaceName`, `getPlace`, `getGoogleMapsUrl` in `@/lib/places`
