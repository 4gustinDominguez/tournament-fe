## Teams

### List All Teams

```bash
curl http://localhost:3000/teams
```

### Create a New Team

```bash
curl -X POST http://localhost:3000/teams \
-H "Content-Type: application/json" \
-d '{
  "name": "My Awesome Team",
  "playerIds": ["<PLAYER_ID_1>", "<PLAYER_ID_2>"]
}'
```

### Get Team by ID

Replace `<TEAM_ID>` with an actual team ID.

```bash
curl http://localhost:3000/teams/<TEAM_ID>
```

### Update a Team

Replace `<TEAM_ID>` with an actual team ID.

```bash
curl -X PUT http://localhost:3000/teams/<TEAM_ID> \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Team Name",
  "playerIds": ["<PLAYER_ID_1>", "<PLAYER_ID_3>"]
}'
```

### Delete a Team

Replace `<TEAM_ID>` with an actual team ID.

```bash
curl -X DELETE http://localhost:3000/teams/<TEAM_ID>
```

