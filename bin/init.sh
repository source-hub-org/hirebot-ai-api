#!/bin/sh

docker compose exec app npm run command app:init-topics ./local/topics.json && 
docker compose exec app npm run command app:init-positions ./local/positions.json && 
docker compose exec app npm run command app:init-languages ./tmp/languages.json
