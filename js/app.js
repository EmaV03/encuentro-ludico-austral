import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { congresoData } from './data.js';

// ==========================================
// CONFIGURACIÓN DE SUPABASE (BACKEND)
// ==========================================
const supabaseUrl = 'https://faxyzkcbcbqdifgqbwrn.supabase.co';
const supabaseKey = 'sb_publishable_dERM41JTQDftXfJ0AA35DA_3Vlt5AfB';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
const agendaContainer = document.getElementById('agenda-container');
const modalContenedor = document.getElementById('modal-contenedor');
const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertIcon = document.getElementById('custom-alert-icon');
const speakersContainer = document.getElementById('speakers-container');
const modalExpositor = document.getElementById('modal-expositor');

if (!localStorage.getItem('inscripcionesCongreso')) {
    localStorage.setItem('inscripcionesCongreso', JSON.stringify([]));
}

// ==========================================
// CORRECCIÓN DE SCOPE GLOBAL PARA ALERTAS
// ==========================================
window.showCustomAlert = function(tipo, mensaje) {
    const overlay = document.getElementById('custom-alert-overlay');
    const msgEl = document.getElementById('custom-alert-message');
    const iconEl = document.getElementById('custom-alert-icon');
    
    if (msgEl) msgEl.innerHTML = mensaje;
    
    if (iconEl) {
        if (tipo === 'success') {
            iconEl.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        } else {
            iconEl.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }
    }
    
    if (overlay) overlay.classList.remove('hidden');
};

window.closeCustomAlert = function() {
    const overlay = document.getElementById('custom-alert-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};

const alertBtn = document.getElementById('custom-alert-btn');
if (alertBtn) {
    alertBtn.addEventListener('click', window.closeCustomAlert);
}

// ==========================================
// RENDERIZADO DEL CRONOGRAMA (Sincronizado con BD y Perfil)
// ==========================================
window.renderizarAgenda = async function() {
    // 1. Obtenemos TODAS las inscripciones para calcular los cupos reales
    const { data: inscripcionesActivas, error } = await supabase.from('inscripciones').select('taller_id');
    
    const ocupacionTalleres = {};
    if (inscripcionesActivas) {
        inscripcionesActivas.forEach(ins => {
            ocupacionTalleres[ins.taller_id] = (ocupacionTalleres[ins.taller_id] || 0) + 1;
        });
    }

    // 2. Verificamos si hay un usuario logueado y cuáles son sus talleres
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    let misTalleres = [];
    
    if (usuarioActivo) {
        const { data: misInscripciones } = await supabase
            .from('inscripciones')
            .select('taller_id')
            .eq('asistente_id', usuarioActivo.id);
            
        if (misInscripciones) {
            misTalleres = misInscripciones.map(ins => ins.taller_id);
        }
    }

    // 3. Construimos la tabla
    agendaContainer.innerHTML = '';
    const diasKeys = Object.keys(congresoData.cronograma);
    const turnos = ['manana', 'tarde'];

    const wrapper = document.createElement('div');
    wrapper.className = 'agenda-table-wrapper';
    const tabla = document.createElement('table');
    tabla.className = 'agenda-table';

    let theadHTML = `<thead><tr><th class="turno-col">Turno</th>`;
    diasKeys.forEach(diaKey => {
        const dia = congresoData.cronograma[diaKey];
        theadHTML += `<th>${dia.fecha}</th>`;
    });
    theadHTML += `</tr></thead>`;
    tabla.innerHTML = theadHTML;

    const tbody = document.createElement('tbody');
    
    turnos.forEach(turno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="turno-col">${turno.toUpperCase()}</td>`;
        
        diasKeys.forEach(diaKey => {
            const td = document.createElement('td');
            const dia = congresoData.cronograma[diaKey];
            
            if (dia && dia.modulos && dia.modulos[turno] && dia.modulos[turno].length > 0) {
                const talleres = dia.modulos[turno];
                talleres.forEach(taller => {
                    const inscritos = ocupacionTalleres[taller.id] || 0;
                    const cuposReales = taller.cupoMaximo - inscritos;
                    
                    // Lógica para pintar de naranja si el usuario está inscrito
                    let clasesTarjeta = 'taller-card';
                    if (misTalleres.includes(taller.id)) {
                        clasesTarjeta += ' inscrito';
                    }

                    // Lógica de porcentaje para el color del texto de los cupos
                    let porcentajeDisponible = cuposReales / taller.cupoMaximo;
                    let claseCupos = 'cupos-altos'; 
                    
                    if (cuposReales === 0) {
                        claseCupos = 'cupos-agotados';
                    } else if (porcentajeDisponible <= 0.25) {
                        claseCupos = 'cupos-bajos'; // Queda 25% o menos
                    } else if (porcentajeDisponible <= 0.50) {
                        claseCupos = 'cupos-medios'; // Queda la mitad o menos
                    }
                    
                    const card = document.createElement('div');
                    card.className = clasesTarjeta;
                    card.innerHTML = `
                        <h4>${taller.titulo}</h4>
                        <p><strong>Ponente:</strong> ${taller.ponente}</p>
                        <p>Cupos: <span class="${claseCupos}">${cuposReales} / ${taller.cupoMaximo}</span></p>
                    `;
                    card.onclick = () => abrirDetalleTaller(taller, turno, diaKey, cuposReales);
                    td.appendChild(card);
                });
            } else {
                td.innerHTML = '<span style="color: #999; font-style: italic; font-size: 0.9rem;">Sin programación</span>';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    wrapper.appendChild(tabla);
    agendaContainer.appendChild(wrapper);
}

window.abrirDetalleTaller = function(taller, moduloKey, diaKey, cuposReales) {
    const diaTexto = congresoData.cronograma[diaKey].fecha;
    modalContenedor.innerHTML = `
        <div class="modal-content">
            <button class="btn-cerrar" onclick="cerrarModal()">×</button>
            <span style="color: var(--secondary); font-weight:bold; text-transform:uppercase; font-size:0.8rem;">
                ${diaTexto} - Módulo ${moduloKey}
            </span>
            <h2 style="margin-top:5px; color: var(--dark);">${taller.titulo}</h2>
            <p><strong>Impartido por:</strong> ${taller.ponente}</p>
            <p style="background: #F4F4F9; padding: 10px; border-left: 4px solid var(--secondary); font-style: italic;">
                ${taller.resumen}
            </p>
            <p><strong>Cupos disponibles:</strong> <span id="modal-cupos">${cuposReales}</span> / ${taller.cupoMaximo}</p>
            
            <form id="form-registro" class="form-inscripcion">
                <h3>¡Inscríbete a este taller!</h3>
                <div class="campo-grupo">
                    <label>Nombre y Apellido</label>
                    <input type="text" id="ins-nombre" required>
                </div>
                <div class="campo-grupo">
                    <label>Correo Electrónico</label>
                    <input type="email" id="ins-email" required>
                </div>
                <div class="campo-grupo">
                    <label>Número de Teléfono</label>
                    <input type="tel" id="ins-tel" required>
                </div>
                <button type="submit" class="btn-anotarse" ${cuposReales <= 0 ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                    ${cuposReales <= 0 ? 'Cupos Agotados' : 'Confirmar mi Lugar'}
                </button>
            </form>
        </div>
    `;
    modalContenedor.classList.add('active');

    document.getElementById('form-registro').onsubmit = function(e) {
        e.preventDefault();
        procesarInscripcion(taller, moduloKey, diaKey);
    };
}

window.cerrarModal = function() {
    modalContenedor.classList.remove('active');
}

// ==========================================
// SISTEMA DE INSCRIPCIÓN (NUBE)
// ==========================================
window.procesarInscripcion = async function(taller, moduloKey, diaKey) {
    const nombre = document.getElementById('ins-nombre').value.trim();
    const email = document.getElementById('ins-email').value.trim().toLowerCase();
    const tel = document.getElementById('ins-tel').value.trim();

    const btnSubmit = document.querySelector('#form-registro .btn-anotarse');
    btnSubmit.innerText = 'Procesando...';
    btnSubmit.disabled = true;

    try {
        let usuarioId;
        const { data: usuarioExistente, error: errorBusqueda } = await supabase
            .from('asistentes')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (usuarioExistente) {
            usuarioId = usuarioExistente.id;
        } else {
            const { data: nuevoUsuario, error: errorInsert } = await supabase
                .from('asistentes')
                .insert([{ nombre: nombre, email: email, telefono: tel }])
                .select('id')
                .single();
                
            if (errorInsert) throw new Error('El correo o teléfono ya está asociado a otro nombre.');
            usuarioId = nuevoUsuario.id;
        }

        const { error: errorInscripcion } = await supabase
            .from('inscripciones')
            .insert([{
                asistente_id: usuarioId,
                taller_id: taller.id,
                dia_key: diaKey,
                modulo_key: moduloKey
            }]);

        if (errorInscripcion) {
            if (errorInscripcion.code === '23505') {
                showCustomAlert('error', `⚠️ ¡Atención <strong>${nombre}</strong>! Ya estás inscrito a otro taller en el turno de la ${moduloKey} para este mismo día.`);
            } else {
                throw errorInscripcion;
            }
        } else {
            showCustomAlert('success', `¡Excelente, <strong>${nombre}</strong>! Tu lugar en la nube ha sido reservado con éxito.`);
            cerrarModal();
            await renderizarAgenda();
        }

    } catch (err) {
        console.error("Error en inscripción:", err);
        showCustomAlert('error', `❌ No pudimos completar tu registro. ${err.message || 'Verifica tus datos de conexión.'}`);
    } finally {
        if(btnSubmit) {
            btnSubmit.innerText = 'Confirmar mi Lugar';
            btnSubmit.disabled = false;
        }
    }
};

// ==========================================
// MODAL DE CONFIRMACIÓN ASÍNCRONO
// ==========================================
window.mostrarConfirmacion = function(mensaje) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('custom-confirm-overlay');
        const msgEl = document.getElementById('custom-confirm-message');
        const btnConfirmar = document.getElementById('btn-confirmar-accion');
        const btnCancelar = document.getElementById('btn-cancelar-accion');

        msgEl.innerHTML = mensaje;
        overlay.classList.remove('hidden');

        const cleanup = () => {
            overlay.classList.add('hidden');
            btnConfirmar.onclick = null;
            btnCancelar.onclick = null;
        };

        btnConfirmar.onclick = () => { cleanup(); resolve(true); };
        btnCancelar.onclick = () => { cleanup(); resolve(false); };
    });
};

// ==========================================
// PANEL DE USUARIO Y AUTENTICACIÓN
// ==========================================
const modalPerfil = document.getElementById('modal-perfil');
const btnAbrirPerfil = document.getElementById('btn-abrir-perfil');
const btnCerrarPerfil = document.getElementById('btn-cerrar-perfil');
const perfilContenido = document.getElementById('perfil-contenido');

btnAbrirPerfil.onclick = () => {
    modalPerfil.classList.add('active');
    renderizarContenidoPerfil(); 
};

btnCerrarPerfil.onclick = () => {
    modalPerfil.classList.remove('active');
};

function renderizarContenidoPerfil() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

    if (!usuarioActivo) {
        perfilContenido.innerHTML = `
            <p>Ingresa tus datos para ver tus inscripciones:</p>
            <div class="campo-grupo">
                <label>Correo Electrónico</label>
                <input type="email" id="login-email">
            </div>
            <div class="campo-grupo">
                <label>Teléfono</label>
                <input type="tel" id="login-tel">
            </div>
            <button class="btn-anotarse" id="btn-ejecutar-login">Ingresar</button>
        `;
        
        const btnLogin = document.getElementById('btn-ejecutar-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', window.validarUsuario);
        }
        
    } else {
        perfilContenido.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h3 style="margin: 0;">Hola, ${usuarioActivo.nombre}</h3>
                <button onclick="window.mostrarFormularioEdicion()" style="background: none; border: none; color: var(--secondary); font-weight: bold; cursor: pointer; text-decoration: underline; font-size: 0.9rem;">
                    ✏️ Editar datos
                </button>
            </div>
            <p style="font-size: 0.85rem; color: #666; margin-top: 0; margin-bottom: 20px;">
                📧 ${usuarioActivo.email} <br> 📱 ${usuarioActivo.telefono}
            </p>
            <hr style="border: 0.5px solid #E2E8F0; margin-bottom: 15px;">
            <div id="lista-mis-talleres">Cargando tus talleres...</div>
            <button id="btn-ejecutar-logout" class="btn-anotarse" style="margin-top:20px; background-color: var(--dark);">Cerrar sesión</button>
        `;
        
        const btnLogout = document.getElementById('btn-ejecutar-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', window.cerrarSesion);
        }
        
        cargarTalleresUsuario(usuarioActivo);
    }
}

window.validarUsuario = async function() {
    const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
    const telInput = document.getElementById('login-tel').value.trim();

    if (!emailInput || !telInput) {
        showCustomAlert('error', '⚠️ Por favor, completa tu correo y teléfono para ingresar.');
        return;
    }

    const btn = document.getElementById('btn-ejecutar-login');
    if(btn) {
        btn.innerText = 'Buscando...';
        btn.disabled = true;
    }

    try {
        const { data: usuario, error } = await supabase
            .from('asistentes')
            .select('*')
            .eq('email', emailInput)
            .eq('telefono', telInput)
            .maybeSingle();

        if (error || !usuario) {
            showCustomAlert('error', '❌ No encontramos un registro con esos datos. Verifica que el correo y el teléfono sean los que usaste al inscribirte.');
            if(btn) {
                btn.innerText = 'Ingresar';
                btn.disabled = false;
            }
            return;
        }

        localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
        showCustomAlert('success', `¡Qué bueno verte de nuevo, <strong>${usuario.nombre}</strong>!`);
        renderizarContenidoPerfil();

    } catch (err) {
        console.error("Error de conexión:", err);
        showCustomAlert('error', '⚠️ Hubo un problema de conexión con el servidor. Intenta nuevamente en unos segundos.');
    } finally {
        if(btn) {
            btn.innerText = 'Ingresar';
            btn.disabled = false;
        }
    }
};

window.cerrarSesion = function() {
    localStorage.removeItem('usuarioActivo');
    renderizarContenidoPerfil(); 
    showCustomAlert('success', 'Has cerrado sesión correctamente.');
};

window.cargarTalleresUsuario = async function(usuario) {
    const listaContenedor = document.getElementById('lista-mis-talleres');
    listaContenedor.innerHTML = '<p style="color: var(--dark); font-weight: bold;">Buscando tus inscripciones en el servidor...</p>';

    try {
        const { data: inscripciones, error } = await supabase
            .from('inscripciones')
            .select('*')
            .eq('asistente_id', usuario.id);

        if (error) throw error;

        if (inscripciones.length === 0) {
            listaContenedor.innerHTML = '<p style="color: #666; font-style: italic;">Aún no te has anotado a ningún taller.</p>';
            return;
        }

        let html = '';
        inscripciones.forEach(ins => {
            const modulosDelDia = congresoData.cronograma[ins.dia_key].modulos[ins.modulo_key];
            const tallerData = modulosDelDia.find(t => t.id === ins.taller_id);
            const titulo = tallerData ? tallerData.titulo : 'Taller no encontrado';
            const fecha = congresoData.cronograma[ins.dia_key].fecha;

            html += `
                <div class="taller-inscrito-card" style="margin-bottom: 12px;">
                    <div>
                        <h4 style="margin: 0; color: var(--dark); font-size: 1rem;">${titulo}</h4>
                        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #555;">
                            📅 ${fecha} <br> 🕒 Turno: ${ins.modulo_key.toUpperCase()}
                        </p>
                    </div>
                    <button class="btn-baja" onclick="window.darseDeBaja('${ins.id}', '${titulo}')">
                        Darse de baja
                    </button>
                </div>
            `;
        });

        listaContenedor.innerHTML = html;

    } catch (err) {
        console.error("Error al cargar talleres:", err);
        listaContenedor.innerHTML = '<p style="color: #FF6B6B;">❌ Hubo un error al cargar tus datos.</p>';
    }
};

window.darseDeBaja = async function(inscripcionId, tituloTaller) {
    const confirmado = await mostrarConfirmacion(`¿Estás completamente seguro de que deseas liberar tu cupo para <strong>"${tituloTaller}"</strong>?<br>Esta acción no se puede deshacer.`);
    
    if (!confirmado) return;

    try {
        const { error } = await supabase
            .from('inscripciones')
            .delete()
            .eq('id', inscripcionId);

        if (error) throw error;

        showCustomAlert('success', '✅ Te has dado de baja exitosamente. ¡Gracias por liberar el cupo para otro entusiasta!');
        
        await renderizarAgenda();

        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
        cargarTalleresUsuario(usuarioActivo);

    } catch (err) {
        console.error("Error al dar de baja:", err);
        showCustomAlert('error', '❌ Tuvimos un problema de conexión al intentar liberar el cupo. Intenta de nuevo.');
    }
};

// ==========================================
// RESTO DE FUNCIONES VISUALES
// ==========================================
function renderizarSponsors() {
    const sponsorsGrid = document.querySelector('.sponsors-grid');
    if (!sponsorsGrid) return;
    sponsorsGrid.innerHTML = '';
    
    const todosLosSponsors = [...congresoData.sponsors.diamante, ...congresoData.sponsors.oro];
    todosLosSponsors.forEach(sponsor => {
        const card = document.createElement('a'); 
        card.className = 'sponsor-card';
        card.href = sponsor.url;
        card.target = "_blank";
        card.innerHTML = `
            <img src="${sponsor.logo}" alt="Logo de ${sponsor.nombre}">
            <h4>${sponsor.nombre}</h4>
        `;
        sponsorsGrid.appendChild(card);
    });
}

function iniciarHeroSlider() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const imagenesFondo = [
        'Imagenes/HeroTitle.jpg',
        'Imagenes/HeroTitle2.jpg',
        'Imagenes/HeroTitle3.jpg',
        'Imagenes/HeroTitle4.jpg',
        'Imagenes/HeroTitle5.jpg'
    ];

    let indiceActual = 0;

    function cambiarFondo() {
        heroSection.style.backgroundImage = `url('${imagenesFondo[indiceActual]}')`;
        indiceActual = (indiceActual + 1) % imagenesFondo.length;
    }

    cambiarFondo();
    setInterval(cambiarFondo, 5000);
}

function renderizarExpositores() {
    if (!speakersContainer) return;
    speakersContainer.innerHTML = '';
    
    congresoData.expositores.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'speaker-card';
        card.style.cursor = 'pointer'; 
        card.onclick = () => abrirModalExpositor(exp.id);
        
        card.innerHTML = `
            <div class="speaker-avatar">${exp.avatar}</div>
            <h3>${exp.nombre}</h3>
            <h4>${exp.titulo}</h4>
            <p>${exp.bio}</p>
        `;
        speakersContainer.appendChild(card);
    });
}

window.abrirModalExpositor = function(expId) {
    const expositor = congresoData.expositores.find(e => e.id === expId);
    if (!expositor) return;

    let talleresHTML = '';
    Object.keys(congresoData.cronograma).forEach(diaKey => {
        const dia = congresoData.cronograma[diaKey];
        ['manana', 'tarde'].forEach(turno => {
            if (dia.modulos && dia.modulos[turno]) {
                dia.modulos[turno].forEach(taller => {
                    if (taller.ponente === expositor.nombre) {
                        talleresHTML += `
                            <li style="margin-bottom: 12px; list-style: none;">
                                📍 <a href="javascript:void(0)" 
                                   onclick="cerrarModalExpositor(); abrirDetalleTallerPorIds('${taller.id}', '${turno}', '${diaKey}')" 
                                   class="link-taller-cruzado">
                                    ${taller.titulo} <br>
                                    <span style="font-size: 0.85rem; color: #666;">(${dia.fecha} - Turno ${turno.toUpperCase()})</span>
                                </a>
                            </li>
                        `;
                    }
                });
            }
        });
    });

    if (talleresHTML === '') {
        talleresHTML = '<p style="color: #999; font-style: italic;">Sin talleres asignados aún.</p>';
    }

    const enlaceWeb = expositor.web 
        ? `<a href="${expositor.web}" target="_blank" class="cta-button" style="padding: 8px 15px; font-size: 0.9rem; margin-top: 0;">Visitar su Portal</a>` 
        : '';

    modalExpositor.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <button class="btn-cerrar" onclick="cerrarModalExpositor()">×</button>
            <div class="speaker-avatar" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 15px auto;">${expositor.avatar}</div>
            <h2 style="margin: 0; color: var(--dark);">${expositor.nombre}</h2>
            <h4 style="color: var(--secondary); margin-top: 5px;">${expositor.titulo}</h4>
            <p style="font-size: 1.05rem; line-height: 1.6;">${expositor.bio}</p>
            ${enlaceWeb}
            
            <hr style="border: 1px dashed #ccc; margin: 25px 0;">
            
            <h3 style="text-align: left; color: var(--primary); font-size: 1.2rem;">Talleres que dicta:</h3>
            <ul style="text-align: left; padding: 0;">
                ${talleresHTML}
            </ul>
        </div>
    `;
    modalExpositor.classList.add('active');
}

window.cerrarModalExpositor = function() {
    modalExpositor.classList.remove('active');
}

window.abrirDetalleTallerPorIds = function(tallerId, moduloKey, diaKey) {
    const talleres = congresoData.cronograma[diaKey].modulos[moduloKey];
    const taller = talleres.find(t => t.id === tallerId);
    if(taller) {
        abrirDetalleTaller(taller, moduloKey, diaKey, taller.cupoMaximo);
    }
}

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('keydown', function(event) {
    const isAlertVisible = !customAlertOverlay.classList.contains('hidden');
    const isTallerModalVisible = modalContenedor.classList.contains('active');
    const isExpositorModalVisible = modalExpositor.classList.contains('active');

    if (event.key === 'Escape') {
        if (isAlertVisible) closeCustomAlert();
        else if (isTallerModalVisible) cerrarModal();
        else if (isExpositorModalVisible) cerrarModalExpositor();
    }
    if (event.key === 'Enter' && isAlertVisible) {
        event.preventDefault();
        closeCustomAlert();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderizarAgenda();
    renderizarSponsors();
    renderizarExpositores();
    if(typeof iniciarHeroSlider === 'function') iniciarHeroSlider();
});

// ==========================================
// EDICIÓN DE PERFIL (ACTUALIZAR DATOS)
// ==========================================
window.mostrarFormularioEdicion = function() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    
    perfilContenido.innerHTML = `
        <h3 style="margin-top: 0; color: var(--dark);">Actualizar Mis Datos</h3>
        <p style="font-size: 0.9rem; color: #666;">Modifica tu correo o teléfono si te equivocaste al registrarte.</p>
        
        <div class="campo-grupo">
            <label>Correo Electrónico</label>
            <input type="email" id="edit-email" value="${usuarioActivo.email}">
        </div>
        <div class="campo-grupo">
            <label>Teléfono</label>
            <input type="tel" id="edit-tel" value="${usuarioActivo.telefono}">
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button class="btn-anotarse" id="btn-guardar-datos" onclick="window.guardarNuevosDatos()" style="margin-top: 0;">Guardar</button>
            <button class="btn-anotarse" onclick="renderizarContenidoPerfil()" style="margin-top: 0; background-color: #E2E8F0; color: var(--dark);">Cancelar</button>
        </div>
    `;
};

window.guardarNuevosDatos = async function() {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    const nuevoEmail = document.getElementById('edit-email').value.trim().toLowerCase();
    const nuevoTel = document.getElementById('edit-tel').value.trim();
    const btnGuardar = document.getElementById('btn-guardar-datos');

    if (!nuevoEmail || !nuevoTel) {
        showCustomAlert('error', '⚠️ Los campos no pueden estar vacíos.');
        return;
    }

    if (nuevoEmail === usuarioActivo.email && nuevoTel === usuarioActivo.telefono) {
        renderizarContenidoPerfil(); // No hay cambios
        return;
    }

    btnGuardar.innerText = 'Guardando...';
    btnGuardar.disabled = true;

    try {
        // Actualizamos en Supabase usando el ID del usuario
        const { error } = await supabase
            .from('asistentes')
            .update({ email: nuevoEmail, telefono: nuevoTel })
            .eq('id', usuarioActivo.id);

        if (error) {
            // Manejo de error si el email ya existe en otro usuario (Violación Unique)
            if (error.code === '23505') { 
                throw new Error('Ese correo o teléfono ya está siendo utilizado por otro usuario.');
            }
            throw error;
        }

        // Si todo sale bien, actualizamos la memoria local
        usuarioActivo.email = nuevoEmail;
        usuarioActivo.telefono = nuevoTel;
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioActivo));

        showCustomAlert('success', '✅ Tus datos se han actualizado correctamente.');
        renderizarContenidoPerfil(); // Volvemos a la vista principal

    } catch (err) {
        console.error("Error al actualizar datos:", err);
        showCustomAlert('error', `❌ No pudimos guardar los cambios. ${err.message}`);
    } finally {
        if(btnGuardar) {
            btnGuardar.innerText = 'Guardar';
            btnGuardar.disabled = false;
        }
    }
};

// ==========================================
// CONTADOR EN CUENTA REGRESIVA
// ==========================================
function iniciarContador() {
    // Fecha de inicio del congreso: 14 de Agosto de 2026, 09:00 AM
    const fechaInicio = new Date('August 14, 2026 09:00:00').getTime();

    const actualizarReloj = setInterval(function() {
        const ahora = new Date().getTime();
        const distancia = fechaInicio - ahora;

        // Cálculos matemáticos para días, horas, minutos y segundos
        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        const elDias = document.getElementById('cd-dias');
        if (!elDias) {
            clearInterval(actualizarReloj);
            return; // Detener si el elemento no existe en el DOM
        }
        
        // Insertar en el HTML con ceros a la izquierda si es menor a 10
        elDias.innerText = dias < 10 ? '0' + dias : dias;
        document.getElementById('cd-horas').innerText = horas < 10 ? '0' + horas : horas;
        document.getElementById('cd-mins').innerText = minutos < 10 ? '0' + minutos : minutos;
        document.getElementById('cd-segs').innerText = segundos < 10 ? '0' + segundos : segundos;

        // Si la cuenta regresiva termina (llegó la fecha)
        if (distancia < 0) {
            clearInterval(actualizarReloj);
            document.getElementById('contador-ludico').innerHTML = '<h3 style="color: var(--secondary); background: var(--white); padding: 10px 20px; border-radius: 8px; border: 3px dashed var(--primary); display: inline-block;">¡El congreso ha comenzado!</h3>';
        }
    }, 1000);
}

// Asegúrate de modificar tu DOMContentLoaded actual para que quede así:
document.addEventListener('DOMContentLoaded', () => {
    renderizarAgenda();
    renderizarSponsors();
    renderizarExpositores();
    if(typeof iniciarHeroSlider === 'function') iniciarHeroSlider();
    iniciarContador(); // <--- Arrancamos el reloj
});