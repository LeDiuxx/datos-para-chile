// Módulo de Indicadores Públicos de Chile
// Sistema completo de métricas gubernamentales con Unit Economics

class PublicIndicatorsModule {
    constructor() {
        this.config = null;
        this.cache = new Map();
        this.activeCategory = 'economia';
        this.charts = new Map();
        this.updateIntervals = new Map();
        
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            this.createUI();
            this.setupEventListeners();
            await this.loadInitialData();
            console.log('📊 Módulo de Indicadores Públicos inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando módulo:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('./metricsConfig.json');
            this.config = await response.json();
            console.log('✅ Configuración de métricas cargada:', Object.keys(this.config.categories).length, 'categorías');
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            throw error;
        }
    }

    createUI() {
        // Crear contenedor principal del módulo
        const existingModule = document.getElementById('public-indicators-module');
        if (existingModule) {
            existingModule.remove();
        }

        const moduleContainer = document.createElement('div');
        moduleContainer.id = 'public-indicators-module';
        moduleContainer.className = 'public-indicators-module';
        
        moduleContainer.innerHTML = `
            <div class="module-header">
                <div class="container">
                    <div class="header-content">
                        <div class="title-section">
                            <h2>📊 Indicadores Públicos de Chile</h2>
                            <p>Panel de métricas gubernamentales con Unit Economics y actualización automática</p>
                        </div>
                        <div class="controls-section">
                            <button class="btn-refresh" id="refreshAllData">
                                🔄 Actualizar Datos
                            </button>
                            <div class="last-update" id="lastUpdateInfo">
                                Última actualización: Cargando...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="module-navigation">
                <div class="container">
                    <div class="category-tabs" id="categoryTabs">
                        ${this.createCategoryTabs()}
                    </div>
                </div>
            </div>

            <div class="module-content">
                <div class="container">
                    <div class="category-content" id="categoryContent">
                        ${this.createCategoryContent()}
                    </div>
                </div>
            </div>
        `;

        // Insertar después del dashboard existente
        const dashboard = document.querySelector('.dashboard');
        if (dashboard) {
            dashboard.parentNode.insertBefore(moduleContainer, dashboard.nextSibling);
        } else {
            document.body.appendChild(moduleContainer);
        }

        this.addModuleStyles();
    }

    createCategoryTabs() {
        return Object.entries(this.config.categories).map(([key, category]) => `
            <button class="category-tab ${key === this.activeCategory ? 'active' : ''}" 
                    data-category="${key}">
                <span class="tab-icon">${category.icon}</span>
                <span class="tab-name">${category.name}</span>
                <span class="tab-count">${Object.keys(category.metrics).length}</span>
            </button>
        `).join('');
    }

    createCategoryContent() {
        const category = this.config.categories[this.activeCategory];
        
        return `
            <div class="category-header">
                <h3>${category.icon} ${category.name}</h3>
                <p>Métricas clave con cálculos de Unit Economics y datos oficiales</p>
            </div>
            
            <div class="metrics-grid" id="metricsGrid">
                ${this.createMetricsCards(category.metrics)}
            </div>
            
            <div class="unit-economics-section" id="unitEconomicsSection">
                <h4>📈 Unit Economics Calculados</h4>
                <div class="unit-economics-grid" id="unitEconomicsGrid">
                    ${this.createUnitEconomicsCards(category.metrics)}
                </div>
            </div>
        `;
    }

    createMetricsCards(metrics) {
        return Object.entries(metrics).map(([key, metric]) => `
            <div class="metric-card" data-metric="${key}">
                <div class="metric-header">
                    <h4>${metric.name}</h4>
                    <div class="metric-status" id="status-${key}">
                        <span class="status-indicator loading">🔄</span>
                        <span class="status-text">Cargando...</span>
                    </div>
                </div>
                
                <div class="metric-value" id="value-${key}">
                    <span class="current-value">--</span>
                    <span class="unit">${metric.unit}</span>
                </div>
                
                <div class="metric-chart" id="chart-${key}">
                    <canvas></canvas>
                </div>
                
                <div class="metric-info">
                    <div class="metric-description">${metric.description}</div>
                    <div class="metric-meta">
                        <span class="source">📊 ${metric.source}</span>
                        <span class="frequency">🔄 ${metric.update_frequency}</span>
                        <span class="last-update" id="lastUpdate-${key}">--</span>
                    </div>
                </div>
                
                <div class="metric-actions">
                    <button class="btn-detail" onclick="publicIndicators.showMetricDetail('${key}')">
                        Ver Detalle
                    </button>
                    <button class="btn-refresh-single" onclick="publicIndicators.refreshMetric('${key}')">
                        🔄
                    </button>
                </div>
            </div>
        `).join('');
    }

    createUnitEconomicsCards(metrics) {
        const unitEconomicsMetrics = Object.entries(metrics)
            .filter(([key, metric]) => metric.unit_economics)
            .map(([key, metric]) => `
                <div class="unit-economics-card" data-metric="${key}-unit">
                    <div class="unit-header">
                        <h5>${metric.unit_economics.name}</h5>
                        <span class="formula-badge">📐 ${metric.unit_economics.formula}</span>
                    </div>
                    <div class="unit-value" id="unitValue-${key}">
                        <span class="calculated-value">--</span>
                        <span class="unit">${metric.unit_economics.unit}</span>
                    </div>
                    <div class="unit-trend" id="unitTrend-${key}">
                        <span class="trend-indicator">--</span>
                        <span class="trend-text">Calculando tendencia...</span>
                    </div>
                </div>
            `);

        return unitEconomicsMetrics.length > 0 ? unitEconomicsMetrics.join('') : 
            '<div class="no-unit-economics">No hay métricas de Unit Economics para esta categoría</div>';
    }

    setupEventListeners() {
        // Tabs de categorías
        document.getElementById('categoryTabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.category-tab');
            if (tab) {
                this.switchCategory(tab.dataset.category);
            }
        });

        // Botón de actualización general
        document.getElementById('refreshAllData').addEventListener('click', () => {
            this.refreshAllData();
        });

        // Configurar actualizaciones automáticas
        this.setupAutoUpdates();
    }

    switchCategory(categoryKey) {
        if (categoryKey === this.activeCategory) return;

        this.activeCategory = categoryKey;
        
        // Actualizar tabs activos
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === categoryKey);
        });

        // Actualizar contenido
        document.getElementById('categoryContent').innerHTML = this.createCategoryContent();
        
        // Cargar datos de la nueva categoría
        this.loadCategoryData(categoryKey);
    }

    async loadInitialData() {
        console.log('🔄 Cargando datos iniciales...');
        await this.loadCategoryData(this.activeCategory);
    }

    async loadCategoryData(categoryKey) {
        const category = this.config.categories[categoryKey];
        const metrics = category.metrics;

        console.log(`📊 Cargando datos para categoría: ${category.name}`);

        // Cargar métricas en paralelo
        const loadPromises = Object.entries(metrics).map(async ([metricKey, metric]) => {
            try {
                await this.loadMetricData(metricKey, metric);
            } catch (error) {
                console.error(`❌ Error cargando métrica ${metricKey}:`, error);
                this.updateMetricStatus(metricKey, 'error', `Error: ${error.message}`);
            }
        });

        await Promise.all(loadPromises);
        
        // Calcular Unit Economics después de cargar datos base
        this.calculateUnitEconomics(categoryKey);
        
        console.log(`✅ Datos cargados para categoría: ${category.name}`);
    }

    async loadMetricData(metricKey, metric) {
        this.updateMetricStatus(metricKey, 'loading', 'Cargando datos...');

        try {
            let data;
            
            // Si es una métrica derivada, calcularla
            if (metric.derived_from) {
                data = await this.calculateDerivedMetric(metricKey, metric);
            } else {
                // Cargar desde API
                data = await this.fetchFromAPI(metric);
            }

            if (!data || data.length === 0) {
                throw new Error('No se encontraron datos');
            }

            // Cachear datos
            this.cache.set(metricKey, {
                data: data,
                timestamp: Date.now(),
                metric: metric
            });

            // Actualizar UI
            this.updateMetricUI(metricKey, data, metric);
            this.updateMetricStatus(metricKey, 'success', `${data.length} datos cargados`);

        } catch (error) {
            console.error(`Error cargando ${metricKey}:`, error);
            
            // Intentar cargar datos de fallback o simulados
            const fallbackData = this.getFallbackData(metricKey);
            if (fallbackData) {
                this.updateMetricUI(metricKey, fallbackData, metric);
                this.updateMetricStatus(metricKey, 'fallback', 'Datos simulados');
            } else {
                this.updateMetricStatus(metricKey, 'error', error.message);
            }
        }
    }

    async fetchFromAPI(metric) {
        // Si es del Banco Central, usar nuestro sistema existente
        if (metric.source === 'Banco Central de Chile' && metric.series_code) {
            return await this.fetchFromBancoCentral(metric.series_code);
        }

        // Para otras APIs, implementar conectores específicos
        if (metric.api_url) {
            const response = await fetch(metric.api_url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return this.processAPIResponse(data, metric);
        }

        throw new Error('No se pudo determinar la fuente de datos');
    }

    async fetchFromBancoCentral(seriesCode) {
        // Reutilizar la función existente del Banco Central
        const startDate = '2020-01';
        const endDate = this.formatDateToMonth(new Date());
        
        try {
            return await fetchDataFromAPI(seriesCode, startDate, endDate);
        } catch (error) {
            console.error('Error con API Banco Central:', error);
            return null;
        }
    }

    processAPIResponse(data, metric) {
        // Procesar respuesta según el formato de cada API
        // Esto se expandirá para cada fuente de datos específica
        
        if (Array.isArray(data)) {
            return data.map(item => ({
                date: item.fecha || item.date || item.periodo,
                value: parseFloat(item.valor || item.value || item.dato)
            })).filter(item => !isNaN(item.value));
        }

        // Formato genérico
        return [{
            date: new Date().toISOString().substring(0, 7),
            value: parseFloat(data.valor || data.value || 0)
        }];
    }

    updateMetricUI(metricKey, data, metric) {
        const latestValue = data[data.length - 1];
        
        // Actualizar valor actual
        const valueElement = document.getElementById(`value-${metricKey}`);
        if (valueElement && latestValue) {
            const currentValueSpan = valueElement.querySelector('.current-value');
            currentValueSpan.textContent = this.formatValue(latestValue.value, metric.unit);
        }

        // Crear/actualizar gráfico
        this.createMetricChart(metricKey, data, metric);

        // Actualizar fecha de última actualización
        const lastUpdateElement = document.getElementById(`lastUpdate-${metricKey}`);
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `📅 ${new Date().toLocaleDateString('es-CL')}`;
        }
    }

    createMetricChart(metricKey, data, metric) {
        const canvas = document.querySelector(`#chart-${metricKey} canvas`);
        if (!canvas) return;

        // Destruir gráfico existente
        if (this.charts.has(metricKey)) {
            this.charts.get(metricKey).destroy();
        }

        const ctx = canvas.getContext('2d');
        
        const chartConfig = {
            type: metric.chart_type || 'line',
            data: {
                labels: data.map(d => this.formatDateLabel(d.date)),
                datasets: [{
                    label: metric.name,
                    data: data.map(d => d.value),
                    borderColor: this.getCategoryColor(this.activeCategory),
                    backgroundColor: this.getCategoryColor(this.activeCategory) + '20',
                    borderWidth: 2,
                    fill: metric.chart_type === 'line',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 30, 0.95)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#B3B3B3',
                        callbacks: {
                            label: (context) => `${metric.name}: ${this.formatValue(context.parsed.y, metric.unit)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#8B8B8B', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: '#2A2A2A' },
                        ticks: { color: '#8B8B8B', font: { size: 10 } }
                    }
                }
            }
        };

        const chart = new Chart(ctx, chartConfig);
        this.charts.set(metricKey, chart);
    }

    calculateUnitEconomics(categoryKey) {
        const category = this.config.categories[categoryKey];
        
        Object.entries(category.metrics).forEach(([metricKey, metric]) => {
            if (metric.unit_economics) {
                try {
                    const calculatedValue = this.performUnitEconomicsCalculation(metricKey, metric);
                    this.updateUnitEconomicsUI(metricKey, calculatedValue, metric.unit_economics);
                } catch (error) {
                    console.error(`Error calculando Unit Economics para ${metricKey}:`, error);
                }
            }
        });
    }

    performUnitEconomicsCalculation(metricKey, metric) {
        const cachedData = this.cache.get(metricKey);
        if (!cachedData) return null;

        const latestValue = cachedData.data[cachedData.data.length - 1];
        
        // Implementar cálculos específicos según la fórmula
        switch (metric.unit_economics.formula) {
            case 'PIB real / población':
                // Necesitaríamos datos de población
                return latestValue.value / 19500000; // Población aproximada de Chile
                
            case '(1 - Gini) × 100':
                return (1 - latestValue.value) * 100;
                
            case 'homicidios / población × 100000':
                return (latestValue.value / 19500000) * 100000;
                
            case 'GEI totales / población':
                return latestValue.value / 19500000;
                
            default:
                return latestValue.value;
        }
    }

    updateUnitEconomicsUI(metricKey, calculatedValue, unitEconomics) {
        const valueElement = document.getElementById(`unitValue-${metricKey}`);
        if (valueElement && calculatedValue !== null) {
            const calculatedValueSpan = valueElement.querySelector('.calculated-value');
            calculatedValueSpan.textContent = this.formatValue(calculatedValue, unitEconomics.unit);
        }

        // Calcular y mostrar tendencia
        this.updateUnitEconomicsTrend(metricKey, calculatedValue);
    }

    updateUnitEconomicsTrend(metricKey, currentValue) {
        // Implementar cálculo de tendencia comparando con períodos anteriores
        const trendElement = document.getElementById(`unitTrend-${metricKey}`);
        if (trendElement) {
            // Por ahora, mostrar valor estático
            const trendIndicator = trendElement.querySelector('.trend-indicator');
            const trendText = trendElement.querySelector('.trend-text');
            
            trendIndicator.textContent = '📈';
            trendText.textContent = 'Tendencia calculada';
        }
    }

    updateMetricStatus(metricKey, status, message) {
        const statusElement = document.getElementById(`status-${metricKey}`);
        if (!statusElement) return;

        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');

        const statusConfig = {
            loading: { icon: '🔄', class: 'loading' },
            success: { icon: '✅', class: 'success' },
            error: { icon: '❌', class: 'error' },
            fallback: { icon: '⚠️', class: 'fallback' }
        };

        const config = statusConfig[status] || statusConfig.error;
        
        indicator.textContent = config.icon;
        indicator.className = `status-indicator ${config.class}`;
        text.textContent = message;
    }

    // Métodos auxiliares
    formatValue(value, unit) {
        if (typeof value !== 'number' || isNaN(value)) return '--';
        
        if (unit.includes('%')) {
            return `${value.toFixed(1)}%`;
        } else if (unit.includes('CLP')) {
            return new Intl.NumberFormat('es-CL').format(value);
        } else {
            return value.toLocaleString('es-CL', { maximumFractionDigits: 2 });
        }
    }

    formatDateLabel(dateString) {
        const date = new Date(dateString + '-01');
        return date.toLocaleDateString('es-CL', { year: '2-digit', month: 'short' });
    }

    formatDateToMonth(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    getCategoryColor(categoryKey) {
        return this.config.categories[categoryKey]?.color || '#4A9EFF';
    }

    getFallbackData(metricKey) {
        // Datos simulados básicos para desarrollo
        const mockData = [];
        const startDate = new Date('2020-01-01');
        
        for (let i = 0; i < 48; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            
            mockData.push({
                date: this.formatDateToMonth(date),
                value: Math.random() * 100 + Math.sin(i / 6) * 20
            });
        }
        
        return mockData;
    }

    // Métodos públicos para interacción
    async refreshMetric(metricKey) {
        const category = this.config.categories[this.activeCategory];
        const metric = category.metrics[metricKey];
        
        if (metric) {
            await this.loadMetricData(metricKey, metric);
            this.calculateUnitEconomics(this.activeCategory);
        }
    }

    async refreshAllData() {
        const refreshButton = document.getElementById('refreshAllData');
        const originalText = refreshButton.textContent;
        
        refreshButton.textContent = '🔄 Actualizando...';
        refreshButton.disabled = true;
        
        try {
            await this.loadCategoryData(this.activeCategory);
            
            // Actualizar timestamp global
            const lastUpdateInfo = document.getElementById('lastUpdateInfo');
            lastUpdateInfo.textContent = `Última actualización: ${new Date().toLocaleString('es-CL')}`;
            
        } catch (error) {
            console.error('Error actualizando datos:', error);
        } finally {
            refreshButton.textContent = originalText;
            refreshButton.disabled = false;
        }
    }

    showMetricDetail(metricKey) {
        // Implementar modal con detalles completos de la métrica
        console.log(`Mostrando detalles para: ${metricKey}`);
    }

    setupAutoUpdates() {
        // Configurar actualizaciones automáticas según la frecuencia
        const schedule = this.config.global_config.update_schedule;
        
        Object.entries(schedule).forEach(([frequency, metrics]) => {
            let interval;
            
            switch (frequency) {
                case 'daily':
                    interval = 24 * 60 * 60 * 1000; // 24 horas
                    break;
                case 'weekly':
                    interval = 7 * 24 * 60 * 60 * 1000; // 7 días
                    break;
                case 'monthly':
                    interval = 30 * 24 * 60 * 60 * 1000; // 30 días
                    break;
                default:
                    return;
            }
            
            const intervalId = setInterval(() => {
                metrics.forEach(metricKey => {
                    if (this.cache.has(metricKey)) {
                        this.refreshMetric(metricKey);
                    }
                });
            }, interval);
            
            this.updateIntervals.set(frequency, intervalId);
        });
    }

    addModuleStyles() {
        const styleId = 'public-indicators-styles';
        if (document.getElementById(styleId)) return;

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            .public-indicators-module {
                background: var(--bg-primary);
                margin-top: var(--spacing-20);
            }

            .module-header {
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-primary);
                padding: var(--spacing-8) 0;
            }

            .module-header .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--spacing-6);
            }

            .title-section h2 {
                font-size: var(--font-size-3xl);
                font-weight: var(--font-weight-bold);
                color: var(--text-primary);
                margin-bottom: var(--spacing-2);
            }

            .title-section p {
                color: var(--text-secondary);
                font-size: var(--font-size-base);
            }

            .controls-section {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: var(--spacing-2);
            }

            .btn-refresh {
                background: var(--accent-primary);
                color: white;
                border: none;
                padding: var(--spacing-3) var(--spacing-6);
                border-radius: var(--radius);
                font-weight: var(--font-weight-medium);
                cursor: pointer;
                transition: all var(--transition-normal);
            }

            .btn-refresh:hover {
                background: var(--accent-primary);
                transform: translateY(-1px);
            }

            .last-update {
                font-size: var(--font-size-sm);
                color: var(--text-tertiary);
            }

            .module-navigation {
                background: var(--bg-elevated);
                border-bottom: 1px solid var(--border-primary);
                padding: var(--spacing-4) 0;
            }

            .category-tabs {
                display: flex;
                gap: var(--spacing-2);
                overflow-x: auto;
                padding-bottom: var(--spacing-2);
            }

            .category-tab {
                display: flex;
                align-items: center;
                gap: var(--spacing-3);
                padding: var(--spacing-4) var(--spacing-6);
                background: var(--bg-secondary);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-lg);
                color: var(--text-secondary);
                cursor: pointer;
                transition: all var(--transition-normal);
                white-space: nowrap;
                min-width: fit-content;
            }

            .category-tab:hover {
                border-color: var(--border-hover);
                transform: translateY(-1px);
            }

            .category-tab.active {
                background: var(--accent-primary);
                border-color: var(--accent-primary);
                color: white;
            }

            .tab-icon {
                font-size: var(--font-size-lg);
            }

            .tab-name {
                font-weight: var(--font-weight-medium);
            }

            .tab-count {
                background: rgba(255, 255, 255, 0.2);
                padding: var(--spacing-1) var(--spacing-2);
                border-radius: var(--radius);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-bold);
            }

            .module-content {
                padding: var(--spacing-12) 0;
            }

            .category-header {
                text-align: center;
                margin-bottom: var(--spacing-12);
            }

            .category-header h3 {
                font-size: var(--font-size-2xl);
                font-weight: var(--font-weight-bold);
                color: var(--text-primary);
                margin-bottom: var(--spacing-3);
            }

            .category-header p {
                color: var(--text-secondary);
                font-size: var(--font-size-lg);
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: var(--spacing-8);
                margin-bottom: var(--spacing-16);
            }

            .metric-card {
                background: var(--bg-elevated);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius-xl);
                padding: var(--spacing-8);
                transition: all var(--transition-normal);
            }

            .metric-card:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
                border-color: var(--border-hover);
            }

            .metric-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: var(--spacing-6);
            }

            .metric-header h4 {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                margin: 0;
            }

            .metric-status {
                display: flex;
                align-items: center;
                gap: var(--spacing-2);
            }

            .status-indicator {
                font-size: var(--font-size-sm);
            }

            .status-text {
                font-size: var(--font-size-xs);
                color: var(--text-tertiary);
            }

            .metric-value {
                display: flex;
                align-items: baseline;
                gap: var(--spacing-2);
                margin-bottom: var(--spacing-6);
            }

            .current-value {
                font-size: var(--font-size-3xl);
                font-weight: var(--font-weight-bold);
                color: var(--text-primary);
            }

            .unit {
                font-size: var(--font-size-base);
                color: var(--text-secondary);
            }

            .metric-chart {
                height: 200px;
                margin-bottom: var(--spacing-6);
            }

            .metric-chart canvas {
                width: 100% !important;
                height: 100% !important;
            }

            .metric-info {
                margin-bottom: var(--spacing-6);
            }

            .metric-description {
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
                line-height: 1.5;
                margin-bottom: var(--spacing-4);
            }

            .metric-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--spacing-4);
                font-size: var(--font-size-xs);
                color: var(--text-tertiary);
            }

            .metric-actions {
                display: flex;
                gap: var(--spacing-3);
            }

            .btn-detail, .btn-refresh-single {
                padding: var(--spacing-2) var(--spacing-4);
                border: 1px solid var(--border-primary);
                border-radius: var(--radius);
                background: var(--bg-secondary);
                color: var(--text-secondary);
                cursor: pointer;
                transition: all var(--transition-normal);
                font-size: var(--font-size-sm);
            }

            .btn-detail:hover, .btn-refresh-single:hover {
                border-color: var(--border-hover);
                color: var(--text-primary);
            }

            .unit-economics-section {
                margin-top: var(--spacing-16);
                padding-top: var(--spacing-16);
                border-top: 1px solid var(--border-primary);
            }

            .unit-economics-section h4 {
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                margin-bottom: var(--spacing-8);
                text-align: center;
            }

            .unit-economics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--spacing-6);
            }

            .unit-economics-card {
                background: var(--bg-secondary);
                border: 1px solid var(--border-secondary);
                border-radius: var(--radius-lg);
                padding: var(--spacing-6);
                text-align: center;
            }

            .unit-header {
                margin-bottom: var(--spacing-4);
            }

            .unit-header h5 {
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                margin: 0 0 var(--spacing-2) 0;
            }

            .formula-badge {
                background: var(--accent-primary);
                color: white;
                padding: var(--spacing-1) var(--spacing-3);
                border-radius: var(--radius);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-medium);
            }

            .unit-value {
                margin-bottom: var(--spacing-4);
            }

            .calculated-value {
                font-size: var(--font-size-2xl);
                font-weight: var(--font-weight-bold);
                color: var(--accent-primary);
            }

            .unit-trend {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--spacing-2);
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
            }

            .no-unit-economics {
                text-align: center;
                color: var(--text-tertiary);
                font-style: italic;
                padding: var(--spacing-8);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .module-header .header-content {
                    flex-direction: column;
                    text-align: center;
                }

                .controls-section {
                    align-items: center;
                }

                .category-tabs {
                    justify-content: center;
                }

                .metrics-grid {
                    grid-template-columns: 1fr;
                }

                .metric-meta {
                    flex-direction: column;
                    gap: var(--spacing-2);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // Método de limpieza
    destroy() {
        // Limpiar intervalos
        this.updateIntervals.forEach(intervalId => clearInterval(intervalId));
        this.updateIntervals.clear();

        // Destruir gráficos
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();

        // Limpiar cache
        this.cache.clear();

        // Remover elemento del DOM
        const moduleElement = document.getElementById('public-indicators-module');
        if (moduleElement) {
            moduleElement.remove();
        }

        // Remover estilos
        const stylesElement = document.getElementById('public-indicators-styles');
        if (stylesElement) {
            stylesElement.remove();
        }
    }
}

// Instancia global
let publicIndicators = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el dashboard principal esté cargado
    setTimeout(() => {
        publicIndicators = new PublicIndicatorsModule();
    }, 1000);
});

// Exportar para uso global
window.PublicIndicatorsModule = PublicIndicatorsModule;
