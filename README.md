# 🇨🇱 Datos para Chile

**Dashboard de Transparencia Gubernamental**

Una plataforma ciudadana para evaluar el desempeño del gobierno chileno con datos claros y accesibles para todos.

## 🎯 Objetivo

Permitir que todos los chilenos puedan evaluar fácilmente cómo está trabajando su presidente, usando datos económicos reales y el seguimiento de promesas de campaña.

## 🚀 Características

### 📊 **Dashboard Económico**
- **Crecimiento Económico**: Evolución del PIB con líneas de tendencia
- **Desempleo**: Tasa de desocupación vs meta del 7%
- **Inflación**: IPC dentro del rango meta del Banco Central (2-4%)

### 🎯 **Seguimiento de Promesas**
- Sistema de semáforo visual (✅ Cumplidas, 🔄 En progreso, ⏳ Sin avance)
- Porcentajes de cumplimiento claros
- Promesas reales del programa de gobierno 2022-2026

### ⚙️ **Funcionalidades Avanzadas**
- **Períodos configurables**: Todo el gobierno, último año, trimestre
- **Líneas de tendencia**: Análisis predictivo automático
- **Datos reales**: Integración con API del Banco Central de Chile
- **Calificación automática**: Sistema de notas del 1-10
- **Responsive**: Funciona en móviles, tablets y computadores

## 🛠️ Instalación y Uso

### **Opción 1: Servidor Local Simple**
```bash
# Navegar al directorio del proyecto
cd /Users/vicentecaridi/Desktop/Programación/JavaScript

# Iniciar servidor HTTP simple
python3 -m http.server 8000

# Abrir en el navegador
open http://localhost:8000
```

### **Opción 2: Live Server (VS Code)**
1. Instalar extensión "Live Server" en VS Code
2. Abrir el archivo `index.html`
3. Click derecho → "Open with Live Server"

## 🔧 Configuración de la API

### **Banco Central de Chile**

La aplicación está configurada para usar la API oficial del Banco Central:

```javascript
const API_CONFIG = {
    baseURL: 'https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx',
    credentials: {
        user: 'vittocaridi@gmail.com',
        pass: 'Cardixx7'
    }
};
```

**Formato de consulta:**
```
https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=123456789&pass=tuPassword&firstdate=YYYY-MM-DD&lastdate=YYYY-MM-DD&timeseries=codigodeserie&function=GetSeries
```

### **Series Utilizadas:**
- **Crecimiento**: `F032.PIB.FLU.R.CLP.EP18.Z.Z.0.T` (PIB real trimestral)
- **Desempleo**: `F073.TCO.PRO.M.0.15_Y_MAS.T` (Tasa desocupación mensual)
- **Inflación**: `F073.IPC.VAR.A.0.CLP.EP18.Z.Z.0.M` (IPC variación anual)

## 🎮 Cómo Usar

### **1. Cambiar Fuente de Datos**
- Click en "🔄 Datos: Simulados" para alternar entre datos reales y simulados
- Verde = Datos del Banco Central | Gris = Datos simulados

### **2. Configurar Período**
- Usar selectores de fecha "Desde" y "Hasta"
- O usar botones predefinidos: "Todo el Gobierno", "Último Año", "Último Trimestre"

### **3. Líneas de Tendencia**
- Marcar/desmarcar "Mostrar tendencia" en cada gráfico
- Las líneas punteadas muestran la proyección

### **4. Evaluar Promesas**
- Scroll hacia abajo para ver el seguimiento de promesas
- ✅ = Cumplida | 🔄 = En progreso | ⏳ = Sin avance

## 📁 Estructura del Proyecto

```
datos-para-chile/
├── index.html          # Página principal
├── styles.css          # Estilos CSS modernos
├── script.js           # Lógica JavaScript
├── config.js           # Configuración de API y datos
└── README.md           # Este archivo
```

## 🎨 Diseño

### **Colores (Bandera Chilena)**
- **Azul Primario**: `#0033A0`
- **Rojo Primario**: `#D52B1E`
- **Blanco**: `#FFFFFF`

### **Estados de Evaluación**
- **Excelente**: Verde `#10B981`
- **Bueno**: Azul `#3B82F6`
- **Regular**: Amarillo `#F59E0B`
- **Malo**: Rojo `#EF4444`

## 🔍 Fuentes de Datos

### **Oficiales**
- [Banco Central de Chile](https://www.bcentral.cl) - Datos económicos
- [Instituto Nacional de Estadísticas (INE)](https://www.ine.cl) - Empleo
- [Ministerio de Hacienda](https://www.hacienda.cl) - Datos fiscales

### **Promesas Presidenciales**
- [Programa de Gobierno 2022-2026](https://www.gob.cl/programa-de-gobierno/)
- Seguimiento ciudadano de compromisos

## 🚀 Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] Más indicadores (salud, educación, seguridad)
- [ ] Comparación con gobiernos anteriores
- [ ] Sistema de alertas por email
- [ ] Exportar reportes PDF
- [ ] API pública para desarrolladores
- [ ] App móvil nativa

### **Indicadores Adicionales**
- [ ] Listas de espera en salud
- [ ] Resultados SIMCE/PSU
- [ ] Índice de criminalidad
- [ ] Aprobación presidencial
- [ ] Cumplimiento presupuestario

## 🤝 Contribuir

Este es un proyecto ciudadano. ¡Tu ayuda es bienvenida!

### **Cómo Contribuir:**
1. Reportar errores o sugerir mejoras
2. Agregar nuevos indicadores
3. Mejorar el diseño
4. Traducir a otros idiomas
5. Compartir en redes sociales

### **Contacto:**
- Email: vittocaridi@gmail.com
- Sugerencias y feedback siempre bienvenidos

## 📄 Licencia

Este proyecto es de **dominio público**. La información gubernamental debe ser accesible para todos los chilenos.

---

## 💡 Filosofía del Proyecto

> **"El presidente es el empleado más importante de Chile. Los chilenos tienen derecho a saber cómo está trabajando, con datos claros y sin palabras complicadas."**

### **Principios:**
- ✅ **Transparencia total**: Todos los datos son públicos
- ✅ **Lenguaje ciudadano**: Sin tecnicismos ni jerga política
- ✅ **Evaluación objetiva**: Basada en datos, no en opiniones
- ✅ **Acceso universal**: Gratis para todos los chilenos

---

*Hecho con ❤️ para Chile 🇨🇱*
