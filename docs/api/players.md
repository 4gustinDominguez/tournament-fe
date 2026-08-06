## Players

### List All Players

```bash
curl http://localhost:3000/players
```

### Create a New Player

```bash
curl -X POST http://localhost:3000/players \
-H "Content-Type: application/json" \
-d '{ \
  "name": "John Doe", \
  "nickname": "Johnny" \
}'
```

### Get Player by ID

Replace `<PLAYER_ID>` with an actual player ID from the list players endpoint.

```bash
curl http://localhost:3000/players/<PLAYER_ID>
```

### Update a Player

Replace `<PLAYER_ID>` with an actual player ID.

```bash
curl -X PUT http://localhost:3000/players/<PLAYER_ID> \
-H "Content-Type: application/json" \
-d '{
  "name": "John Doe Updated",
  "nickname": "JohnnyU"
}'
```

### Delete a Player

Replace `<PLAYER_ID>` with an actual player ID.

```bash
curl -X DELETE http://localhost:3000/players/<PLAYER_ID>
```

