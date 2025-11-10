/**
 * Módulo de Optimización (optimizer.js)
 * Implementa el algoritmo para encontrar el conjunto óptimo de elementos
 * Proyecto: Optimizador de Escalada - Prueba OPA
 */

const Optimizador = (function() {
    'use strict';

    /**
     * Encuentra el conjunto óptimo de elementos para escalar
     * Objetivo: Minimizar peso total manteniendo calorías >= caloriasMinimas
     *           y peso <= pesoMaximo
     *
     * @param {number} caloriasMinimas - Calorías mínimas requeridas
     * @param {number} pesoMaximo - Peso máximo permitido
     * @param {Array} elementos - Lista de elementos disponibles [{id, peso, calorias}]
     * @returns {Object} Resultado con: {
     *   exito: boolean,
     *   elementosSeleccionados: Array,
     *   pesoTotal: number,
     *   caloriasTotal: number,
     *   mensaje: string
     * }
     */
    function calcularConjuntoOptimo(caloriasMinimas, pesoMaximo, elementos) {
        // Validaciones de entrada
        const validacion = validarEntrada(caloriasMinimas, pesoMaximo, elementos);
        if (!validacion.valido) {
            return {
                exito: false,
                elementosSeleccionados: [],
                pesoTotal: 0,
                caloriasTotal: 0,
                mensaje: validacion.mensaje
            };
        }

        // Elegir algoritmo según el tamaño del problema
        const numElementos = elementos.length;

        if (numElementos === 0) {
            return {
                exito: false,
                elementosSeleccionados: [],
                pesoTotal: 0,
                caloriasTotal: 0,
                mensaje: 'No hay elementos disponibles para optimizar'
            };
        }

        // Para conjuntos pequeños (hasta 20 elementos), usar fuerza bruta optimizada
        if (numElementos <= 20) {
            return fuerzaBrutaOptimizada(caloriasMinimas, pesoMaximo, elementos);
        } else {
            // Para conjuntos más grandes, usar algoritmo greedy con mejora local
            return greedyConMejoraLocal(caloriasMinimas, pesoMaximo, elementos);
        }
    }

    /**
     * Valida los parámetros de entrada
     * @param {number} caloriasMinimas
     * @param {number} pesoMaximo
     * @param {Array} elementos
     * @returns {Object} {valido: boolean, mensaje: string}
     */
    function validarEntrada(caloriasMinimas, pesoMaximo, elementos) {
        if (caloriasMinimas <= 0) {
            return {
                valido: false,
                mensaje: 'Las calorías mínimas deben ser mayores que 0'
            };
        }

        if (pesoMaximo <= 0) {
            return {
                valido: false,
                mensaje: 'El peso máximo debe ser mayor que 0'
            };
        }

        if (!Array.isArray(elementos)) {
            return {
                valido: false,
                mensaje: 'La lista de elementos no es válida'
            };
        }

        // Validar que al menos un elemento es viable
        const hayElementoViable = elementos.some(e => e.peso <= pesoMaximo && e.calorias > 0);
        if (!hayElementoViable) {
            return {
                valido: false,
                mensaje: 'Ningún elemento cumple con el peso máximo permitido'
            };
        }

        return { valido: true, mensaje: '' };
    }

    /**
     * Algoritmo de fuerza bruta optimizada
     * Genera todas las combinaciones posibles y selecciona la óptima
     * Complejidad: O(2^n) - Solo viable para n <= 20
     *
     * @param {number} caloriasMinimas
     * @param {number} pesoMaximo
     * @param {Array} elementos
     * @returns {Object} Resultado
     */
    function fuerzaBrutaOptimizada(caloriasMinimas, pesoMaximo, elementos) {
        const n = elementos.length;
        const totalCombinaciones = Math.pow(2, n);

        let mejorSolucion = null;
        let menorPeso = Infinity;

        // Iterar sobre todas las combinaciones posibles
        for (let mascara = 0; mascara < totalCombinaciones; mascara++) {
            const combinacionActual = [];
            let pesoTotal = 0;
            let caloriasTotal = 0;

            // Construir la combinación según la máscara binaria
            for (let i = 0; i < n; i++) {
                if ((mascara & (1 << i)) !== 0) {
                    const elemento = elementos[i];
                    combinacionActual.push(elemento);
                    pesoTotal += elemento.peso;
                    caloriasTotal += elemento.calorias;

                    // Poda: si excede el peso máximo, descartar esta combinación
                    if (pesoTotal > pesoMaximo) {
                        break;
                    }
                }
            }

            // Verificar si esta combinación es válida y mejor que la anterior
            if (pesoTotal <= pesoMaximo && caloriasTotal >= caloriasMinimas) {
                if (pesoTotal < menorPeso) {
                    menorPeso = pesoTotal;
                    mejorSolucion = {
                        elementos: combinacionActual,
                        peso: pesoTotal,
                        calorias: caloriasTotal
                    };
                }
            }
        }

        // Verificar si se encontró solución
        if (mejorSolucion === null) {
            return {
                exito: false,
                elementosSeleccionados: [],
                pesoTotal: 0,
                caloriasTotal: 0,
                mensaje: 'No se encontró una solución que cumpla con los requisitos. ' +
                         'Intenta aumentar el peso máximo o reducir las calorías mínimas.'
            };
        }

        return {
            exito: true,
            elementosSeleccionados: mejorSolucion.elementos,
            pesoTotal: redondear(mejorSolucion.peso),
            caloriasTotal: mejorSolucion.calorias,
            mensaje: '¡Solución óptima encontrada!'
        };
    }

    /**
     * Algoritmo greedy con mejora local
     * Ordena por ratio calorías/peso y luego optimiza
     * Complejidad: O(n log n) + O(n^2) - Viable para n > 20
     *
     * @param {number} caloriasMinimas
     * @param {number} pesoMaximo
     * @param {Array} elementos
     * @returns {Object} Resultado
     */
    function greedyConMejoraLocal(caloriasMinimas, pesoMaximo, elementos) {
        // Calcular ratio (eficiencia) de cada elemento
        const elementosConRatio = elementos.map(e => ({
            ...e,
            ratio: e.calorias / e.peso
        }));

        // Ordenar por ratio descendente (más calorías por kg = mejor)
        elementosConRatio.sort((a, b) => b.ratio - a.ratio);

        // Fase 1: Selección greedy inicial
        const seleccionados = [];
        let pesoTotal = 0;
        let caloriasTotal = 0;

        for (const elemento of elementosConRatio) {
            // Si agregar el elemento no excede el peso máximo
            if (pesoTotal + elemento.peso <= pesoMaximo) {
                seleccionados.push(elemento);
                pesoTotal += elemento.peso;
                caloriasTotal += elemento.calorias;

                // Si ya cumplimos las calorías mínimas, intentar optimizar
                if (caloriasTotal >= caloriasMinimas) {
                    break;
                }
            }
        }

        // Verificar si la solución greedy cumple los requisitos
        if (caloriasTotal < caloriasMinimas) {
            return {
                exito: false,
                elementosSeleccionados: [],
                pesoTotal: 0,
                caloriasTotal: 0,
                mensaje: 'No se encontró una solución que cumpla con los requisitos. ' +
                         'Intenta aumentar el peso máximo o reducir las calorías mínimas.'
            };
        }

        // Fase 2: Optimización local - intentar reducir peso manteniendo calorías
        const solucionOptimizada = optimizarLocal(
            seleccionados,
            caloriasMinimas,
            pesoMaximo,
            elementosConRatio
        );

        return {
            exito: true,
            elementosSeleccionados: solucionOptimizada.elementos,
            pesoTotal: redondear(solucionOptimizada.peso),
            caloriasTotal: solucionOptimizada.calorias,
            mensaje: '¡Solución encontrada! (usando algoritmo greedy optimizado)'
        };
    }

    /**
     * Optimiza localmente la solución greedy
     * Intenta reemplazar elementos pesados por elementos más ligeros
     *
     * @param {Array} seleccionados - Elementos seleccionados inicialmente
     * @param {number} caloriasMinimas
     * @param {number} pesoMaximo
     * @param {Array} todosElementos
     * @returns {Object} {elementos, peso, calorias}
     */
    function optimizarLocal(seleccionados, caloriasMinimas, pesoMaximo, todosElementos) {
        let mejorSolucion = {
            elementos: [...seleccionados],
            peso: seleccionados.reduce((sum, e) => sum + e.peso, 0),
            calorias: seleccionados.reduce((sum, e) => sum + e.calorias, 0)
        };

        // Intentar remover elementos uno por uno si aún cumple calorías mínimas
        for (let i = mejorSolucion.elementos.length - 1; i >= 0; i--) {
            const elementoRemovido = mejorSolucion.elementos[i];
            const nuevoPeso = mejorSolucion.peso - elementoRemovido.peso;
            const nuevasCalorias = mejorSolucion.calorias - elementoRemovido.calorias;

            // Si al remover este elemento aún cumplimos las calorías mínimas
            if (nuevasCalorias >= caloriasMinimas) {
                mejorSolucion.elementos.splice(i, 1);
                mejorSolucion.peso = nuevoPeso;
                mejorSolucion.calorias = nuevasCalorias;
            }
        }

        return mejorSolucion;
    }

    /**
     * Redondea un número a 2 decimales
     * @param {number} numero
     * @returns {number}
     */
    function redondear(numero) {
        return Math.round(numero * 100) / 100;
    }

    /**
     * Calcula estadísticas sobre los elementos disponibles
     * @param {Array} elementos
     * @returns {Object} Estadísticas
     */
    function calcularEstadisticas(elementos) {
        if (!elementos || elementos.length === 0) {
            return {
                totalElementos: 0,
                pesoPromedio: 0,
                caloriasPromedio: 0,
                ratioPromedio: 0,
                pesoMinimo: 0,
                pesoMaximo: 0,
                caloriasMinimas: 0,
                caloriasMaximas: 0
            };
        }

        const pesos = elementos.map(e => e.peso);
        const calorias = elementos.map(e => e.calorias);
        const ratios = elementos.map(e => e.calorias / e.peso);

        return {
            totalElementos: elementos.length,
            pesoPromedio: redondear(promedio(pesos)),
            caloriasPromedio: redondear(promedio(calorias)),
            ratioPromedio: redondear(promedio(ratios)),
            pesoMinimo: Math.min(...pesos),
            pesoMaximo: Math.max(...pesos),
            caloriasMinimas: Math.min(...calorias),
            caloriasMaximas: Math.max(...calorias)
        };
    }

    /**
     * Calcula el promedio de un array de números
     * @param {Array} numeros
     * @returns {number}
     */
    function promedio(numeros) {
        if (numeros.length === 0) return 0;
        const suma = numeros.reduce((acc, val) => acc + val, 0);
        return suma / numeros.length;
    }

    // API pública del módulo
    return {
        calcularConjuntoOptimo,
        calcularEstadisticas
    };
})();
