# 📊 Módulo de Indicadores Públicos de Chile

Sistema completo de métricas gubernamentales con Unit Economics y actualización automática desde APIs oficiales chilenas.

## 🎯 Características Principales

### 📈 5 Ejes Temáticos
1. **Crecimiento Económico** - PIB, empleo, inflación, inversión
2. **Bienestar y Equidad** - Pobreza, Gini, ingresos, participación laboral
3. **Seguridad Pública** - Homicidios, delitos, percepción de inseguridad
4. **Medioambiente** - Emisiones CO₂, energía renovable, áreas protegidas
5. **Institucionalidad** - Cobertura salud/educación, participación electoral

### 🔌 Fuentes de Datos Oficiales
- **Banco Central de Chile** - Indicadores económicos y financieros
- **INE Chile** - Estadísticas demográficas y sociales
- **CEPAL** - Indicadores regionales y de desarrollo
- **Datos.gob.cl** - Portal de datos abiertos del gobierno
- **Ministerios específicos** - MINSAL, MINEDUC, SPD, MMA

### 📐 Unit Economics Automatizados
- PIB per cápita = PIB real / población
- Tasa de equidad = (1 - Gini) × 100
- Emisiones per cápita = GEI totales / población
- Cobertura efectiva = beneficiarios / población objetivo

## 🚀 Instalación y Uso

### 1. Archivos Principales
```
📁 Proyecto/
├── 📄 metricsConfig.json      # Configuración de métricas
├── 📄 publicIndicators.js     # Módulo principal frontend
├── 📄 apiManager.js          # Gestión de APIs y conectores
├── 📄 server-enhanced.js     # Servidor Node.js con endpoints
└── 📄 index.html            # Integración en dashboard
```

### 2. Configuración del Servidor

```bash
# Instalar dependencias
npm install express cors axios dotenv node-fetch node-cron

# Variables de entorno (.env)
BCENTRAL_USER=tu_usuario@email.com
BCENTRAL_PASS=tu_contraseña
NODE_ENV=production
PORT=3000

# Ejecutar servidor
npm start
```

### 3. Endpoints de la API

```javascript
// Configuración de métricas
GET /api/metrics/config

// Datos de métrica específica
GET /api/metrics/:source/:metricKey?startDate=2020-01&endDate=2024-12

// Múltiples métricas (batch)
POST /api/metrics/batch
{
  "metrics": [
    {"key": "pib_real", "source": "bcentral", "seriesCode": "F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T"},
    {"key": "desempleo", "source": "bcentral", "seriesCode": "F073.TCO.PRO.M.0.15_Y_MAS.T"}
  ],
  "startDate": "2020-01",
  "endDate": "2024-12"
}

// Estadísticas del cache
GET /api/cache/stats

// Limpiar cache
DELETE /api/cache
```

## 📊 Estructura de Datos

### Configuración de Métrica (metricsConfig.json)
```json
{
  "pib_real": {
    "name": "PIB Real",
    "description": "Producto Interno Bruto en términos reales",
    "unit": "CLP millones",
    "source": "Banco Central de Chile",
    "api_url": "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx",
    "series_code": "F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T",
    "update_frequency": "trimestral",
    "chart_type": "line",
    "unit_economics": {
      "formula": "PIB real / población",
      "name": "PIB per cápita",
      "unit": "CLP por habitante"
    }
  }
}
```

### Respuesta de API
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-09",
      "value": 45678.90,
      "source": "Banco Central de Chile"
    }
  ],
  "source": "bcentral",
  "metricKey": "pib_real",
  "timestamp": "2024-10-24T15:30:00.000Z",
  "count": 48
}
```

## 🔧 Conectores de APIs

### Banco Central de Chile
```javascript
// Configuración automática
const bcentralConnector = new BancoCentralConnector();
const data = await bcentralConnector.fetch({
  seriesCode: 'F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T',
  startDate: '2020-01',
  endDate: '2024-12'
});
```

### INE Chile
```javascript
const ineConnector = new INEConnector();
const data = await ineConnector.fetch({
  endpoint: '/estadisticas/empleo',
  params: { region: 'nacional', periodo: '2024-09' }
});
```

### Datos.gob.cl
```javascript
const datosGobConnector = new DatosGobConnector();
const data = await datosGobConnector.fetch({
  datasetId: 'pobreza-multidimensional',
  resourceId: 'abc123'
});
```

## 🎨 Interfaz de Usuario

### Pestañas por Categoría
- **Navegación intuitiva** entre los 5 ejes temáticos
- **Contadores de métricas** por categoría
- **Iconos representativos** para cada eje

### Cards de Métricas
- **Valor actual** con unidad de medida
- **Gráfico interactivo** (líneas, barras, radar)
- **Estado de conexión** (cargando, éxito, error, fallback)
- **Metadatos** (fuente, frecuencia, última actualización)
- **Acciones** (ver detalle, actualizar)

### Unit Economics
- **Cálculos automáticos** basados en fórmulas predefinidas
- **Tendencias** comparativas con períodos anteriores
- **Visualización clara** de métricas derivadas

## ⚙️ Sistema de Cache y Actualizaciones

### Cache Inteligente
```javascript
// Configuración por defecto
const cacheConfig = {
  ttl: 1800000,        // 30 minutos
  maxSize: 100,        // 100 entradas máximo
  autoCleanup: true    // Limpieza automática
};
```

### Actualizaciones Automáticas
```javascript
// Programación por frecuencia
const updateSchedule = {
  "daily": ["inflacion", "tasa_homicidios"],
  "weekly": ["empleo_formal", "delitos_alta_connotacion"],
  "monthly": ["pib_real", "desempleo"],
  "quarterly": ["participacion_laboral_femenina"],
  "annual": ["pobreza_multidimensional", "esperanza_vida"]
};
```

## 🛠️ Desarrollo y Extensión

### Agregar Nueva Métrica
1. **Actualizar metricsConfig.json** con la nueva métrica
2. **Crear conector** si es una nueva fuente de datos
3. **Definir Unit Economics** si aplica
4. **Configurar actualización automática**

### Nuevo Conector de API
```javascript
class NuevoConnector extends BaseConnector {
  constructor() {
    super('https://api.nueva-fuente.cl');
  }

  async fetch(config) {
    const data = await this.makeRequest(`${this.baseURL}${config.endpoint}`);
    return this.normalizeData(data, config);
  }

  normalizeData(rawData, config) {
    return rawData.map(item => ({
      date: item.fecha,
      value: parseFloat(item.valor),
      source: 'Nueva Fuente'
    }));
  }
}
```

### Personalizar Visualización
```javascript
// Configurar tipo de gráfico
const chartConfig = {
  type: 'line',        // line, bar, radar, doughnut
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { /* configuración */ }
  }
};
```

## 📱 Responsive Design

### Breakpoints Optimizados
- **Desktop (1400px+)**: Grid completo con múltiples columnas
- **Tablet (768px-1024px)**: Layout adaptativo
- **Mobile (480px-768px)**: Columna única, controles apilados
- **Mobile Small (360px-480px)**: Elementos compactos

### Características Móviles
- **Touch-friendly**: Botones y controles optimizados
- **Swipe navigation**: Entre categorías en móvil
- **Gráficos responsivos**: Altura adaptativa
- **Texto escalable**: Tipografía que se ajusta al viewport

## 🔒 Seguridad y Mejores Prácticas

### Manejo de Credenciales
```javascript
// Variables de entorno (nunca en código)
const credentials = {
  user: process.env.BCENTRAL_USER,
  pass: process.env.BCENTRAL_PASS
};
```

### Rate Limiting
```javascript
// Límites por fuente
const rateLimits = {
  bcentral: { requests: 100, window: 3600000 },  // 100/hora
  ine: { requests: 200, window: 3600000 },       // 200/hora
  datosgob: { requests: 500, window: 3600000 }   // 500/hora
};
```

### Manejo de Errores
- **Fallback automático** a datos en cache
- **Retry logic** con backoff exponencial
- **Logging detallado** para debugging
- **Notificaciones de usuario** amigables

## 🚀 Deploy en Producción

### Railway/Heroku
```bash
# Variables de entorno requeridas
BCENTRAL_USER=usuario@email.com
BCENTRAL_PASS=contraseña_segura
NODE_ENV=production
PORT=3000

# Comando de inicio
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoreo y Analytics

### Métricas del Sistema
- **Uptime de APIs** externas
- **Latencia promedio** por conector
- **Hit rate del cache**
- **Errores por fuente de datos**

### Logs Estructurados
```javascript
console.log('📊 Métrica actualizada:', {
  metric: 'pib_real',
  source: 'bcentral',
  timestamp: new Date().toISOString(),
  dataPoints: 48,
  latency: '1.2s'
});
```

## 🤝 Contribución

### Agregar Nueva Fuente de Datos
1. Fork del repositorio
2. Crear nuevo conector en `apiManager.js`
3. Actualizar `metricsConfig.json`
4. Agregar tests
5. Pull request con documentación

### Reportar Issues
- **Bug reports** con pasos para reproducir
- **Feature requests** con casos de uso
- **Mejoras de performance** con benchmarks

---

## 📞 Soporte

- **GitHub Issues**: Para bugs y features
- **Documentación**: README y comentarios en código
- **API Reference**: `/api/info` endpoint

**¡Contribuye a la transparencia gubernamental de Chile! 🇨🇱**
