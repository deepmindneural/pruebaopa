/**
 * Lógica Principal de la Aplicación (app.js)
 * Gestiona la interfaz de usuario y la interacción con los módulos
 * Proyecto: Optimizador de Escalada - Prueba OPA
 * Autor: Jeison L Zapata
 * Versión: 2.0 - Interfaz Mejorada y Dinámica
 */

(function() {
    'use strict';

    // Variables globales de la aplicación
    let modalElemento;
    let modoEdicion = false;
    let idElementoEditar = null;

    /**
     * Inicializa la aplicación al cargar la página
     */
    function inicializarAplicacion() {
        console.log('🏔️ Inicializando Optimizador de Escalada...');

        // Mostrar animación de bienvenida
        mostrarAnimacionBienvenida();

        // Inicializar modal de Bootstrap
        const elementoModal = document.getElementById('modalAgregarElemento');
        modalElemento = new bootstrap.Modal(elementoModal);

        // Cargar datos desde localStorage
        cargarConfiguracion();
        renderizarTablaElementos();

        // Registrar event listeners
        registrarEventListeners();

        // Agregar efectos visuales a los inputs
        agregarEfectosInputs();

        console.log('✅ Aplicación inicializada correctamente');
    }

    /**
     * Muestra una animación de bienvenida sutil
     */
    function mostrarAnimacionBienvenida() {
        const header = document.querySelector('.bg-gradient-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                header.style.transition = 'all 0.8s ease-out';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    /**
     * Agrega efectos visuales a los inputs
     */
    function agregarEfectosInputs() {
        const inputs = document.querySelectorAll('.input-modern');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Registra todos los event listeners
     */
    function registrarEventListeners() {
        // Botón calcular
        document.getElementById('btnCalcular').addEventListener('click', calcularSolucionOptima);

        // Botón guardar elemento (en modal)
        document.getElementById('btnGuardarElemento').addEventListener('click', guardarElemento);

        // Botón exportar
        document.getElementById('btnExportar').addEventListener('click', exportarConfiguracion);

        // Botón importar
        document.getElementById('btnImportar').addEventListener('click', () => {
            document.getElementById('archivoImportar').click();
        });

        // Input file para importar
        document.getElementById('archivoImportar').addEventListener('change', importarConfiguracion);

        // Botón limpiar
        document.getElementById('btnLimpiar').addEventListener('click', limpiarTodo);

        // Guardar configuración al cambiar valores
        document.getElementById('caloriasMinimas').addEventListener('change', guardarConfiguracionActual);
        document.getElementById('pesoMaximo').addEventListener('change', guardarConfiguracionActual);

        // Evento al abrir modal (para resetear formulario)
        document.getElementById('modalAgregarElemento').addEventListener('show.bs.modal', prepararModal);

        // Permitir submit del formulario con Enter
        document.getElementById('formularioElemento').addEventListener('submit', (e) => {
            e.preventDefault();
            guardarElemento();
        });
    }

    /**
     * Carga la configuración desde localStorage
     */
    function cargarConfiguracion() {
        const configuracion = Almacenamiento.obtenerConfiguracion();
        document.getElementById('caloriasMinimas').value = configuracion.caloriasMinimas;
        document.getElementById('pesoMaximo').value = configuracion.pesoMaximo;
    }

    /**
     * Guarda la configuración actual en localStorage
     */
    function guardarConfiguracionActual() {
        const caloriasMinimas = parseFloat(document.getElementById('caloriasMinimas').value) || 0;
        const pesoMaximo = parseFloat(document.getElementById('pesoMaximo').value) || 0;

        Almacenamiento.guardarConfiguracion({
            caloriasMinimas,
            pesoMaximo
        });
    }

    /**
     * Renderiza la tabla de elementos con animaciones
     */
    function renderizarTablaElementos() {
        const elementos = Almacenamiento.obtenerElementos();
        const tbody = document.getElementById('listaElementos');

        if (elementos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                        <div class="fade-in-up">
                            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                            <p class="mt-2">No hay elementos disponibles</p>
                            <button class="btn btn-sm btn-success boton-hover" data-bs-toggle="modal" data-bs-target="#modalAgregarElemento">
                                <i class="bi bi-plus-circle"></i> Agregar primer elemento
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = elementos.map((elemento, indice) => `
                <tr class="fade-in-up" style="animation-delay: ${indice * 0.05}s;">
                    <td class="fw-bold">
                        <span class="badge bg-primary">${escapeHtml(elemento.id)}</span>
                    </td>
                    <td>
                        <i class="bi bi-wallet2 text-success"></i> ${elemento.peso} kg
                    </td>
                    <td>
                        <i class="bi bi-fire text-danger"></i> ${elemento.calorias} kcal
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary me-1 boton-hover"
                                onclick="editarElemento('${escapeHtml(elemento.id)}')"
                                title="Editar elemento">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger boton-hover"
                                onclick="eliminarElemento('${escapeHtml(elemento.id)}')"
                                title="Eliminar elemento">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Actualizar contador con animación
        const contador = document.getElementById('totalElementos');
        contador.style.transition = 'all 0.3s ease';
        contador.style.transform = 'scale(1.2)';
        contador.textContent = elementos.length;
        setTimeout(() => {
            contador.style.transform = 'scale(1)';
        }, 300);
    }

    /**
     * Prepara el modal para agregar o editar
     */
    function prepararModal() {
        const formulario = document.getElementById('formularioElemento');
        const titulo = document.getElementById('tituloModal');

        if (!modoEdicion) {
            // Modo agregar
            formulario.reset();
            titulo.innerHTML = '<i class="bi bi-plus-circle"></i> Agregar Nuevo Elemento';
            document.getElementById('elementoId').disabled = false;
        }
    }

    /**
     * Guarda un elemento (agregar o editar)
     */
    function guardarElemento() {
        const id = document.getElementById('elementoId').value.trim();
        const peso = parseFloat(document.getElementById('elementoPeso').value);
        const calorias = parseInt(document.getElementById('elementoCalorias').value);

        // Validaciones
        if (!id) {
            mostrarAlerta('Por favor ingresa un ID para el elemento', 'danger');
            return;
        }

        if (isNaN(peso) || peso <= 0) {
            mostrarAlerta('El peso debe ser un número mayor que 0', 'danger');
            return;
        }

        if (isNaN(calorias) || calorias <= 0) {
            mostrarAlerta('Las calorías deben ser un número mayor que 0', 'danger');
            return;
        }

        const elemento = { id, peso, calorias };
        let exito = false;

        if (modoEdicion) {
            // Actualizar elemento existente
            exito = Almacenamiento.actualizarElemento(idElementoEditar, elemento);
            if (exito) {
                mostrarAlerta(`Elemento "${id}" actualizado correctamente`, 'success');
            } else {
                mostrarAlerta('Error al actualizar el elemento. Verifica que el ID no esté duplicado.', 'danger');
                return;
            }
        } else {
            // Agregar nuevo elemento
            exito = Almacenamiento.agregarElemento(elemento);
            if (exito) {
                mostrarAlerta(`Elemento "${id}" agregado correctamente`, 'success');
            } else {
                mostrarAlerta(`El elemento con ID "${id}" ya existe`, 'danger');
                return;
            }
        }

        // Cerrar modal y actualizar tabla
        modalElemento.hide();
        renderizarTablaElementos();
        resetearModoEdicion();
    }

    /**
     * Edita un elemento existente
     * @param {string} id - ID del elemento a editar
     */
    window.editarElemento = function(id) {
        const elementos = Almacenamiento.obtenerElementos();
        const elemento = elementos.find(e => e.id === id);

        if (!elemento) {
            mostrarAlerta(`Elemento "${id}" no encontrado`, 'danger');
            return;
        }

        // Configurar modo edición
        modoEdicion = true;
        idElementoEditar = id;

        // Llenar formulario
        document.getElementById('elementoId').value = elemento.id;
        document.getElementById('elementoPeso').value = elemento.peso;
        document.getElementById('elementoCalorias').value = elemento.calorias;

        // Cambiar título del modal
        document.getElementById('tituloModal').innerHTML = `<i class="bi bi-pencil"></i> Editar Elemento: ${escapeHtml(id)}`;

        // Deshabilitar campo ID en edición (opcional, pero recomendado)
        document.getElementById('elementoId').disabled = false; // Permitir cambiar ID

        // Abrir modal
        modalElemento.show();
    };

    /**
     * Elimina un elemento
     * @param {string} id - ID del elemento a eliminar
     */
    window.eliminarElemento = function(id) {
        if (!confirm(`¿Estás seguro de que deseas eliminar el elemento "${id}"?`)) {
            return;
        }

        const exito = Almacenamiento.eliminarElemento(id);

        if (exito) {
            mostrarAlerta(`Elemento "${id}" eliminado correctamente`, 'success');
            renderizarTablaElementos();
        } else {
            mostrarAlerta(`Error al eliminar el elemento "${id}"`, 'danger');
        }
    };

    /**
     * Resetea el modo edición
     */
    function resetearModoEdicion() {
        modoEdicion = false;
        idElementoEditar = null;
        document.getElementById('formularioElemento').reset();
    }

    /**
     * Calcula la solución óptima
     */
    function calcularSolucionOptima() {
        // Mostrar animación de carga en el botón
        const botonCalcular = document.getElementById('btnCalcular');
        const textoOriginal = botonCalcular.innerHTML;
        botonCalcular.innerHTML = '<span class="cargando"></span> Calculando...';
        botonCalcular.disabled = true;

        // Obtener configuración
        const caloriasMinimas = parseFloat(document.getElementById('caloriasMinimas').value);
        const pesoMaximo = parseFloat(document.getElementById('pesoMaximo').value);
        const elementos = Almacenamiento.obtenerElementos();

        // Simular procesamiento (para mostrar la animación)
        setTimeout(() => {
            // Validar que hay elementos
            if (elementos.length === 0) {
                mostrarResultado({
                    exito: false,
                    mensaje: 'No hay elementos disponibles. Por favor agrega al menos un elemento.'
                });
                botonCalcular.innerHTML = textoOriginal;
                botonCalcular.disabled = false;
                return;
            }

            // Guardar configuración
            guardarConfiguracionActual();

            // Ejecutar algoritmo
            const resultado = Optimizador.calcularConjuntoOptimo(caloriasMinimas, pesoMaximo, elementos);

            // Mostrar resultado
            mostrarResultado(resultado);

            // Guardar en historial si fue exitoso
            if (resultado.exito) {
                Almacenamiento.guardarEnHistorial({
                    caloriasMinimas,
                    pesoMaximo,
                    resultado: resultado
                });

                // Efecto de confeti si la solución es exitosa
                lanzarConfeti();

                // Scroll suave al panel de resultados en móviles
                scrollSuaveAResultados();
            }

            // Restaurar botón
            botonCalcular.innerHTML = textoOriginal;
            botonCalcular.disabled = false;
        }, 600); // Pequeño delay para mostrar la animación
    }

    /**
     * Scroll suave al panel de resultados
     */
    function scrollSuaveAResultados() {
        const panelResultado = document.getElementById('panelResultado');
        if (panelResultado && window.innerWidth < 992) {
            setTimeout(() => {
                panelResultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        }
    }

    /**
     * Lanza efecto de confeti al encontrar una solución exitosa
     */
    function lanzarConfeti() {
        const colores = ['#667eea', '#764ba2', '#20c997', '#17a2b8', '#ffc107'];
        const cantidadConfeti = 50;

        for (let i = 0; i < cantidadConfeti; i++) {
            crearParticularConfeti(colores[Math.floor(Math.random() * colores.length)], i);
        }
    }

    /**
     * Crea una partícula de confeti individual
     * @param {string} color - Color de la partícula
     * @param {number} indice - Índice de la partícula
     */
    function crearParticularConfeti(color, indice) {
        const confeti = document.createElement('div');
        confeti.style.position = 'fixed';
        confeti.style.width = '10px';
        confeti.style.height = '10px';
        confeti.style.backgroundColor = color;
        confeti.style.left = Math.random() * window.innerWidth + 'px';
        confeti.style.top = '-20px';
        confeti.style.zIndex = '10000';
        confeti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confeti.style.pointerEvents = 'none';
        confeti.style.opacity = '0.8';

        document.body.appendChild(confeti);

        const duracion = 2000 + Math.random() * 1000;
        const desplazamientoX = (Math.random() - 0.5) * 200;
        const rotacion = Math.random() * 720;

        confeti.animate([
            {
                transform: 'translateY(0) translateX(0) rotate(0deg)',
                opacity: 0.8
            },
            {
                transform: `translateY(${window.innerHeight + 50}px) translateX(${desplazamientoX}px) rotate(${rotacion}deg)`,
                opacity: 0
            }
        ], {
            duration: duracion,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            delay: indice * 30
        }).onfinish = () => confeti.remove();
    }

    /**
     * Muestra el resultado de la optimización
     * @param {Object} resultado - Resultado del optimizador
     */
    function mostrarResultado(resultado) {
        const panel = document.getElementById('panelResultado');

        if (!resultado.exito) {
            // Mostrar error
            panel.innerHTML = `
                <div class="alert alert-danger resultado-error" role="alert">
                    <h5 class="alert-heading">
                        <i class="bi bi-exclamation-triangle-fill"></i> No se encontró solución
                    </h5>
                    <p class="mb-0">${escapeHtml(resultado.mensaje)}</p>
                </div>
                <div class="text-center mt-3">
                    <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #dc3545;"></i>
                </div>
            `;
            return;
        }

        // Mostrar solución exitosa
        const listaElementosHTML = resultado.elementosSeleccionados.map(elemento => `
            <li>
                <i class="bi bi-check-circle-fill"></i>
                <strong>${escapeHtml(elemento.id)}</strong>
                <span class="text-muted">
                    (Peso: ${elemento.peso} kg, Cal: ${elemento.calorias} kcal)
                </span>
            </li>
        `).join('');

        // Calcular porcentajes
        const caloriasMinimas = parseFloat(document.getElementById('caloriasMinimas').value);
        const pesoMaximo = parseFloat(document.getElementById('pesoMaximo').value);
        const porcentajePeso = ((resultado.pesoTotal / pesoMaximo) * 100).toFixed(1);
        const porcentajeCalorias = ((resultado.caloriasTotal / caloriasMinimas) * 100).toFixed(1);

        panel.innerHTML = `
            <div class="alert alert-success resultado-exito" role="alert">
                <h5 class="alert-heading">
                    <i class="bi bi-check-circle-fill"></i> ${escapeHtml(resultado.mensaje)}
                </h5>
            </div>

            <h6 class="fw-bold mb-3">
                <i class="bi bi-box-seam"></i> Elementos Seleccionados:
            </h6>
            <ul class="lista-elementos-seleccionados">
                ${listaElementosHTML}
            </ul>

            <div class="resumen-resultado">
                <h6 class="fw-bold mb-3 text-center">
                    <i class="bi bi-clipboard-data"></i> Resumen
                </h6>

                <div class="resumen-item">
                    <span>Peso Total:</span>
                    <span class="resumen-valor">
                        ${resultado.pesoTotal} kg
                        <small class="text-muted">de ${pesoMaximo} kg</small>
                    </span>
                </div>

                <div class="mb-2">
                    <div class="barra-progreso">
                        <div class="barra-progreso-fill" style="width: ${porcentajePeso}%; background-color: ${porcentajePeso > 90 ? '#ffc107' : '#198754'}"></div>
                    </div>
                    <small class="text-muted">${porcentajePeso}% del peso máximo</small>
                </div>

                <div class="resumen-item">
                    <span>Calorías Totales:</span>
                    <span class="resumen-valor">
                        ${resultado.caloriasTotal} kcal
                        <small class="text-muted">de ${caloriasMinimas} kcal</small>
                    </span>
                </div>

                <div class="mb-2">
                    <div class="barra-progreso">
                        <div class="barra-progreso-fill" style="width: ${Math.min(porcentajeCalorias, 100)}%"></div>
                    </div>
                    <small class="text-muted">${porcentajeCalorias}% de las calorías mínimas</small>
                </div>

                <div class="resumen-item border-top pt-2 mt-2">
                    <span>Número de Elementos:</span>
                    <span class="resumen-valor">${resultado.elementosSeleccionados.length}</span>
                </div>

                <div class="resumen-item">
                    <span>Eficiencia:</span>
                    <span class="resumen-valor">
                        ${(resultado.caloriasTotal / resultado.pesoTotal).toFixed(2)} kcal/kg
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Exporta la configuración a JSON
     */
    function exportarConfiguracion() {
        const datos = Almacenamiento.exportarDatos();

        // Crear blob y descargar
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimizador-escalada-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarAlerta('Configuración exportada correctamente', 'success');
    }

    /**
     * Importa la configuración desde JSON
     * @param {Event} event - Evento del input file
     */
    function importarConfiguracion(event) {
        const archivo = event.target.files[0];

        if (!archivo) {
            return;
        }

        const lector = new FileReader();

        lector.onload = function(e) {
            try {
                const datos = JSON.parse(e.target.result);
                const exito = Almacenamiento.importarDatos(datos);

                if (exito) {
                    mostrarAlerta('Configuración importada correctamente', 'success');
                    cargarConfiguracion();
                    renderizarTablaElementos();
                } else {
                    mostrarAlerta('Error al importar la configuración. Verifica el formato del archivo.', 'danger');
                }
            } catch (error) {
                mostrarAlerta('Error al leer el archivo. Asegúrate de que sea un JSON válido.', 'danger');
                console.error('Error al importar:', error);
            }

            // Resetear input file
            event.target.value = '';
        };

        lector.readAsText(archivo);
    }

    /**
     * Limpia todos los datos
     */
    function limpiarTodo() {
        if (!confirm('¿Estás seguro de que deseas eliminar todos los datos? Esta acción no se puede deshacer.')) {
            return;
        }

        Almacenamiento.limpiarTodo();

        // Recargar valores por defecto
        cargarConfiguracion();
        renderizarTablaElementos();

        // Limpiar panel de resultados
        document.getElementById('panelResultado').innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-search" style="font-size: 3rem;"></i>
                <p class="mt-3">Configura los parámetros y presiona <strong>CALCULAR</strong> para ver el resultado.</p>
            </div>
        `;

        mostrarAlerta('Todos los datos han sido eliminados', 'info');
    }

    /**
     * Muestra una alerta temporal
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de alerta (success, danger, info, warning)
     */
    function mostrarAlerta(mensaje, tipo = 'info') {
        const contenedor = document.querySelector('.container-fluid > .row > .col-12');
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alerta.style.zIndex = '9999';
        alerta.style.minWidth = '300px';
        alerta.innerHTML = `
            ${escapeHtml(mensaje)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        contenedor.insertBefore(alerta, contenedor.firstChild);

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            alerta.classList.remove('show');
            setTimeout(() => alerta.remove(), 150);
        }, 5000);
    }

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} texto - Texto a escapar
     * @returns {string} - Texto escapado
     */
    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // Inicializar aplicación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarAplicacion);
    } else {
        inicializarAplicacion();
    }
})();
