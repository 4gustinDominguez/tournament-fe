## Tournaments

### List All Tournaments

```bash
curl http://localhost:3000/tournaments
```

### Create a New Tournament

```bash
curl -X POST http://localhost:3000/tournaments \
-H "Content-Type: application/json" \
-d '{
  "name": "My Awesome Tournament",
  "startDate": "2025-09-20",
  "endDate": "2025-09-27"
}'
```
### Get Tournament by ID

Replace `<TOURNAMENT_ID>` with an actual tournament ID.

```bash
curl http://localhost:3000/tournaments/<TOURNAMENT_ID>
```

### Update a Tournament

Replace `<TOURNAMENT_ID>` with an actual tournament ID.

```bash
curl -X PUT http://localhost:3000/tournaments/<TOURNAMENT_ID> \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Tournament Name",
  "startDate": "2025-10-20",
  "endDate": "2025-10-27"
}'
```

### Delete a Tournament

Replace `<TOURNAMENT_ID>` with an actual tournament ID.

```bash
curl -X DELETE http://localhost:3000/tournaments/<TOURNAMENT_ID>
```
