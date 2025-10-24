// Gestor de APIs para Indicadores Públicos de Chile
// Sistema de conectores para múltiples fuentes de datos gubernamentales

class APIManager {
    constructor() {
        this.connectors = new Map();
        this.cache = new Map();
        this.rateLimits = new Map();
        
        this.initializeConnectors();
    }

    initializeConnectors() {
        // Banco Central de Chile
        this.connectors.set('bcentral', new BancoCentralConnector());
        
        // INE Chile
        this.connectors.set('ine', new INEConnector());
        
        // CEPAL
        this.connectors.set('cepal', new CEPALConnector());
        
        // Datos.gob.cl
        this.connectors.set('datosgob', new DatosGobConnector());
        
        // Ministerios específicos
        this.connectors.set('minsal', new MINSALConnector());
        this.connectors.set('mineduc', new MINEDUCConnector());
        this.connectors.set('spd', new SPDConnector());
        this.connectors.set('mma', new MMAConnector());
        
        console.log('🔌 Conectores de API inicializados:', this.connectors.size);
    }

    async fetchMetric(source, config) {
        const connector = this.connectors.get(source);
        if (!connector) {
            throw new Error(`Conector no encontrado para: ${source}`);
        }

        // Verificar rate limiting
        if (this.isRateLimited(source)) {
            throw new Error(`Rate limit excedido para: ${source}`);
        }

        // Verificar cache
        const cacheKey = `${source}_${JSON.stringify(config)}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && !this.isCacheExpired(cached)) {
            console.log(`📦 Datos desde cache: ${source}`);
            return cached.data;
        }

        try {
            console.log(`🔄 Obteniendo datos de: ${source}`);
            const data = await connector.fetch(config);
            
            // Cachear resultado
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now(),
                ttl: config.cacheTTL || 3600000 // 1 hora por defecto
            });

            // Actualizar rate limit
            this.updateRateLimit(source);
            
            return data;
            
        } catch (error) {
            console.error(`❌ Error obteniendo datos de ${source}:`, error);
            
            // Intentar fallback si está disponible
            if (cached) {
                console.log(`⚠️ Usando datos expirados como fallback: ${source}`);
                return cached.data;
            }
            
            throw error;
        }
    }

    isRateLimited(source) {
        const limit = this.rateLimits.get(source);
        if (!limit) return false;
        
        const now = Date.now();
        return (now - limit.lastRequest) < limit.minInterval;
    }

    updateRateLimit(source) {
        this.rateLimits.set(source, {
            lastRequest: Date.now(),
            minInterval: 5000 // 5 segundos mínimo entre requests
        });
    }

    isCacheExpired(cached) {
        return (Date.now() - cached.timestamp) > cached.ttl;
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpiado');
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Conector base
class BaseConnector {
    constructor(baseURL, defaultHeaders = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Accept': 'application/json',
            'User-Agent': 'DatosParaChile/1.0',
            ...defaultHeaders
        };
    }

    async makeRequest(url, options = {}) {
        const response = await fetch(url, {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
            return await response.json();
        } else if (contentType?.includes('text/csv')) {
            return await this.parseCSV(await response.text());
        } else {
            return await response.text();
        }
    }

    async parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index]?.trim();
            });
            
            return obj;
        }).filter(obj => Object.values(obj).some(v => v)); // Filtrar filas vacías
    }

    normalizeData(rawData, config) {
        // Implementar en cada conector específico
        return rawData;
    }
}

// Conector Banco Central de Chile
class BancoCentralConnector extends BaseConnector {
    constructor() {
        super('https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx');
        this.credentials = {
            user: 'vittocaridi@gmail.com',
            pass: 'Cardixx7'
        };
    }

    async fetch(config) {
        const { seriesCode, startDate, endDate } = config;
        
        const params = new URLSearchParams({
            user: this.credentials.user,
            pass: this.credentials.pass,
            function: 'GetSeries',
            timeseries: seriesCode,
            firstdate: startDate + '-01',
            lastdate: endDate + '-01'
        });

        const url = `${this.baseURL}?${params.toString()}`;
        
        try {
            // Usar el proxy existente si estamos en el frontend
            if (typeof window !== 'undefined') {
                const response = await fetchWithCORSProxy(url);
                const data = await response.json();
                return this.normalizeData(data, config);
            } else {
                // Servidor Node.js
                const data = await this.makeRequest(url);
                return this.normalizeData(data, config);
            }
        } catch (error) {
            console.error('Error Banco Central:', error);
            throw error;
        }
    }

    normalizeData(rawData, config) {
        if (!rawData.Series?.Obs) {
            return [];
        }

        const observations = Array.isArray(rawData.Series.Obs) ? 
            rawData.Series.Obs : [rawData.Series.Obs];

        return observations.map(obs => ({
            date: obs.indexDateString?.substring(0, 7) || obs.IndexDateString?.substring(0, 7),
            value: parseFloat(obs.value || obs.Value || 0),
            source: 'Banco Central de Chile'
        })).filter(item => item.date && !isNaN(item.value));
    }
}

// Conector INE Chile
class INEConnector extends BaseConnector {
    constructor() {
        super('https://api.ine.cl');
    }

    async fetch(config) {
        const { endpoint, params = {} } = config;
        
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        // INE tiene diferentes formatos según el endpoint
        if (Array.isArray(rawData)) {
            return rawData.map(item => ({
                date: item.periodo || item.fecha || item.date,
                value: parseFloat(item.valor || item.value || item.dato || 0),
                source: 'INE Chile'
            }));
        }

        // Formato alternativo
        if (rawData.data) {
            return rawData.data.map(item => ({
                date: item.periodo || item.fecha,
                value: parseFloat(item.valor || item.value || 0),
                source: 'INE Chile'
            }));
        }

        return [];
    }
}

// Conector CEPAL
class CEPALConnector extends BaseConnector {
    constructor() {
        super('https://statistics.cepal.org/portal/cepalstat/api');
    }

    async fetch(config) {
        const { indicator, country = 'CHL', startYear, endYear } = config;
        
        const url = `${this.baseURL}/v1/data/${indicator}?countries=${country}&years=${startYear}:${endYear}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        if (!rawData.data) return [];

        return rawData.data.map(item => ({
            date: item.year + '-01',
            value: parseFloat(item.value || 0),
            source: 'CEPAL'
        })).filter(item => !isNaN(item.value));
    }
}

// Conector Datos.gob.cl
class DatosGobConnector extends BaseConnector {
    constructor() {
        super('https://datos.gob.cl/api/3/action');
    }

    async fetch(config) {
        const { datasetId, resourceId, filters = {} } = config;
        
        let url;
        if (resourceId) {
            url = `${this.baseURL}/datastore_search?resource_id=${resourceId}`;
        } else {
            url = `${this.baseURL}/package_show?id=${datasetId}`;
        }

        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        if (rawData.result?.records) {
            return rawData.result.records.map(record => ({
                date: record.fecha || record.periodo || record.year,
                value: parseFloat(record.valor || record.value || record.dato || 0),
                source: 'Datos.gob.cl'
            }));
        }

        return [];
    }
}

// Conectores específicos de ministerios
class MINSALConnector extends BaseConnector {
    constructor() {
        super('https://deis.minsal.cl/api');
    }

    async fetch(config) {
        const { endpoint, params = {} } = config;
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        // Implementar según formato específico de MINSAL
        return Array.isArray(rawData) ? rawData.map(item => ({
            date: item.periodo || item.fecha,
            value: parseFloat(item.cobertura || item.valor || 0),
            source: 'MINSAL'
        })) : [];
    }
}

class MINEDUCConnector extends BaseConnector {
    constructor() {
        super('https://datosabiertos.mineduc.cl/api');
    }

    async fetch(config) {
        const { endpoint, params = {} } = config;
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        return Array.isArray(rawData) ? rawData.map(item => ({
            date: item.año || item.periodo,
            value: parseFloat(item.matricula || item.cobertura || item.valor || 0),
            source: 'MINEDUC'
        })) : [];
    }
}

class SPDConnector extends BaseConnector {
    constructor() {
        super('https://datos.spd.gov.cl/api');
    }

    async fetch(config) {
        const { endpoint, params = {} } = config;
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        return Array.isArray(rawData) ? rawData.map(item => ({
            date: item.periodo || item.fecha,
            value: parseFloat(item.tasa || item.casos || item.valor || 0),
            source: 'Subsecretaría Prevención del Delito'
        })) : [];
    }
}

class MMAConnector extends BaseConnector {
    constructor() {
        super('https://snich.mma.gob.cl/api');
    }

    async fetch(config) {
        const { endpoint, params = {} } = config;
        const queryParams = new URLSearchParams(params);
        const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
        
        const data = await this.makeRequest(url);
        return this.normalizeData(data, config);
    }

    normalizeData(rawData, config) {
        return Array.isArray(rawData) ? rawData.map(item => ({
            date: item.año || item.periodo,
            value: parseFloat(item.emisiones || item.valor || 0),
            source: 'Ministerio del Medio Ambiente'
        })) : [];
    }
}

// Sistema de cronjobs para actualización automática
class CronJobManager {
    constructor(apiManager) {
        this.apiManager = apiManager;
        this.jobs = new Map();
        this.isRunning = false;
    }

    scheduleJob(name, cronExpression, task) {
        if (this.jobs.has(name)) {
            clearInterval(this.jobs.get(name));
        }

        // Convertir expresión cron a intervalo (simplificado)
        const interval = this.cronToInterval(cronExpression);
        
        const jobId = setInterval(async () => {
            try {
                console.log(`🕐 Ejecutando job: ${name}`);
                await task();
                console.log(`✅ Job completado: ${name}`);
            } catch (error) {
                console.error(`❌ Error en job ${name}:`, error);
            }
        }, interval);

        this.jobs.set(name, jobId);
        console.log(`📅 Job programado: ${name} (cada ${interval}ms)`);
    }

    cronToInterval(cronExpression) {
        // Conversión simplificada de cron a milisegundos
        const intervals = {
            '0 0 * * *': 24 * 60 * 60 * 1000,     // Diario
            '0 0 * * 0': 7 * 24 * 60 * 60 * 1000,  // Semanal
            '0 0 1 * *': 30 * 24 * 60 * 60 * 1000, // Mensual
            '*/15 * * * *': 15 * 60 * 1000,        // Cada 15 minutos
            '*/30 * * * *': 30 * 60 * 1000         // Cada 30 minutos
        };

        return intervals[cronExpression] || 60 * 60 * 1000; // 1 hora por defecto
    }

    start() {
        this.isRunning = true;
        console.log('🚀 CronJob Manager iniciado');
    }

    stop() {
        this.jobs.forEach(jobId => clearInterval(jobId));
        this.jobs.clear();
        this.isRunning = false;
        console.log('⏹️ CronJob Manager detenido');
    }

    getStatus() {
        return {
            running: this.isRunning,
            activeJobs: Array.from(this.jobs.keys())
        };
    }
}

// Exportar para uso en Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIManager, CronJobManager };
} else {
    window.APIManager = APIManager;
    window.CronJobManager = CronJobManager;
}

// Instancia global para el navegador
if (typeof window !== 'undefined') {
    window.apiManager = new APIManager();
}
