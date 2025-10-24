// Configuración de la API del Banco Central de Chile
const API_CONFIG = {
    baseURL: 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx',
    credentials: {
        user: 'vittocaridi@gmail.com',
        pass: 'Cardixx7'
    },
    // Series del Banco Central (códigos reales)
    series: {
        // Crecimiento económico - PIB real trimestral
        growth: 'F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T',
        // Desempleo - Tasa de desocupación mensual
        unemployment: 'F073.TCO.PRO.M.0.15_Y_MAS.T', 
        // Inflación - IPC variación anual
        inflation: 'F073.IPC.VAR.A.0.CLP.EP18.Z.Z.0.M'
    },
    // Parámetros de la API según documentación
    params: {
        function: 'GetSeries'
    }
};

// Datos simulados para desarrollo (reemplazar con datos reales de la API)
const mockData = {
    growth: [
        { date: '2022-03', value: 1.8 },
        { date: '2022-06', value: 2.1 },
        { date: '2022-09', value: 1.9 },
        { date: '2022-12', value: 2.3 },
        { date: '2023-03', value: 2.0 },
        { date: '2023-06', value: 2.4 },
        { date: '2023-09', value: 2.2 },
        { date: '2023-12', value: 2.6 },
        { date: '2024-03', value: 2.1 },
        { date: '2024-06', value: 2.5 },
        { date: '2024-09', value: 2.3 }
    ],
    unemployment: [
        { date: '2022-03', value: 7.9 },
        { date: '2022-06', value: 8.1 },
        { date: '2022-09', value: 8.3 },
        { date: '2022-12', value: 8.0 },
        { date: '2023-03', value: 8.2 },
        { date: '2023-06', value: 8.4 },
        { date: '2023-09', value: 8.1 },
        { date: '2023-12', value: 7.8 },
        { date: '2024-03', value: 8.0 },
        { date: '2024-06', value: 8.2 },
        { date: '2024-09', value: 8.1 }
    ],
    inflation: [
        { date: '2022-03', value: 9.4 },
        { date: '2022-06', value: 12.5 },
        { date: '2022-09', value: 13.7 },
        { date: '2022-12', value: 12.8 },
        { date: '2023-03', value: 11.1 },
        { date: '2023-06', value: 8.9 },
        { date: '2023-09', value: 6.1 },
        { date: '2023-12', value: 4.9 },
        { date: '2024-03', value: 4.1 },
        { date: '2024-06', value: 3.8 },
        { date: '2024-09', value: 3.2 }
    ]
};

// Variables globales para los gráficos
let charts = {};
let useRealAPI = false; // Por defecto usar datos simulados

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    updatePeriodDisplay();
});

// Configurar event listeners
function setupEventListeners() {
    // Controles de período
    document.getElementById('startDate').addEventListener('change', updateCharts);
    document.getElementById('endDate').addEventListener('change', updateCharts);
    
    // Botón de prueba de API
    document.getElementById('testAPIButton').addEventListener('click', testAPIConnection);
    
    // Toggle de fuente de datos
    document.getElementById('dataSourceToggle').addEventListener('click', toggleDataSource);
    
    // Botones de período predefinido
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setPredefinedPeriod(this.dataset.period);
        });
    });
    
    // Checkboxes de líneas de tendencia
    document.getElementById('growthTrend').addEventListener('change', () => updateChart('growth'));
    document.getElementById('unemploymentTrend').addEventListener('change', () => updateChart('unemployment'));
    document.getElementById('inflationTrend').addEventListener('change', () => updateChart('inflation'));
}

// Función para probar la conexión con la API
async function testAPIConnection() {
    const button = document.getElementById('testAPIButton');
    const originalText = button.textContent;
    
    button.textContent = '🔄 Probando...';
    button.disabled = true;
    
    console.log('🧪 === INICIANDO PRUEBA DE API DEL BANCO CENTRAL ===');
    
    try {
        // Probar con una serie simple y período corto
        const testSeries = 'F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T'; // PIB
        const testStartDate = '2024-01';
        const testEndDate = '2024-03';
        
        console.log('🎯 Probando con serie de PIB (período corto)...');
        
        const result = await fetchDataFromAPI(testSeries, testStartDate, testEndDate);
        
        if (result && result.length > 0) {
            console.log('🎉 ¡ÉXITO! La API está funcionando');
            showAPISuccess(`API funcionando correctamente. ${result.length} datos obtenidos.`);
            
            // Activar automáticamente los datos reales
            useRealAPI = true;
            const toggleButton = document.getElementById('dataSourceToggle');
            toggleButton.textContent = '🔄 Datos: Banco Central';
            toggleButton.style.background = 'rgba(0, 212, 170, 0.2)';
            
        } else {
            console.log('⚠️ La API respondió pero sin datos válidos');
            showAPIError('La API respondió pero no devolvió datos válidos');
        }
        
    } catch (error) {
        console.log('❌ Error en la prueba de API:', error);
        showAPIError(`Error de conexión: ${error.message}`);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
        console.log('🧪 === FIN DE PRUEBA DE API ===');
    }
}

// Función para mostrar éxito de API
function showAPISuccess(message) {
    const existingSuccess = document.getElementById('api-success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.id = 'api-success-message';
    successDiv.innerHTML = `
        <div style="position: fixed; top: 80px; right: 20px; 
                    background: var(--bg-elevated); border: 1px solid var(--status-excellent); 
                    color: var(--text-primary); padding: 16px; border-radius: 12px; 
                    box-shadow: var(--shadow-lg); z-index: 1001; max-width: 400px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 20px;">✅</span>
                <strong>API del Banco Central</strong>
            </div>
            <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">
                ${message}
            </p>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        const existingDiv = document.getElementById('api-success-message');
        if (existingDiv && existingDiv.parentNode) {
            existingDiv.parentNode.removeChild(existingDiv);
        }
    }, 5000);
}

// Alternar entre datos reales y simulados
async function toggleDataSource() {
    const button = document.getElementById('dataSourceToggle');
    
    useRealAPI = !useRealAPI;
    
    if (useRealAPI) {
        button.textContent = '🔄 Datos: Banco Central';
        button.style.background = 'rgba(0, 212, 170, 0.2)';
        console.log('Cambiando a datos reales del Banco Central...');
    } else {
        button.textContent = '🔄 Datos: Simulados';
        button.style.background = 'var(--bg-tertiary)';
        console.log('Cambiando a datos simulados...');
    }
    
    // Actualizar todos los gráficos con la nueva fuente
    await updateChartsWithNewData();
}

// Establecer períodos predefinidos
function setPredefinedPeriod(period) {
    const now = new Date();
    let startDate, endDate;
    
    switch(period) {
        case 'government':
            startDate = '2022-03';
            endDate = formatDateToMonth(now);
            break;
        case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth());
            startDate = formatDateToMonth(yearAgo);
            endDate = formatDateToMonth(now);
            break;
        case 'quarter':
            const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3);
            startDate = formatDateToMonth(quarterAgo);
            endDate = formatDateToMonth(now);
            break;
    }
    
    document.getElementById('startDate').value = startDate;
    document.getElementById('endDate').value = endDate;
    updateCharts();
}

// Formatear fecha a YYYY-MM
function formatDateToMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Actualizar display del período
function updatePeriodDisplay() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate + '-01');
        const end = new Date(endDate + '-01');
        const startText = start.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
        const endText = end.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
        
        document.getElementById('periodSelector').textContent = `📅 ${startText} - ${endText}`;
    }
}

// Inicializar todos los gráficos
function initializeCharts() {
    createChart('growthChart', 'growth', 'Crecimiento del PIB (%)', 'line', '#10B981');
    createChart('unemploymentChart', 'unemployment', 'Tasa de Desempleo (%)', 'line', '#F59E0B');
    createChart('inflationChart', 'inflation', 'Inflación Anual (%)', 'line', '#EF4444');
}

// Crear un gráfico individual con tema oscuro
function createChart(canvasId, dataKey, label, type, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const data = filterDataByPeriod(mockData[dataKey]);
    
    // Configuración de colores para dark theme
    const darkThemeColors = {
        growth: '#00D4AA',
        unemployment: '#FFB800', 
        inflation: '#FF6B6B'
    };
    
    const chartColor = darkThemeColors[dataKey] || color;
    
    charts[dataKey] = new Chart(ctx, {
        type: type,
        data: {
            labels: data.map(d => formatDateLabel(d.date)),
            datasets: [{
                label: label,
                data: data.map(d => d.value),
                borderColor: chartColor,
                backgroundColor: chartColor + '15',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColor,
                pointBorderColor: '#1E1E1E',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: chartColor,
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#B3B3B3',
                    borderColor: chartColor,
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: false,
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `${label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#8B8B8B',
                        font: {
                            size: 11,
                            weight: '500'
                        }
                    },
                    border: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        color: '#2A2A2A',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#8B8B8B',
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        padding: 8,
                        callback: function(value) {
                            return value.toFixed(1) + '%';
                        }
                    },
                    border: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1200,
                easing: 'easeInOutQuart'
            },
            elements: {
                line: {
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                }
            }
        }
    });
}

// Actualizar un gráfico específico
async function updateChart(dataKey) {
    if (!charts[dataKey]) return;
    
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Obtener datos según la fuente seleccionada
    const data = await getData(dataKey, startDate, endDate, useRealAPI);
    const showTrend = document.getElementById(`${dataKey}Trend`).checked;
    
    // Actualizar datos principales
    charts[dataKey].data.labels = data.map(d => formatDateLabel(d.date));
    charts[dataKey].data.datasets[0].data = data.map(d => d.value);
    
    // Agregar o quitar línea de tendencia
    if (showTrend) {
        addTrendLine(charts[dataKey], data, dataKey);
    } else {
        removeTrendLine(charts[dataKey]);
    }
    
    charts[dataKey].update('active');
}

// Actualizar todos los gráficos con nueva fuente de datos
async function updateChartsWithNewData() {
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 1000;">
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🔄</div>
                <div>${useRealAPI ? 'Cargando datos del Banco Central...' : 'Cargando datos simulados...'}</div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingMessage);
    
    try {
        await Promise.all([
            updateChart('growth'),
            updateChart('unemployment'),
            updateChart('inflation')
        ]);
        
        // Actualizar insights con los nuevos datos
        updateInsights();
        
    } catch (error) {
        console.error('Error actualizando gráficos:', error);
        
        // Mostrar mensaje de error
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; 
                        background: #EF4444; color: white; padding: 15px; border-radius: 8px; z-index: 1001;">
                ❌ Error cargando datos del Banco Central. Usando datos simulados.
            </div>
        `;
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            document.body.removeChild(errorMessage);
        }, 5000);
        
    } finally {
        // Remover mensaje de carga
        if (document.getElementById('loading-message')) {
            document.body.removeChild(loadingMessage);
        }
    }
}

// Actualizar todos los gráficos
async function updateCharts() {
    updatePeriodDisplay();
    await Promise.all([
        updateChart('growth'),
        updateChart('unemployment'),
        updateChart('inflation')
    ]);
}

// Filtrar datos por período seleccionado
function filterDataByPeriod(data) {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) return data;
    
    return data.filter(d => d.date >= startDate && d.date <= endDate);
}

// Formatear etiquetas de fecha
function formatDateLabel(dateString) {
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('es-CL', { 
        year: '2-digit', 
        month: 'short' 
    });
}

// Agregar línea de tendencia
function addTrendLine(chart, data, dataKey) {
    // Remover línea de tendencia existente
    removeTrendLine(chart);
    
    // Calcular regresión lineal
    const trendData = calculateLinearRegression(data);
    
    // Color de la línea de tendencia
    const trendColors = {
        growth: '#059669',
        unemployment: '#D97706', 
        inflation: '#DC2626'
    };
    
    // Agregar dataset de tendencia
    chart.data.datasets.push({
        label: 'Tendencia',
        data: trendData,
        borderColor: trendColors[dataKey],
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0
    });
}

// Remover línea de tendencia
function removeTrendLine(chart) {
    chart.data.datasets = chart.data.datasets.filter(dataset => dataset.label !== 'Tendencia');
}

// Calcular regresión lineal simple
function calculateLinearRegression(data) {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.value);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return x.map(xi => slope * xi + intercept);
}

// Función para hacer fetch con proxy local y fallbacks
async function fetchWithCORSProxy(url) {
    // Extraer parámetros de la URL original
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    // Detectar si estamos en producción o desarrollo
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const baseURL = isProduction ? '' : 'http://localhost:3000';
    
    const proxies = [
        // Proxy 1: Nuestro servidor (producción o desarrollo)
        {
            name: isProduction ? 'Servidor Producción' : 'Servidor Local',
            url: `${baseURL}/api/bcentral?${params.toString()}`,
            isLocal: !isProduction,
            isPrimary: true
        },
        // Proxy 2: Servidor local de desarrollo (solo en desarrollo)
        ...(!isProduction ? [{
            name: 'Proxy Local Dev',
            url: `http://localhost:8001/api/bcentral?${params.toString()}`,
            isLocal: true
        }] : []),
        // Proxy 3: AllOrigins (backup)
        {
            name: 'AllOrigins',
            url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            isLocal: false
        },
        // Proxy 4: Intento directo (último recurso)
        {
            name: 'Directo',
            url: url,
            isLocal: false,
            isDirect: true
        }
    ];
    
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        
        try {
            console.log(`🔄 Intentando ${proxy.name} (${i + 1}/${proxies.length})`);
            
            const fetchOptions = proxy.isDirect ? {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            } : {};
            
            const response = await fetch(proxy.url, fetchOptions);
            
            if (response.ok) {
                console.log(`✅ Éxito con ${proxy.name}`);
                return response;
            } else {
                console.log(`❌ ${proxy.name} falló:`, response.status);
                
                // Si es el proxy local, dar instrucciones
                if (proxy.isLocal && (response.status === 0 || !response.ok)) {
                    console.log('💡 Para usar el proxy local, ejecuta: python3 proxy-server.py');
                }
            }
        } catch (error) {
            console.log(`❌ Error en ${proxy.name}:`, error.message);
            
            // Si es el proxy local, dar instrucciones específicas
            if (proxy.isLocal) {
                console.log('💡 Proxy local no disponible. Para iniciarlo:');
                console.log('   1. Abre una nueva terminal');
                console.log('   2. cd /Users/vicentecaridi/Desktop/Programación/JavaScript');
                console.log('   3. python3 proxy-server.py');
                showProxyInstructions();
            }
            
            if (i === proxies.length - 1) {
                throw error; // Si es el último intento, lanzar el error
            }
        }
    }
}

// Función para mostrar instrucciones del proxy
function showProxyInstructions() {
    const existingInstructions = document.getElementById('proxy-instructions');
    if (existingInstructions) return; // No mostrar múltiples veces
    
    const instructionsDiv = document.createElement('div');
    instructionsDiv.id = 'proxy-instructions';
    instructionsDiv.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: var(--bg-elevated); border: 1px solid var(--accent-primary); 
                    color: var(--text-primary); padding: 24px; border-radius: 16px; 
                    box-shadow: var(--shadow-xl); z-index: 1002; max-width: 500px; width: 90%;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 24px;">🚀</span>
                <strong style="font-size: 18px;">Activar Proxy Local</strong>
            </div>
            <p style="margin: 0 0 16px 0; color: var(--text-secondary); line-height: 1.5;">
                Para conectar con la API del Banco Central, necesitas iniciar el servidor proxy local:
            </p>
            <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; margin: 16px 0; font-family: monospace; font-size: 14px;">
                <div>1. Abre una nueva terminal</div>
                <div>2. cd /Users/vicentecaridi/Desktop/Programación/JavaScript</div>
                <div>3. python3 proxy-server.py</div>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="document.getElementById('proxy-instructions').remove()" 
                        style="padding: 8px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-primary); 
                               border-radius: 6px; color: var(--text-primary); cursor: pointer;">
                    Entendido
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(instructionsDiv);
}

// Función para obtener datos reales de la API del Banco Central
async function fetchDataFromAPI(seriesCode, startDate, endDate) {
    try {
        // Formatear fechas para la API (YYYY-MM-DD)
        const formattedStartDate = startDate + '-01';
        const formattedEndDate = endDate + '-01';
        
        // Construir URL según la documentación oficial del Banco Central
        const url = `${API_CONFIG.baseURL}?user=${API_CONFIG.credentials.user}&pass=${API_CONFIG.credentials.pass}&firstdate=${formattedStartDate}&lastdate=${formattedEndDate}&timeseries=${seriesCode}&function=${API_CONFIG.params.function}`;
        
        console.log('🔄 Intentando conectar con API del Banco Central...');
        console.log('📊 Serie:', seriesCode);
        console.log('📅 Período:', formattedStartDate, 'a', formattedEndDate);
        console.log('🌐 URL:', url);
        
        // Intentar con múltiples proxies CORS
        const response = await fetchWithCORSProxy(url);
        
        console.log('📡 Respuesta HTTP:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        // Verificar si hay errores en la respuesta
        if (data.Codigo && data.Codigo < 0) {
            console.error('❌ Error de la API:', data.Descripcion);
            throw new Error(`API Error: ${data.Descripcion}`);
        }
        
        console.log('✅ Datos procesados exitosamente');
        return processAPIData(data);
    } catch (error) {
        console.error('❌ Error fetching data from API:', error);
        console.log('🔄 Usando datos simulados como fallback');
        
        // Mostrar error detallado al usuario
        showAPIError(error.message);
        
        // Fallback a datos simulados
        return null;
    }
}

// Función para mostrar errores de API al usuario
function showAPIError(errorMessage) {
    const existingError = document.getElementById('api-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'api-error-message';
    errorDiv.innerHTML = `
        <div style="position: fixed; top: 80px; right: 20px; 
                    background: var(--bg-elevated); border: 1px solid var(--status-danger); 
                    color: var(--text-primary); padding: 16px; border-radius: 12px; 
                    box-shadow: var(--shadow-lg); z-index: 1001; max-width: 400px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 20px;">⚠️</span>
                <strong>Error de API del Banco Central</strong>
            </div>
            <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">
                ${errorMessage}
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--text-tertiary);">
                Usando datos simulados temporalmente
            </p>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remover después de 8 segundos
    setTimeout(() => {
        const existingDiv = document.getElementById('api-error-message');
        if (existingDiv && existingDiv.parentNode) {
            existingDiv.parentNode.removeChild(existingDiv);
        }
    }, 8000);
}

// Procesar datos de la API del Banco Central
function processAPIData(apiData) {
    try {
        console.log('🔍 Procesando datos de la API...');
        console.log('📋 Estructura completa:', JSON.stringify(apiData, null, 2));
        
        // Verificar que la respuesta tenga la estructura esperada
        if (!apiData.Series) {
            console.warn('⚠️ No se encontró el campo "Series" en la respuesta');
            return [];
        }
        
        if (!apiData.Series.Obs) {
            console.warn('⚠️ No se encontró el campo "Obs" en Series');
            console.log('📊 Series disponibles:', Object.keys(apiData.Series));
            return [];
        }
        
        // Convertir observaciones de la API al formato interno
        const observations = Array.isArray(apiData.Series.Obs) ? apiData.Series.Obs : [apiData.Series.Obs];
        console.log(`📈 Procesando ${observations.length} observaciones`);
        
        const processedData = observations
            .map((obs, index) => {
                console.log(`📊 Observación ${index + 1}:`, obs);
                
                // Procesar fecha (puede venir en diferentes formatos)
                let dateStr = obs.indexDateString || obs.fecha || obs.date || obs.IndexDateString;
                if (dateStr) {
                    // Convertir a formato YYYY-MM si es necesario
                    if (dateStr.length === 10) { // YYYY-MM-DD
                        dateStr = dateStr.substring(0, 7); // YYYY-MM
                    } else if (dateStr.length === 8) { // YYYYMMDD
                        dateStr = dateStr.substring(0, 4) + '-' + dateStr.substring(4, 6);
                    }
                }
                
                // Procesar valor numérico
                const rawValue = obs.value || obs.valor || obs.Value || 0;
                const value = parseFloat(rawValue);
                
                console.log(`📅 Fecha: ${dateStr}, 💰 Valor: ${value}`);
                
                return {
                    date: dateStr,
                    value: isNaN(value) ? 0 : value
                };
            })
            .filter(item => item.date && !isNaN(item.value))
            .sort((a, b) => a.date.localeCompare(b.date)); // Ordenar por fecha
        
        console.log(`✅ Datos procesados: ${processedData.length} puntos válidos`);
        console.log('📊 Muestra de datos:', processedData.slice(0, 3));
        
        return processedData;
            
    } catch (error) {
        console.error('❌ Error procesando datos de la API:', error);
        return [];
    }
}

// Función para obtener datos (API real o simulados)
async function getData(dataType, startDate, endDate, useRealAPI = false) {
    if (useRealAPI) {
        const seriesCode = API_CONFIG.series[dataType];
        if (!seriesCode) {
            console.error(`Serie no encontrada para: ${dataType}`);
            return mockData[dataType] || [];
        }
        
        const apiData = await fetchDataFromAPI(seriesCode, startDate, endDate);
        if (apiData && apiData.length > 0) {
            return apiData;
        }
    }
    
    // Fallback a datos simulados
    return filterDataByPeriod(mockData[dataType] || []);
}

// Función para actualizar insights automáticamente
function updateInsights() {
    const latestGrowth = mockData.growth[mockData.growth.length - 1];
    const latestUnemployment = mockData.unemployment[mockData.unemployment.length - 1];
    const latestInflation = mockData.inflation[mockData.inflation.length - 1];
    
    // Actualizar insights basados en los últimos datos
    updateInsightText('growth', latestGrowth.value, 'crecimiento');
    updateInsightText('unemployment', latestUnemployment.value, 'desempleo');
    updateInsightText('inflation', latestInflation.value, 'inflación');
}

// Actualizar texto de insights
function updateInsightText(type, value, label) {
    const insights = {
        growth: {
            good: `La economía creció ${value}% el último trimestre, superando expectativas.`,
            warning: `El crecimiento económico de ${value}% está por debajo de las proyecciones.`,
            bad: `La economía muestra signos de desaceleración con ${value}% de crecimiento.`
        },
        unemployment: {
            good: `El desempleo bajó a ${value}%, acercándose a la meta del 7%.`,
            warning: `El desempleo está en ${value}%, aún sobre la meta del 7%.`,
            bad: `El desempleo subió a ${value}%, requiere atención urgente.`
        },
        inflation: {
            good: `La inflación está en ${value}%, dentro del rango meta del Banco Central (2-4%).`,
            warning: `La inflación de ${value}% está cerca del límite superior del rango meta.`,
            bad: `La inflación de ${value}% está fuera del rango meta del Banco Central.`
        }
    };
    
    let status = 'good';
    if (type === 'growth' && value < 2.0) status = value < 1.0 ? 'bad' : 'warning';
    if (type === 'unemployment' && value > 7.0) status = value > 9.0 ? 'bad' : 'warning';
    if (type === 'inflation' && (value < 2.0 || value > 4.0)) status = value > 6.0 || value < 1.0 ? 'bad' : 'warning';
    
    // Encontrar el elemento de insight y actualizar
    const chartContainer = document.querySelector(`#${type}Chart`).closest('.chart-container');
    const insightElement = chartContainer.querySelector('.chart-insight p');
    if (insightElement) {
        insightElement.textContent = insights[type][status];
    }
}

// Función para exportar gráficos
function exportChart(chartKey, filename) {
    const chart = charts[chartKey];
    if (!chart) return;
    
    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = url;
    link.click();
}

// Inicializar insights al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateInsights, 1000); // Esperar a que se carguen los gráficos
});
