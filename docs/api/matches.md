## Matches

### Create a New Match

Replace `<TOURNAMENT_ID>`, `<TEAM_A_ID>`, and `<TEAM_B_ID>` with actual IDs.

```bash
curl -X POST http://localhost:3000/tournaments/<TOURNAMENT_ID>/matches \
-H "Content-Type: application/json" \
-d '{
  "teamAId": "<TEAM_A_ID>",
  "teamBId": "<TEAM_B_ID>",
  "date": "2025-09-21"
}'
```

### List Matches by Tournament

Replace `<TOURNAMENT_ID>` with an actual tournament ID.

```bash
curl http://localhost:3000/tournaments/<TOURNAMENT_ID>/matches
```

### Get Match by ID

Replace `<MATCH_ID>` with an actual match ID.

```bash
curl http://localhost:3000/matches/<MATCH_ID>
```

### Add Result to Match

Replace `<MATCH_ID>` with an actual match ID.

```bash
curl -X POST http://localhost:3000/matches/<MATCH_ID>/result \
-H "Content-Type: application/json" \
-d '{
  "scoreA": 2,
  "scoreB": 1,
  "winnerId": "<TEAM_A_ID>"
}'
```

### Update a Match

Replace `<MATCH_ID>` with an actual match ID.

```bash
curl -X PUT http://localhost:3000/matches/<MATCH_ID> \
-H "Content-Type: application/json" \
-d '{
  "teamAId": "<TEAM_A_ID>",
  "teamBId": "<TEAM_B_ID>",
  "date": "2025-09-22"
}'
```

### Delete a Match

Replace `<MATCH_ID>` with an actual match ID.

```bash
curl -X DELETE http://localhost:3000/matches/<MATCH_ID>
```
