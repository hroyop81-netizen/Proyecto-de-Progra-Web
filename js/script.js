const botonToggle = document.getElementById('menu-toggle');
        const menuMovil = document.getElementById('menu-movil');
        const contadorCarrito = document.getElementById('contador-carrito');
        const listaCarrito = document.getElementById('lista-carrito');
        const totalCarritoElemento = document.getElementById('total-carrito');
        
        const campoBusqueda = document.getElementById('campo-busqueda');
        const resultadosBusqueda = document.getElementById('resultados-busqueda');

        // SUGERENCIAS INICIALES: Usar las primeras 4 IDs del catálogo.
        // Se define con datos básicos, pero luego se busca el producto completo en todosLosProductos.
        const SUGERENCIAS_INICIALES = [
            { id: "1", nombre: "Camiseta Selección Local", tipo: "Temporada Actual", precio: "65.50", imagen: "img/cam1.jpg", filtro: "seleccion", precioAnterior: "" },
            { id: "2", nombre: "Camiseta Oferta Crack", tipo: "Oferta Especial", precio: "49.99", imagen: "img/cam2.jpg", filtro: "oferta", precioAnterior: "75.00" },
            { id: "3", nombre: "Camiseta Leyenda Vintage", tipo: "Edición Limitada", precio: "99.99", imagen: "img/cam3.jpg", filtro: "vintage", precioAnterior: "" },
            { id: "4", nombre: "Camiseta Club Visitante", tipo: "Nueva Colección", precio: "80.00", imagen: "img/cam4.jpg", filtro: "club", precioAnterior: "" }
        ];

        const IDS_INICIALES = ["1", "2", "3", "4", "5", "6"];

        let carrito = JSON.parse(localStorage.getItem('carritoCamsi')) || [];
        
        let todosLosProductos = [];
        

        function cambiarPagina(paginaId) {
            document.querySelectorAll('.pagina').forEach(section => {
                section.classList.remove('visible');
            });

            const pagina = document.getElementById(paginaId);
            if (pagina) {
                pagina.classList.add('visible');
            }

            document.querySelectorAll('.menu-navegacion a, .menu-movil a').forEach(link => {
                link.classList.remove('enlace-activo');
            });
            document.querySelectorAll(`a[data-page="${paginaId}"]`).forEach(link => {
                link.classList.add('enlace-activo');
            });

            if (paginaId === 'carrito') {
                renderizarCarrito();
            } else if (paginaId === 'buscar') {
                buscarProductos();
            } else if (paginaId === 'camisetas') {
                mostrarProductosInicialesDelCatalogo();
            }

            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.scrollIntoView({ behavior: 'smooth' }); 
            }
        }
        
        window.toggle = function(id) {
            const elemento = document.getElementById(id);
            if (elemento) {
                const estaOculto = elemento.style.display === 'none' || elemento.style.display === '';
                elemento.style.display = estaOculto ? 'block' : 'none';
            }
        }
        
        function actualizarContador() {
            const totalItems = carrito.length;
            contadorCarrito.textContent = totalItems;
        }

        function calcularTotal() {
            const total = carrito.reduce((sum, item) => sum + (parseFloat(item.precio) * 1), 0);
            totalCarritoElemento.textContent = `Bs${total.toFixed(2)}`;
        }
        
        function guardarCarrito() {
            localStorage.setItem('carritoCamsi', JSON.stringify(carrito));
            actualizarContador();
            calcularTotal();
        }

        function agregarAlCarrito(producto) {
            carrito.push(producto);
            guardarCarrito();
            alert(`"${producto.nombre} - Talla ${producto.talla}" añadido al carrito!`);
        }

        function eliminarItem(index) {
            carrito.splice(index, 1); 
            guardarCarrito();
            renderizarCarrito();
        }

        

        function renderizarCarrito() {
            listaCarrito.innerHTML = ''; 

            if (carrito.length === 0) {
                listaCarrito.innerHTML = `<p style="text-align: center; padding: 30px; color: var(--color-texto-gris);">El carrito está vacío. ¡Añade algunas camisetas!</p>`;
                
                document.querySelector('.acciones-carrito a').style.display = 'none';
                calcularTotal();
                return;
            }
            
            
            document.querySelector('.acciones-carrito a').style.display = 'inline-block';

            carrito.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('item-carrito');
                li.innerHTML = `
                    <div class="info-item">
                        <strong>${item.nombre}</strong>
                        <span>Talla: ${item.talla} | Precio: Bs${parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                    <button class="boton-eliminar-uno" data-index="${index}">Eliminar</button>
                `;
                listaCarrito.appendChild(li);
            });
            
            document.querySelectorAll('.boton-eliminar-uno').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    eliminarItem(index);
                });
            });

            calcularTotal();
        }

        
        function obtenerTodosLosProductos() {
            const productos = [];
            document.querySelectorAll('.tarjeta-producto').forEach(tarjeta => {
                const id = tarjeta.getAttribute('data-id');
                
                if (!productos.some(p => p.id === id)) {
                    let precioAnterior = '';
                    const precioAnteriorElement = tarjeta.querySelector('.precio-anterior');
                    if (precioAnteriorElement) {
                        precioAnterior = precioAnteriorElement.textContent;
                    }
                    
                     productos.push({
                        id: id,
                        nombre: tarjeta.querySelector('.nombre-producto').textContent,
                        tipo: tarjeta.querySelector('.tipo-producto').textContent,
                        precio: tarjeta.querySelector('.precio-actual').getAttribute('data-precio'),
                        precioFormato: tarjeta.querySelector('.precio-actual').textContent,
                        precioAnterior: precioAnterior,
                        imagen: tarjeta.querySelector('img').getAttribute('src'),
                        filtro: tarjeta.getAttribute('data-filtro')
                    });
                }
            });
            return productos;
        }

        function buscarProductos() {
            const termino = campoBusqueda.value.toLowerCase().trim();
            resultadosBusqueda.innerHTML = '';
            
            // MODIFICACIÓN: Mostrar sugerencias si no hay término de búsqueda (menos de 2 caracteres)
            if (termino.length < 2) {
                resultadosBusqueda.innerHTML = `<p id="mensaje-busqueda" style="grid-column: 1 / -1; text-align: center; font-weight: 600; color: var(--color-principal); margin-bottom: 20px;">Sugerencias Populares:</p>`;
                
                // Iterar sobre las sugerencias iniciales
                SUGERENCIAS_INICIALES.forEach(sugerencia => {
                    // Buscar el producto completo en el array `todosLosProductos` usando la ID
                    const productoCompleto = todosLosProductos.find(p => p.id === sugerencia.id);
                    if (productoCompleto) {
                        resultadosBusqueda.appendChild(crearTarjetaProducto(productoCompleto));
                    }
                });
                asignarListenersCarrito();
                return;
            }
            
            // Lógica de búsqueda original si hay un término
            const productosAMostrar = todosLosProductos.filter(producto => {
                return producto.nombre.toLowerCase().includes(termino) ||
                       producto.tipo.toLowerCase().includes(termino) ||
                       (producto.filtro && producto.filtro.toLowerCase().includes(termino));
            });

            if (productosAMostrar.length === 0) {
                resultadosBusqueda.innerHTML = `<p id="mensaje-busqueda" style="grid-column: 1 / -1; text-align: center; color: var(--color-texto-gris);">No se encontraron resultados para "${termino}".</p>`;
                return;
            }

            productosAMostrar.forEach(producto => {
                resultadosBusqueda.appendChild(crearTarjetaProducto(producto));
            });
            
            asignarListenersCarrito();
        }
        
        function crearTarjetaProducto(producto) {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjeta-producto');
            tarjeta.setAttribute('data-id', producto.id);
            tarjeta.setAttribute('data-filtro', producto.filtro || '');
            
            if (producto.tipo.toLowerCase().includes('oferta')) {
                tarjeta.classList.add('oferta');
            }
            
            tarjeta.innerHTML = `
                <img src="${producto.imagen}" alt="Camiseta ${producto.nombre}">
                <div class="info-producto">
                    <h3 class="nombre-producto">${producto.nombre}</h3>
                    <span class="tipo-producto">${producto.tipo}</span>
                    <div class="contenedor-precio">
                        <span class="precio-actual" data-precio="${producto.precio}">Bs${parseFloat(producto.precio).toFixed(2)}</span>
                        ${producto.precioAnterior ? `<span class="precio-anterior">${producto.precioAnterior}</span>` : ''}
                    </div>
                    <select class="selector-talla">
                        <option value="">Seleccionar Talla</option>
                        <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                    </select>
                    <button class="boton-agregar-carrito" data-id="${producto.id}">Añadir al Carrito</button>
                </div>
            `;
            return tarjeta;
        }

        function mostrarProductosInicialesDelCatalogo() {
            const grid = document.getElementById('camisetas-grid');
            if (!grid) return;
            
            const productos = grid.querySelectorAll('.tarjeta-producto');
            productos.forEach(producto => {
                const id = producto.getAttribute('data-id');
                
                if (IDS_INICIALES.includes(id)) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });
        }


        function filtrarProductos(filtro) {
            const grid = document.getElementById('camisetas-grid');
            const productos = grid.querySelectorAll('.tarjeta-producto');
            
            productos.forEach(producto => {
                const productoFiltro = producto.getAttribute('data-filtro');

                if (productoFiltro === filtro) {
                    producto.style.display = 'block';
                } else {
                    producto.style.display = 'none';
                }
            });

        }
        
        

        function asignarListenersCarrito() {
            document.querySelectorAll('.boton-agregar-carrito').forEach(button => {
                button.removeEventListener('click', handleAgregarCarrito);
                button.addEventListener('click', handleAgregarCarrito);
            });
        }
        
        function handleAgregarCarrito(e) {
            const id = e.target.getAttribute('data-id');
            const tarjeta = e.target.closest('.tarjeta-producto'); 
            if (!tarjeta) return;
            
            const tallaSelect = tarjeta.querySelector('.selector-talla');
            const talla = tallaSelect.value;
            const nombre = tarjeta.querySelector('.nombre-producto').textContent;
            const precio = tarjeta.querySelector('.precio-actual').getAttribute('data-precio');
            
            if (!talla || talla === "") {
                alert(`Por favor, selecciona una talla para la camiseta de ${nombre}.`);
                return;
            }

            agregarAlCarrito({
                id: id,
                nombre: nombre,
                talla: talla,
                precio: precio
            });
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            
            // Inicializa todosLosProductos al cargar la página.
            todosLosProductos = obtenerTodosLosProductos();
            actualizarContador();
            calcularTotal();
            
            
            campoBusqueda.addEventListener('input', buscarProductos);

            asignarListenersCarrito();
            
            document.querySelectorAll('[data-page]').forEach(linkOrButton => {
                linkOrButton.addEventListener('click', (e) => {
                    if (linkOrButton.tagName === 'A') {
                        e.preventDefault(); 
                    }
                    
                    const paginaDestino = linkOrButton.getAttribute('data-page');
                    
                    if (paginaDestino) {
                        cambiarPagina(paginaDestino);
                    }

                    if (menuMovil.classList.contains('mostrar')) {
                        menuMovil.classList.remove('mostrar');
                        botonToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            document.querySelectorAll('.boton-filtro, .btn-filtro').forEach(button => {
                button.addEventListener('click', (e) => {
                    const filtro = e.target.getAttribute('data-filtro');
                    filtrarProductos(filtro);
                });
            });


            botonToggle.addEventListener('click', () => {
                menuMovil.classList.toggle('mostrar');
                const isExpanded = botonToggle.getAttribute('aria-expanded') === 'true';
                botonToggle.setAttribute('aria-expanded', !isExpanded);
            });
            

            if (!document.querySelector('.pagina.visible')) {
                cambiarPagina('inicio'); 
            }
        });


        const btnPagar = document.getElementById('btn-pagar');
        const formularioPago = document.getElementById('formulario-pago');
        const totalPagar = document.getElementById('total-pagar');
        const pagoForm = document.getElementById('pago-form');

        btnPagar.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío.');
                return;
            }

            // Mostrar formulario
            formularioPago.style.display = 'block';

            // Calcular total
            const total = carrito.reduce((sum, item) => {
                return sum + parseFloat(item.precio);
                    }, 0);

            totalPagar.innerText = `Total a pagar: Bs${total.toFixed(2)}`;
            });

            // Enviar formulario (MODIFICACIONES: Vaciar y ocultar)
            pagoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const datos = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                direccion: document.getElementById('direccion').value,
                telefono: document.getElementById('telefono').value,
                carrito: carrito
            };

            console.log("Datos listos para procesar pago:", datos);

            alert("Pedido confirmado. Aquí iría la integración de pago real.");

            // Adicional: Vaciar el carrito
            carrito = [];
            guardarCarrito();
            renderizarCarrito(); // Para actualizar la vista del carrito

            // Vaciar el formulario
            pagoForm.reset();
            // Desaparecer el formulario
            formularioPago.style.display = 'none';

        
        });

        // Lógica del Formulario de Contacto (MODIFICADA)
        const contactoForm = document.getElementById('contacto-form'); 

        if (contactoForm) {
            contactoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Mostrar la alerta solicitada
                alert("Gracias por contactarse con Nosotros!!");

                // Limpiar el formulario después del envío
                contactoForm.reset();
            });
        }