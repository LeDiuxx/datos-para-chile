const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuración de la API del Banco Central
const API_CONFIG = {
    baseURL: 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx',
    credentials: {
        user: process.env.BCENTRAL_USER || 'vittocaridi@gmail.com',
        pass: process.env.BCENTRAL_PASS || 'Cardixx7'
    }
};

// Endpoint proxy para la API del Banco Central
app.get('/api/bcentral', async (req, res) => {
    try {
        console.log('🔄 Proxy request to Banco Central API');
        console.log('📊 Params:', req.query);
        
        // Construir parámetros para la API
        const apiParams = {
            user: API_CONFIG.credentials.user,
            pass: API_CONFIG.credentials.pass,
            firstdate: req.query.firstdate,
            lastdate: req.query.lastdate,
            timeseries: req.query.timeseries,
            function: req.query.function || 'GetSeries'
        };
        
        // Hacer petición a la API del Banco Central
        const response = await axios.get(API_CONFIG.baseURL, {
            params: apiParams,
            timeout: 30000,
            headers: {
                'User-Agent': 'Datos para Chile - Plataforma de Transparencia Gubernamental'
            }
        });
        
        console.log('✅ Respuesta exitosa del Banco Central');
        console.log('📦 Datos recibidos:', typeof response.data, Object.keys(response.data || {}));
        
        // Enviar respuesta
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error en proxy del Banco Central:', error.message);
        
        // Respuesta de error estructurada
        const errorResponse = {
            error: true,
            message: error.message,
            code: error.response?.status || 500,
            timestamp: new Date().toISOString()
        };
        
        res.status(500).json(errorResponse);
    }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Datos para Chile',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint de información
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Datos para Chile',
        description: 'Dashboard de transparencia gubernamental',
        version: '1.0.0',
        author: 'Vicente Caridi',
        endpoints: {
            health: '/api/health',
            bcentral: '/api/bcentral',
            info: '/api/info'
        },
        features: [
            'Datos económicos del Banco Central',
            'Seguimiento de promesas presidenciales',
            'Dashboard interactivo',
            'Gráficos con líneas de tendencia'
        ]
    });
});

// Servir la aplicación principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        message: `La ruta ${req.path} no existe`,
        availableEndpoints: [
            '/',
            '/api/health',
            '/api/info',
            '/api/bcentral'
        ]
    });
});

// Manejo de errores globales
app.use((error, req, res, next) => {
    console.error('❌ Error del servidor:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🚀 Datos para Chile - Servidor iniciado');
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('=' * 50);
});

module.exports = app;
