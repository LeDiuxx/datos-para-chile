require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Simulación de APIManager para el servidor (versión simplificada)
class ServerAPIManager {
    constructor() {
        this.cache = new Map();
        this.rateLimits = new Map();
    }

    async fetchMetric(source, config) {
        const cacheKey = `${source}_${JSON.stringify(config)}`;
        const cached = this.cache.get(cacheKey);
        
        // Verificar cache (30 minutos)
        if (cached && (Date.now() - cached.timestamp) < 1800000) {
            console.log(`📦 Cache hit para: ${source}`);
            return cached.data;
        }

        let data;
        
        try {
            switch (source) {
                case 'bcentral':
                    data = await this.fetchBancoCentral(config);
                    break;
                case 'ine':
                    data = await this.fetchINE(config);
                    break;
                case 'datosgob':
                    data = await this.fetchDatosGob(config);
                    break;
                default:
                    throw new Error(`Fuente no soportada: ${source}`);
            }

            // Cachear resultado
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
            
        } catch (error) {
            console.error(`Error obteniendo datos de ${source}:`, error);
            
            // Retornar cache expirado si existe
            if (cached) {
                console.log(`⚠️ Usando cache expirado para: ${source}`);
                return cached.data;
            }
            
            throw error;
        }
    }

    async fetchBancoCentral(config) {
        const { seriesCode, startDate, endDate } = config;
        
        const params = new URLSearchParams({
            user: process.env.BCENTRAL_USER || 'vittocaridi@gmail.com',
            pass: process.env.BCENTRAL_PASS || 'Cardixx7',
            function: 'GetSeries',
            timeseries: seriesCode,
            firstdate: startDate + '-01',
            lastdate: endDate + '-01'
        });

        const url = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.Series?.Obs) {
            return [];
        }

        const observations = Array.isArray(data.Series.Obs) ? 
            data.Series.Obs : [data.Series.Obs];

        return observations.map(obs => ({
            date: obs.indexDateString?.substring(0, 7) || obs.IndexDateString?.substring(0, 7),
            value: parseFloat(obs.value || obs.Value || 0),
            source: 'Banco Central de Chile'
        })).filter(item => item.date && !isNaN(item.value));
    }

    async fetchINE(config) {
        // Implementación simplificada para INE
        // En producción, usar la API real de INE
        return this.generateMockData(config);
    }

    async fetchDatosGob(config) {
        // Implementación simplificada para Datos.gob.cl
        // En producción, usar la API real
        return this.generateMockData(config);
    }

    generateMockData(config) {
        const data = [];
        const startDate = new Date('2020-01-01');
        
        for (let i = 0; i < 48; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            
            data.push({
                date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                value: Math.random() * 100 + Math.sin(i / 6) * 20,
                source: config.source || 'Mock Data'
            });
        }
        
        return data;
    }
}

const apiManager = new ServerAPIManager();

// Rutas de la API

// Endpoint para obtener configuración de métricas
app.get('/api/metrics/config', async (req, res) => {
    try {
        const configPath = path.join(__dirname, 'metricsConfig.json');
        const configData = await fs.readFile(configPath, 'utf8');
        res.json(JSON.parse(configData));
    } catch (error) {
        console.error('Error cargando configuración:', error);
        res.status(500).json({ error: 'Error cargando configuración de métricas' });
    }
});

// Endpoint para obtener datos de una métrica específica
app.get('/api/metrics/:source/:metricKey', async (req, res) => {
    try {
        const { source, metricKey } = req.params;
        const { startDate, endDate, seriesCode } = req.query;

        const config = {
            seriesCode,
            startDate: startDate || '2020-01',
            endDate: endDate || new Date().toISOString().substring(0, 7),
            metricKey
        };

        const data = await apiManager.fetchMetric(source, config);
        
        res.json({
            success: true,
            data: data,
            source: source,
            metricKey: metricKey,
            timestamp: new Date().toISOString(),
            count: data.length
        });

    } catch (error) {
        console.error(`Error obteniendo métrica ${req.params.metricKey}:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            metricKey: req.params.metricKey
        });
    }
});

// Endpoint para obtener múltiples métricas de una categoría
app.post('/api/metrics/batch', async (req, res) => {
    try {
        const { metrics, startDate, endDate } = req.body;
        
        if (!Array.isArray(metrics)) {
            return res.status(400).json({ error: 'Se requiere un array de métricas' });
        }

        const results = await Promise.allSettled(
            metrics.map(async (metric) => {
                const config = {
                    seriesCode: metric.seriesCode,
                    startDate: startDate || '2020-01',
                    endDate: endDate || new Date().toISOString().substring(0, 7),
                    metricKey: metric.key
                };

                const data = await apiManager.fetchMetric(metric.source, config);
                
                return {
                    metricKey: metric.key,
                    success: true,
                    data: data,
                    source: metric.source
                };
            })
        );

        const response = {
            success: true,
            results: results.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    return {
                        metricKey: 'unknown',
                        success: false,
                        error: result.reason.message
                    };
                }
            }),
            timestamp: new Date().toISOString()
        };

        res.json(response);

    } catch (error) {
        console.error('Error en batch request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para estadísticas del cache
app.get('/api/cache/stats', (req, res) => {
    const stats = {
        size: apiManager.cache.size,
        entries: Array.from(apiManager.cache.keys()),
        timestamp: new Date().toISOString()
    };
    
    res.json(stats);
});

// Endpoint para limpiar cache
app.delete('/api/cache', (req, res) => {
    apiManager.cache.clear();
    res.json({
        success: true,
        message: 'Cache limpiado',
        timestamp: new Date().toISOString()
    });
});

// Proxy para Banco Central (mantener compatibilidad)
app.get('/api/bcentral', async (req, res) => {
    try {
        const bcentralUser = process.env.BCENTRAL_USER || 'vittocaridi@gmail.com';
        const bcentralPass = process.env.BCENTRAL_PASS || 'Cardixx7';

        if (!bcentralUser || !bcentralPass) {
            return res.status(500).json({ 
                Codigo: -101, 
                Descripcion: "Credenciales del Banco Central no configuradas." 
            });
        }

        const bcentralApiBaseURL = "https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx";
        const queryParams = new URLSearchParams(req.query);

        queryParams.set('user', bcentralUser);
        queryParams.set('pass', bcentralPass);

        const fullBcentralUrl = `${bcentralApiBaseURL}?${queryParams.toString()}`;
        console.log(`Proxying request to: ${fullBcentralUrl}`);

        const response = await fetch(fullBcentralUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error from Banco Central API: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ 
                Codigo: -response.status, 
                Descripcion: `Banco Central API error: ${errorText}` 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            Codigo: -500, 
            Descripcion: `Internal proxy error: ${error.message}` 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Servidor de Indicadores Públicos funcionando',
        timestamp: new Date().toISOString(),
        cache_size: apiManager.cache.size
    });
});

// Info del sistema
app.get('/api/info', (req, res) => {
    res.status(200).json({
        appName: 'Datos para Chile - Indicadores Públicos',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: [
            'Banco Central de Chile',
            'INE Chile',
            'CEPAL',
            'Datos.gob.cl',
            'Unit Economics',
            'Cache inteligente',
            'Actualizaciones automáticas'
        ],
        endpoints: [
            '/api/metrics/config',
            '/api/metrics/:source/:metricKey',
            '/api/metrics/batch',
            '/api/cache/stats',
            '/api/bcentral'
        ]
    });
});

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Indicadores Públicos ejecutándose en puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
    console.log(`🔌 API disponible en: http://localhost:${PORT}/api`);
    console.log(`📋 Información del sistema: http://localhost:${PORT}/api/info`);
    
    // Inicializar cache con datos básicos
    console.log('🔄 Inicializando cache con datos básicos...');
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
    });
});

module.exports = app;
