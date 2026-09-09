echo "Building React app and moving into backend"

cd frontend
npm install
npm run build
cd ..
rm -rf backend/dist
cp -R frontend/dist backend/dist