#!/usr/bin/env python3
"""
Servidor Proxy Local para API del Banco Central de Chile
Soluciona el problema CORS permitiendo peticiones desde localhost
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys
from urllib.error import HTTPError, URLError

class CORSProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Agregar headers CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        # Extraer parámetros de la URL
        if self.path.startswith('/api/bcentral?'):
            try:
                # Parsear parámetros
                query_string = self.path.split('?', 1)[1]
                params = urllib.parse.parse_qs(query_string)
                
                # Construir URL del Banco Central
                base_url = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx"
                
                # Parámetros requeridos
                api_params = {
                    'user': params.get('user', [''])[0],
                    'pass': params.get('pass', [''])[0],
                    'firstdate': params.get('firstdate', [''])[0],
                    'lastdate': params.get('lastdate', [''])[0],
                    'timeseries': params.get('timeseries', [''])[0],
                    'function': params.get('function', ['GetSeries'])[0]
                }
                
                # Construir URL completa
                url_params = urllib.parse.urlencode(api_params)
                full_url = f"{base_url}?{url_params}"
                
                print(f"🔄 Proxy request: {full_url}")
                
                # Hacer petición a la API
                request = urllib.request.Request(full_url)
                request.add_header('User-Agent', 'Mozilla/5.0 (Datos para Chile Proxy)')
                
                with urllib.request.urlopen(request, timeout=30) as response:
                    data = response.read()
                    print(f"✅ Respuesta recibida: {len(data)} bytes")
                    self.wfile.write(data)
                    
            except HTTPError as e:
                print(f"❌ HTTP Error: {e.code} - {e.reason}")
                error_response = {
                    "error": f"HTTP {e.code}",
                    "message": str(e.reason)
                }
                self.wfile.write(json.dumps(error_response).encode())
                
            except URLError as e:
                print(f"❌ URL Error: {e.reason}")
                error_response = {
                    "error": "Connection Error",
                    "message": str(e.reason)
                }
                self.wfile.write(json.dumps(error_response).encode())
                
            except Exception as e:
                print(f"❌ Error general: {e}")
                error_response = {
                    "error": "Proxy Error",
                    "message": str(e)
                }
                self.wfile.write(json.dumps(error_response).encode())
        else:
            # Servir archivos estáticos normalmente
            super().do_GET()
    
    def do_OPTIONS(self):
        # Manejar preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_proxy_server(port=8001):
    """Ejecutar el servidor proxy"""
    try:
        with socketserver.TCPServer(("", port), CORSProxyHandler) as httpd:
            print(f"🚀 Servidor Proxy iniciado en http://localhost:{port}")
            print(f"📡 Proxy endpoint: http://localhost:{port}/api/bcentral")
            print(f"🌐 Aplicación web: http://localhost:8000")
            print(f"⚡ Presiona Ctrl+C para detener")
            print("-" * 50)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor proxy detenido")
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")

if __name__ == "__main__":
    port = 8001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Puerto inválido, usando 8001")
    
    run_proxy_server(port)
