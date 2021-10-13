echo "Building Coladays DB image..."
cd db && docker build . -t coladays-db

echo "Building Coladays Server image..."
cd ./../backend && docker build . -t coladays-server

echo "Building Coladays Frontend image..."
cd ./../frontend && docker build . -t coladays-frontend

