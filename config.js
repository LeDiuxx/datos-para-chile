// Configuración de la aplicación "Datos para Chile"
const APP_CONFIG = {
    // Información de la aplicación
    name: 'Datos para Chile',
    version: '1.0.0',
    description: 'Dashboard de transparencia gubernamental para todos los chilenos',
    
    // Configuración de la API del Banco Central de Chile
    api: {
        baseURL: 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx',
        credentials: {
            user: 'vittocaridi@gmail.com',
            pass: 'Cardixx7'
        },
        // Códigos de series del Banco Central
        series: {
            // Indicadores económicos principales
            pib_real: 'F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T',
            pib_nominal: 'F032.PIB.FLU.N.CLP.EP18.Z.Z.0.T',
            crecimiento_pib: 'F032.PIB.VAR.R.EP18.Z.Z.0.A',
            
            // Mercado laboral
            desempleo_total: 'F073.TCO.PRO.M.0.15_Y_MAS.T',
            desempleo_hombres: 'F073.TCO.PRO.M.1.15_Y_MAS.T',
            desempleo_mujeres: 'F073.TCO.PRO.M.2.15_Y_MAS.T',
            participacion_laboral: 'F073.TPL.PRO.M.0.15_Y_MAS.T',
            
            // Precios e inflación
            ipc_general: 'F073.IPC.FLU.M.N.CLP.EP18.Z.Z.0.M',
            ipc_variacion: 'F073.IPC.VAR.M.0.CLP.EP18.Z.Z.0.M',
            inflacion_anual: 'F073.IPC.VAR.A.0.CLP.EP18.Z.Z.0.M',
            
            // Sector externo
            tipo_cambio: 'F073.TCN.PRO.D.0.USD.EP09.0.D',
            exportaciones: 'F051.CBA.FLU.M.CLP.0.T.0.46.T',
            importaciones: 'F051.CBA.FLU.M.CLP.0.T.1.46.T',
            
            // Sector fiscal
            ingresos_fiscales: 'F031.GCG.FLU.M.CLP.0.T.4.T.T.T.T',
            gastos_fiscales: 'F031.GCG.FLU.M.CLP.1.T.4.T.T.T.T',
            
            // Indicadores monetarios
            tasa_politica: 'F073.TPM.FLU.D.0.CLP.EP09.Z.0.D',
            m1: 'F074.M1.SAL.M.CLP.EP18.Z.0.M',
            creditos: 'F060.BCO.SAL.M.CLP.EP18.T.T.T.T.T'
        }
    },
    
    // Configuración de períodos
    periods: {
        government: {
            name: 'Gobierno Actual',
            start: '2022-03',
            description: 'Desde el inicio del gobierno de Gabriel Boric'
        },
        year: {
            name: 'Último Año',
            months: 12,
            description: 'Últimos 12 meses'
        },
        quarter: {
            name: 'Último Trimestre',
            months: 3,
            description: 'Últimos 3 meses'
        },
        semester: {
            name: 'Último Semestre',
            months: 6,
            description: 'Últimos 6 meses'
        }
    },
    
    // Promesas presidenciales y metas
    promises: [
        {
            id: 'pension_basica',
            category: 'Seguridad Social',
            title: 'Aumentar pensión básica solidaria',
            description: 'Incrementar la pensión básica solidaria en $15.000',
            target: 15000,
            current: 15000,
            status: 'completed',
            deadline: '2023-01',
            source: 'Programa de Gobierno 2022-2026'
        },
        {
            id: 'viviendas',
            category: 'Vivienda',
            title: 'Construir 260.000 viviendas',
            description: 'Construcción de viviendas sociales durante el período presidencial',
            target: 260000,
            current: 89000,
            status: 'in_progress',
            deadline: '2026-03',
            source: 'Programa de Gobierno 2022-2026'
        },
        {
            id: 'listas_espera',
            category: 'Salud',
            title: 'Reducir listas de espera en salud',
            description: 'Disminuir en 50% las listas de espera para cirugías electivas',
            target: 50,
            current: 15,
            status: 'in_progress',
            deadline: '2025-12',
            source: 'Programa de Gobierno 2022-2026'
        },
        {
            id: 'reforma_tributaria',
            category: 'Economía',
            title: 'Reforma tributaria',
            description: 'Implementar reforma tributaria para mayor equidad',
            target: 100,
            current: 5,
            status: 'pending',
            deadline: '2024-12',
            source: 'Programa de Gobierno 2022-2026'
        },
        {
            id: 'salario_minimo',
            category: 'Trabajo',
            title: 'Aumentar salario mínimo',
            description: 'Llegar a $500.000 de salario mínimo',
            target: 500000,
            current: 460000,
            status: 'in_progress',
            deadline: '2026-03',
            source: 'Programa de Gobierno 2022-2026'
        }
    ],
    
    // Metas económicas del gobierno
    economicTargets: {
        growth: {
            target: 3.0,
            description: 'Crecimiento del PIB anual promedio',
            unit: '%'
        },
        unemployment: {
            target: 7.0,
            description: 'Tasa de desempleo objetivo',
            unit: '%'
        },
        inflation: {
            min: 2.0,
            max: 4.0,
            description: 'Rango meta de inflación del Banco Central',
            unit: '%'
        }
    },
    
    // Configuración de gráficos
    charts: {
        colors: {
            primary: '#0033A0',
            secondary: '#D52B1E',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            info: '#3B82F6'
        },
        defaultOptions: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    },
    
    // Configuración de evaluación
    scoring: {
        // Criterios para calificar el desempeño económico
        economic: {
            growth: {
                excellent: { min: 3.5, score: 9 },
                good: { min: 2.5, max: 3.5, score: 7 },
                fair: { min: 1.5, max: 2.5, score: 5 },
                poor: { max: 1.5, score: 3 }
            },
            unemployment: {
                excellent: { max: 6.0, score: 9 },
                good: { min: 6.0, max: 7.0, score: 7 },
                fair: { min: 7.0, max: 8.5, score: 5 },
                poor: { min: 8.5, score: 3 }
            },
            inflation: {
                excellent: { min: 2.0, max: 3.0, score: 9 },
                good: { min: 1.5, max: 4.0, score: 7 },
                fair: { min: 1.0, max: 5.0, score: 5 },
                poor: { score: 3 } // Fuera de rango
            }
        },
        
        // Criterios para calificar cumplimiento de promesas
        promises: {
            weights: {
                completed: 1.0,
                in_progress: 0.6,
                pending: 0.1
            }
        }
    },
    
    // Configuración de datos simulados (para desarrollo)
    mockData: {
        enabled: true, // Cambiar a false cuando se use la API real
        updateInterval: 30000 // 30 segundos
    },
    
    // Configuración de la interfaz
    ui: {
        language: 'es-CL',
        dateFormat: {
            short: { year: '2-digit', month: 'short' },
            long: { year: 'numeric', month: 'long', day: 'numeric' }
        },
        numberFormat: {
            decimal: 1,
            currency: 'CLP'
        }
    },
    
    // URLs y enlaces externos
    externalLinks: {
        bancocentral: 'https://www.bcentral.cl',
        ine: 'https://www.ine.cl',
        hacienda: 'https://www.hacienda.cl',
        programa_gobierno: 'https://www.gob.cl/programa-de-gobierno/'
    }
};

// Exportar configuración para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
