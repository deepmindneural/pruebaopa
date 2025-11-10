# Optimizador de Escalada - Prueba OPA

Aplicación web para determinar el conjunto óptimo de elementos para escalar un risco, minimizando el peso total mientras se cumple con los requisitos calóricos mínimos.

## Descripción del Problema

El Optimizador de Escalada resuelve una variante del Problema de la Mochila (Knapsack Problem) con criterio de minimización:

Objetivo: Encontrar el conjunto de elementos que:
- Cumplan con las calorías mínimas requeridas
- Tengan el menor peso posible
- No excedan el peso máximo permitido

### Ejemplo:
```
Calorías Mínimas: 15 kcal
Peso Máximo: 10 kg

Elementos Disponibles:
- E1: 5 kg, 3 kcal
- E2: 3 kg, 5 kcal
- E3: 5 kg, 2 kcal
- E4: 1 kg, 8 kcal
- E5: 2 kg, 3 kcal

Solución Óptima:
- E1 (5 kg, 3 kcal)
- E2 (3 kg, 5 kcal)
- E4 (1 kg, 8 kcal)

Total: 9 kg, 16 kcal
```

## Características Principales

- Algoritmo de Optimización Inteligente
  - Fuerza bruta optimizada para conjuntos pequeños (≤20 elementos)
  - Algoritmo greedy con mejora local para conjuntos grandes (>20 elementos)
  - Validaciones exhaustivas de entrada

- Persistencia de Datos
  - Almacenamiento automático en localStorage
  - Exportar/Importar configuraciones en formato JSON
  - Historial de cálculos (hasta 50 registros)

- Interfaz Bonita y Responsive
  - Diseño moderno con Bootstrap 5
  - Animaciones suaves y feedback visual
  - Compatible con dispositivos móviles

- Gestión de Elementos
  - Agregar, editar y eliminar elementos
  - Validación de IDs únicos
  - Vista de tabla interactiva

- Visualización de Resultados
  - Resumen detallado de la solución
  - Barras de progreso visuales
  - Cálculo de eficiencia (kcal/kg)

## Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados con variables CSS
- **JavaScript ES6+** - Lógica modular con IIFE
- **Bootstrap 5** - Framework CSS (vía CDN)
- **Bootstrap Icons** - Iconografía (vía CDN)

Nota: No se utilizan frameworks backend ni librerías JavaScript adicionales, solo Vanilla JavaScript.

## Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere instalación de software adicional

### Instrucciones de Uso

1. **Descarga el proyecto:**
   ```bash
   git clone <url-del-repositorio>
   cd prueba\ opa
   ```

2. **Abre la aplicación:**
   - Opción 1: Doble clic en `index.html`
   - Opción 2: Desde la terminal:
     ```bash
     # macOS
     open index.html

     # Linux
     xdg-open index.html

     # Windows
     start index.html
     ```

3. **Uso de la aplicación:**
   - Configura las **Calorías Mínimas** y el **Peso Máximo**
   - Agrega o edita los **Elementos Disponibles**
   - Presiona **CALCULAR ELEMENTOS ÓPTIMOS**
   - Visualiza el resultado en el panel derecho

### Funcionalidades Adicionales

- **Exportar Configuración:**
  - Click en "Exportar" para descargar un archivo JSON

- **Importar Configuración:**
  - Click en "Importar" y selecciona un archivo JSON previamente exportado

- Limpiar Datos:
  - Click en "Limpiar Todo" para resetear a valores por defecto

## Estructura del Proyecto

```
prueba opa/
├── index.html              # Interfaz principal de la aplicación
├── css/
│   └── estilos.css        # Estilos personalizados
├── js/
│   ├── aplicacion.js      # Lógica de la interfaz y gestión de eventos
│   ├── optimizador.js     # Algoritmo de optimización
│   └── almacenamiento.js  # Módulo de persistencia (localStorage)
├── README.md              # Documentación (este archivo)
└── .gitignore             # Archivos ignorados por Git
```

## Algoritmo de Optimización

### Enfoque Implementado

La aplicación utiliza dos algoritmos según el tamaño del problema:

#### 1. Fuerza Bruta Optimizada (n ≤ 20)
- **Complejidad:** O(2^n)
- **Funcionamiento:**
  1. Genera todas las combinaciones posibles usando máscaras binarias
  2. Descarta combinaciones que exceden el peso máximo (poda)
  3. Filtra combinaciones que cumplen calorías mínimas
  4. Selecciona la de menor peso

**Ventajas:** Garantiza la solución óptima global

#### 2. Greedy con Mejora Local (n > 20)
- **Complejidad:** O(n log n) + O(n²)
- **Funcionamiento:**
  1. Calcula el ratio `calorías/peso` para cada elemento
  2. Ordena por ratio descendente (mayor eficiencia primero)
  3. Selecciona elementos hasta cumplir calorías mínimas
  4. Optimiza localmente removiendo elementos innecesarios

**Ventajas:** Escalable para conjuntos grandes, solución aproximada de alta calidad

### Casos Especiales Manejados

- No hay solución posible: Mensaje claro al usuario
- Peso máximo insuficiente: Sugerencia de ajuste
- Sin elementos disponibles: Solicita agregar elementos
- Múltiples soluciones óptimas: Retorna una válida

## ESCALABILIDAD DE LA SOLUCIÓN

### 1. Escalabilidad de Datos

**Estado Actual:**
- Maneja hasta **50 elementos eficientemente** con el algoritmo de fuerza bruta
- Sin límite práctico con el algoritmo greedy (probado con 1000+ elementos)
- Historial limitado a 50 registros para optimizar espacio

**Mejoras para Mayor Escala:**
```javascript
// Para 10,000+ elementos:
- Implementar Web Workers para cálculos en background
- Paginación y virtualización de la tabla de elementos
- Búsqueda y filtrado en tiempo real
- Compresión de datos en localStorage
```

**Implementación Futura:**
```javascript
// Ejemplo con Web Worker
const worker = new Worker('js/optimizer.worker.js');
worker.postMessage({ elementos, caloriasMinimas, pesoMaximo });
worker.onmessage = (e) => mostrarResultado(e.data);
```

### 2. Escalabilidad de Algoritmo

**Estado Actual:**
- Fuerza bruta: O(2^n) → Viable hasta n=20
- Greedy optimizado: O(n log n) → Viable para n>1000

**Mejoras Algorítmicas:**
```
1. Programación Dinámica Completa
   - Complejidad: O(n * W) donde W = peso máximo
   - Solución óptima garantizada
   - Implementación con memoización

2. Algoritmos Aproximados Avanzados
   - FPTAS (Fully Polynomial-Time Approximation Scheme)
   - Metaheurísticas: Algoritmos Genéticos, Simulated Annealing
   - Optimización por Colonia de Hormigas

3. Caché y Memoización
   - Guardar resultados de subproblemas
   - Reutilizar cálculos en ejecuciones sucesivas
```

**Ejemplo de Programación Dinámica:**
```javascript
function knapsackDP(elementos, caloriasMin, pesoMax) {
    const n = elementos.length;
    const W = Math.floor(pesoMax * 10); // Precisión decimal
    const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            // ... lógica DP
        }
    }
    // Backtracking para recuperar elementos
}
```

### 3. Escalabilidad de Usuarios

**Estado Actual:**
- Single-user (localStorage del navegador)
- Sin autenticación ni sincronización

**Migración a Multi-Usuario:**

**Backend Propuesto:**
```javascript
// Node.js + Express + PostgreSQL

// Arquitectura:
prueba-opa-backend/
├── server.js           # Servidor Express
├── routes/
│   ├── auth.js        # Autenticación JWT
│   ├── elementos.js   # CRUD de elementos
│   └── calculos.js    # Endpoint de optimización
├── models/
│   ├── Usuario.js
│   └── Elemento.js
└── database/
    └── config.js      # Conexión PostgreSQL
```

**Endpoints REST:**
```
POST   /api/auth/register     # Registro de usuario
POST   /api/auth/login        # Login (retorna JWT)
GET    /api/elementos         # Listar elementos del usuario
POST   /api/elementos         # Crear elemento
PUT    /api/elementos/:id     # Actualizar elemento
DELETE /api/elementos/:id     # Eliminar elemento
POST   /api/calcular          # Ejecutar optimización
GET    /api/historial         # Obtener historial de cálculos
```

**Base de Datos:**
```sql
-- PostgreSQL Schema
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE elementos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    peso DECIMAL(10,2) NOT NULL,
    calorias INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE calculos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    calorias_minimas INTEGER NOT NULL,
    peso_maximo DECIMAL(10,2) NOT NULL,
    resultado JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Alternativa NoSQL (MongoDB):**
```javascript
// Esquema Mongoose
const UsuarioSchema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: String,
    elementos: [{
        nombre: String,
        peso: Number,
        calorias: Number
    }],
    historial: [{
        fecha: Date,
        configuracion: Object,
        resultado: Object
    }]
});
```

### 4. Escalabilidad de Funcionalidades

Fácil de Agregar:

Restricciones Adicionales:
```javascript
// Ejemplo: Agregar proteínas, vitaminas, etc.
const elemento = {
    id: 'E1',
    peso: 5,
    calorias: 300,
    proteinas: 15,      // Nuevo
    vitaminas: 50,      // Nuevo
    carbohidratos: 40   // Nuevo
};

// Modificar algoritmo para optimización multi-objetivo
function calcularMultiObjetivo(restricciones, elementos) {
    // Lógica para múltiples restricciones
}
```

Múltiples Objetivos:
```javascript
// Optimización por:
- Menor peso
- Mayor duración
- Menor volumen
- Mejor relación costo/beneficio
```

Comparación de Soluciones:
```javascript
// Mostrar top 5 mejores soluciones
const topSoluciones = encontrarTopN(5, elementos, restricciones);
```

Exportar a PDF:
```javascript
// Usar jsPDF (vía CDN)
function exportarPDF(resultado) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text('Resultado de Optimización', 10, 10);
    // ... agregar contenido
    doc.save('resultado.pdf');
}
```

Gráficos de Comparación:
```javascript
// Usar Chart.js (vía CDN)
const ctx = document.getElementById('graficoCalorias').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: elementosSeleccionados.map(e => e.id),
        datasets: [{
            label: 'Calorías',
            data: elementosSeleccionados.map(e => e.calorias)
        }]
    }
});
```

### 5. Escalabilidad de Infraestructura

Estado Actual:
- Archivos estáticos HTML/CSS/JS
- Ejecución 100% en el navegador

Mejora con CDN:
```
                    ┌─────────────┐
                    │  Cloudflare │
                    │     CDN     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼───┐   ┌────▼───┐   ┌────▼───┐
         │ Edge 1 │   │ Edge 2 │   │ Edge 3 │
         │ (USA)  │   │ (EU)   │   │ (Asia) │
         └────────┘   └────────┘   └────────┘
```

**Escalamiento con Backend:**
```
┌──────────────┐
│   Cliente    │
│  (Browser)   │
└──────┬───────┘
       │ HTTPS
       ▼
┌──────────────┐
│ Load Balancer│ (Nginx/HAProxy)
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌────┐  ┌────┐
│API1│  │API2│ (Node.js con PM2)
└─┬──┘  └─┬──┘
  │       │
  └───┬───┘
      ▼
┌──────────────┐
│  PostgreSQL  │
│  (Primary +  │
│   Replica)   │
└──────────────┘
```

### 6. Escalabilidad de Mantenimiento

Estado Actual:
- Código modular con IIFE (Immediately Invoked Function Expressions)
- Comentarios JSDoc en funciones críticas
- Separación clara de responsabilidades
- Variables y funciones en español

**Mejoras Propuestas:**

**1. Testing Automatizado:**
```javascript
// Usar Jest para testing
describe('Optimizador', () => {
    test('debe encontrar la solución óptima', () => {
        const resultado = Optimizador.calcularConjuntoOptimo(15, 10, elementos);
        expect(resultado.exito).toBe(true);
        expect(resultado.pesoTotal).toBeLessThanOrEqual(10);
    });
});
```

**2. Linting y Formateo:**
```json
// .eslintrc.json
{
  "env": { "browser": true, "es2021": true },
  "extends": "eslint:recommended",
  "rules": {
    "indent": ["error", 4],
    "quotes": ["error", "single"]
  }
}
```

**3. Documentación Automática:**
```javascript
// Generar docs con JSDoc
/**
 * @module Optimizador
 * @description Algoritmo de optimización para el problema de la mochila
 */
```

**4. CI/CD con GitHub Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
```

## Seguridad

- Escapado de HTML para prevenir XSS
- Validación de entrada en todas las funciones
- No hay ejecución de código dinámico (eval, Function())
- CSP (Content Security Policy) recomendado para producción

## Contribuciones

Este proyecto es open-source. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Autor

**Jeison L Zapata**

Proyecto desarrollado como parte de Prueba OPA - Optimizador de Escalada

Preguntas o sugerencias: Abre un issue en el repositorio.
