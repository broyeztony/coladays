echo "Stop and remove Coladays Frontend"
docker kill coladays-frontend
docker rm coladays-frontend

echo "Stop and remove Coladays Server"
docker kill coladays-server
docker rm coladays-server

echo "Stop and remove Coladays DB"
docker kill coladays-db
docker rm coladays-db
