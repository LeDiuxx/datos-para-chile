# 🚀 Deploy de "Datos para Chile" en Railway

## 📋 Guía de Despliegue

### **Paso 1: Preparar el Repositorio**

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar archivos
git add .
git commit -m "Initial commit - Datos para Chile v1.0"

# Conectar con GitHub (opcional pero recomendado)
git remote add origin https://github.com/tu-usuario/datos-para-chile.git
git push -u origin main
```

### **Paso 2: Deploy en Railway**

#### **Opción A: Desde GitHub**
1. Ve a [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Selecciona tu repositorio `datos-para-chile`
4. Railway detectará automáticamente Node.js

#### **Opción B: Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up
```

### **Paso 3: Configurar Variables de Entorno**

En el dashboard de Railway, ve a **Variables** y agrega:

```
NODE_ENV=production
BCENTRAL_USER=vittocaridi@gmail.com
BCENTRAL_PASS=Cardixx7
```

### **Paso 4: Configurar Dominio Personalizado**

1. En Railway dashboard → **Settings** → **Domains**
2. Click **Custom Domain**
3. Agregar: `datos.tudominio.com`
4. Configurar DNS:
   ```
   Type: CNAME
   Name: datos
   Value: tu-app.railway.app
   ```

### **Paso 5: Verificar Deploy**

Endpoints disponibles:
- `https://datos.tudominio.com/` - Aplicación principal
- `https://datos.tudominio.com/api/health` - Estado del servidor
- `https://datos.tudominio.com/api/info` - Información de la app
- `https://datos.tudominio.com/api/bcentral` - Proxy API Banco Central

## 🔧 Configuración DNS

### **Para Subdominio:**
```
Type: CNAME
Name: datos
Value: tu-proyecto.railway.app
TTL: 300
```

### **Verificar DNS:**
```bash
dig datos.tudominio.com
nslookup datos.tudominio.com
```

## 📊 Monitoreo

### **Logs en Railway:**
```bash
railway logs
```

### **Métricas disponibles:**
- CPU usage
- Memory usage
- Network I/O
- Request count
- Response times

## 🔒 Seguridad

### **Variables de Entorno:**
- ✅ Credenciales en variables de entorno
- ✅ No hardcodeadas en el código
- ✅ `.env` en `.gitignore`

### **HTTPS:**
- ✅ Railway proporciona SSL automático
- ✅ Redirección HTTP → HTTPS

## 🚀 Optimizaciones

### **Performance:**
- ✅ Compresión gzip automática
- ✅ Headers de cache configurados
- ✅ Timeout de 30s para API externa

### **Escalabilidad:**
- ✅ Restart automático en fallos
- ✅ Health check configurado
- ✅ Logs estructurados

## 🐛 Troubleshooting

### **Error: Build Failed**
```bash
# Verificar package.json
npm install
npm start
```

### **Error: API Timeout**
- Verificar credenciales del Banco Central
- Revisar logs: `railway logs`

### **Error: Domain Not Working**
- Verificar configuración DNS
- Esperar propagación (hasta 24h)

## 📱 Alternativas de Deploy

### **Vercel:**
```bash
npm i -g vercel
vercel --prod
```

### **Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### **Heroku:**
```bash
heroku create datos-para-chile
git push heroku main
```

## 🎯 URLs Finales

- **Producción**: `https://datos.tudominio.com`
- **Railway**: `https://tu-proyecto.railway.app`
- **API Health**: `https://datos.tudominio.com/api/health`

---

**¡Listo para transparentar el gobierno chileno! 🇨🇱**
