#!/bin/bash

set -e

npm i 

rm -vrf dist

npx vite build

cp manifest.json dist/
cp -v icon* dist/  
cp -v *.html dist/  
cp -v *.css dist/  


# npx web-ext build --ignore-files "*.http" "drawing.svg" --overwrite-dest
npx web-ext build --source-dir=dist --overwrite-dest 
echo "✅ Extension ready."
