/**
 * Módulo de Almacenamiento (storage.js)
 * Gestiona la persistencia de datos usando localStorage
 * Proyecto: Optimizador de Escalada - Prueba OPA
 */

const Almacenamiento = (function() {
    'use strict';

    // Claves para localStorage
    const CLAVES = {
        ELEMENTOS: 'opa_elementos',
        CONFIGURACION: 'opa_configuracion',
        HISTORIAL: 'opa_historial'
    };

    // Datos por defecto
    const DATOS_POR_DEFECTO = {
        elementos: [
            { id: 'E1', peso: 5, calorias: 3 },
            { id: 'E2', peso: 3, calorias: 5 },
            { id: 'E3', peso: 5, calorias: 2 },
            { id: 'E4', peso: 1, calorias: 8 },
            { id: 'E5', peso: 2, calorias: 3 }
        ],
        configuracion: {
            caloriasMinimas: 15,
            pesoMaximo: 10
        }
    };

    /**
     * Guarda datos en localStorage
     * @param {string} clave - Clave del localStorage
     * @param {*} datos - Datos a guardar
     * @returns {boolean} - true si se guardó correctamente
     */
    function guardarEnLocalStorage(clave, datos) {
        try {
            const datosJSON = JSON.stringify(datos);
            localStorage.setItem(clave, datosJSON);
            return true;
        } catch (error) {
            console.error(`Error al guardar en localStorage (${clave}):`, error);
            return false;
        }
    }

    /**
     * Obtiene datos desde localStorage
     * @param {string} clave - Clave del localStorage
     * @param {*} valorPorDefecto - Valor a retornar si no existe
     * @returns {*} - Datos obtenidos o valor por defecto
     */
    function obtenerDeLocalStorage(clave, valorPorDefecto = null) {
        try {
            const datosJSON = localStorage.getItem(clave);
            if (datosJSON === null) {
                return valorPorDefecto;
            }
            return JSON.parse(datosJSON);
        } catch (error) {
            console.error(`Error al obtener de localStorage (${clave}):`, error);
            return valorPorDefecto;
        }
    }

    /**
     * Guarda la lista de elementos
     * @param {Array} elementos - Lista de elementos
     * @returns {boolean} - true si se guardó correctamente
     */
    function guardarElementos(elementos) {
        return guardarEnLocalStorage(CLAVES.ELEMENTOS, elementos);
    }

    /**
     * Obtiene la lista de elementos
     * @returns {Array} - Lista de elementos
     */
    function obtenerElementos() {
        const elementos = obtenerDeLocalStorage(CLAVES.ELEMENTOS, null);

        // Si no hay elementos guardados, usar datos por defecto
        if (elementos === null || elementos.length === 0) {
            guardarElementos(DATOS_POR_DEFECTO.elementos);
            return [...DATOS_POR_DEFECTO.elementos];
        }

        return elementos;
    }

    /**
     * Agrega un nuevo elemento
     * @param {Object} elemento - Elemento a agregar {id, peso, calorias}
     * @returns {boolean} - true si se agregó correctamente
     */
    function agregarElemento(elemento) {
        const elementos = obtenerElementos();

        // Validar que el ID no exista
        const existe = elementos.some(e => e.id === elemento.id);
        if (existe) {
            console.error(`El elemento con ID "${elemento.id}" ya existe`);
            return false;
        }

        elementos.push(elemento);
        return guardarElementos(elementos);
    }

    /**
     * Actualiza un elemento existente
     * @param {string} idAnterior - ID del elemento a actualizar
     * @param {Object} elementoNuevo - Nuevos datos del elemento
     * @returns {boolean} - true si se actualizó correctamente
     */
    function actualizarElemento(idAnterior, elementoNuevo) {
        const elementos = obtenerElementos();
        const indice = elementos.findIndex(e => e.id === idAnterior);

        if (indice === -1) {
            console.error(`Elemento con ID "${idAnterior}" no encontrado`);
            return false;
        }

        // Si el ID cambió, validar que el nuevo ID no exista
        if (idAnterior !== elementoNuevo.id) {
            const existe = elementos.some(e => e.id === elementoNuevo.id);
            if (existe) {
                console.error(`El ID "${elementoNuevo.id}" ya está en uso`);
                return false;
            }
        }

        elementos[indice] = elementoNuevo;
        return guardarElementos(elementos);
    }

    /**
     * Elimina un elemento
     * @param {string} id - ID del elemento a eliminar
     * @returns {boolean} - true si se eliminó correctamente
     */
    function eliminarElemento(id) {
        const elementos = obtenerElementos();
        const elementosFiltrados = elementos.filter(e => e.id !== id);

        if (elementos.length === elementosFiltrados.length) {
            console.error(`Elemento con ID "${id}" no encontrado`);
            return false;
        }

        return guardarElementos(elementosFiltrados);
    }

    /**
     * Guarda la configuración
     * @param {Object} configuracion - {caloriasMinimas, pesoMaximo}
     * @returns {boolean} - true si se guardó correctamente
     */
    function guardarConfiguracion(configuracion) {
        return guardarEnLocalStorage(CLAVES.CONFIGURACION, configuracion);
    }

    /**
     * Obtiene la configuración
     * @returns {Object} - {caloriasMinimas, pesoMaximo}
     */
    function obtenerConfiguracion() {
        const configuracion = obtenerDeLocalStorage(CLAVES.CONFIGURACION, null);

        // Si no hay configuración guardada, usar datos por defecto
        if (configuracion === null) {
            guardarConfiguracion(DATOS_POR_DEFECTO.configuracion);
            return { ...DATOS_POR_DEFECTO.configuracion };
        }

        return configuracion;
    }

    /**
     * Guarda un resultado en el historial
     * @param {Object} resultado - Resultado del cálculo
     * @returns {boolean} - true si se guardó correctamente
     */
    function guardarEnHistorial(resultado) {
        const historial = obtenerHistorial();

        // Agregar timestamp
        const registro = {
            fecha: new Date().toISOString(),
            ...resultado
        };

        historial.unshift(registro); // Agregar al inicio

        // Limitar el historial a 50 registros
        if (historial.length > 50) {
            historial.splice(50);
        }

        return guardarEnLocalStorage(CLAVES.HISTORIAL, historial);
    }

    /**
     * Obtiene el historial de cálculos
     * @returns {Array} - Lista de resultados históricos
     */
    function obtenerHistorial() {
        return obtenerDeLocalStorage(CLAVES.HISTORIAL, []);
    }

    /**
     * Limpia el historial
     * @returns {boolean} - true si se limpió correctamente
     */
    function limpiarHistorial() {
        return guardarEnLocalStorage(CLAVES.HISTORIAL, []);
    }

    /**
     * Exporta todos los datos a formato JSON
     * @returns {Object} - Datos completos para exportar
     */
    function exportarDatos() {
        return {
            version: '1.0',
            fechaExportacion: new Date().toISOString(),
            elementos: obtenerElementos(),
            configuracion: obtenerConfiguracion(),
            historial: obtenerHistorial()
        };
    }

    /**
     * Importa datos desde un objeto JSON
     * @param {Object} datos - Datos a importar
     * @returns {boolean} - true si se importó correctamente
     */
    function importarDatos(datos) {
        try {
            // Validar estructura básica
            if (!datos || typeof datos !== 'object') {
                throw new Error('Formato de datos inválido');
            }

            // Importar elementos si existen
            if (Array.isArray(datos.elementos)) {
                guardarElementos(datos.elementos);
            }

            // Importar configuración si existe
            if (datos.configuracion && typeof datos.configuracion === 'object') {
                guardarConfiguracion(datos.configuracion);
            }

            // Importar historial si existe (opcional)
            if (Array.isArray(datos.historial)) {
                guardarEnLocalStorage(CLAVES.HISTORIAL, datos.historial);
            }

            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            return false;
        }
    }

    /**
     * Restaura los datos por defecto
     * @returns {boolean} - true si se restauró correctamente
     */
    function restaurarDatosPorDefecto() {
        try {
            guardarElementos(DATOS_POR_DEFECTO.elementos);
            guardarConfiguracion(DATOS_POR_DEFECTO.configuracion);
            limpiarHistorial();
            return true;
        } catch (error) {
            console.error('Error al restaurar datos por defecto:', error);
            return false;
        }
    }

    /**
     * Limpia todos los datos almacenados
     * @returns {boolean} - true si se limpió correctamente
     */
    function limpiarTodo() {
        try {
            localStorage.removeItem(CLAVES.ELEMENTOS);
            localStorage.removeItem(CLAVES.CONFIGURACION);
            localStorage.removeItem(CLAVES.HISTORIAL);
            return true;
        } catch (error) {
            console.error('Error al limpiar todos los datos:', error);
            return false;
        }
    }

    // API pública del módulo
    return {
        // Gestión de elementos
        guardarElementos,
        obtenerElementos,
        agregarElemento,
        actualizarElemento,
        eliminarElemento,

        // Gestión de configuración
        guardarConfiguracion,
        obtenerConfiguracion,

        // Gestión de historial
        guardarEnHistorial,
        obtenerHistorial,
        limpiarHistorial,

        // Importar/Exportar
        exportarDatos,
        importarDatos,

        // Utilidades
        restaurarDatosPorDefecto,
        limpiarTodo
    };
})();
