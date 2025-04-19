#!/bin/bash

npm i 

rm -rf dist

npx vite build

echo "✅ Extension ready."
