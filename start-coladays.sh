echo "Running Coladays DB"
docker run -d -p 3306:3306 --name=coladays-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_ROOT_HOST=% coladays-db --default-authentication-plugin=mysql_native_password

echo "Running Coladays Frontend"
docker run --name coladays-frontend -d -p 4200:4200 coladays-frontend

echo "Running Coladays Server"
docker run -p 8000:8000 --name=coladays-server -it coladays-server




