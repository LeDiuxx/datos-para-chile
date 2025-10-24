#!/bin/bash

echo "🚀 Iniciando Proxy para API del Banco Central de Chile"
echo "📡 Puerto: 8001"
echo "🌐 Endpoint: http://localhost:8001/api/bcentral"
echo "⚡ Presiona Ctrl+C para detener"
echo "=" * 50

python3 proxy-server.py
