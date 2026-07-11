import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { congresoData } from './data.js';

// ==========================================
// LLAVE MAESTRA: CONTROL DE INSCRIPCIONES
// ==========================================
// Cambia 'false' por 'true' cuando quieras que la gente pueda anotarse a los talleres.
const INSCRIPCIONES_ABIERTAS = false; 

// ==========================================
// CONFIGURACIÓN DE SUPABASE (BACKEND)
// ==========================================
const supabaseUrl = 'https://faxyzkcbcbqdifgqbwrn.supabase.co';
const supabaseKey = 'sb_publishable_dERM41JTQDftXfJ0AA35DA_3Vlt5AfB';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// REFERENCIAS AL DOM
// ==========================================
const agendaContainer = document.getElementById('talleres-container'); 
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
    if (overlay) overlay.classList.add('hidden');
};

const alertBtn = document.getElementById('custom-alert-btn');
if (alertBtn) alertBtn.addEventListener('click', window.closeCustomAlert);

// ==========================================
// RENDERIZAR AGENDA GENERAL (TABS) - CORREGIDO
// ==========================================
window.iniciarTabsAgenda = function() {
    const tabsContainer = document.getElementById('tabs-agenda-container');
    const contentContainer = document.getElementById('contenido-agenda-dinamico');
    if (!tabsContainer || !contentContainer) return;

    let tabsHTML = '';
    congresoData.agendaGeneral.forEach((dia, index) => {
        const isActive = index === 0 ? 'active' : '';
        tabsHTML += `<button class="tab-btn ${isActive}" onclick="window.cambiarDiaAgenda('${dia.id}')">${dia.dia} - ${dia.fecha}</button>`;
    });
    tabsContainer.innerHTML = tabsHTML;

    // Mostrar el primer día por defecto
    window.cambiarDiaAgenda(congresoData.agendaGeneral[0].id);
};

window.cambiarDiaAgenda = function(diaId) {
    const botones = document.querySelectorAll('.tab-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    const btnActivo = Array.from(botones).find(b => b.innerText.includes(diaId === 'dia1' ? '1er' : diaId === 'dia2' ? '2º' : '3er'));
    if (btnActivo) btnActivo.classList.add('active');

    const diaData = congresoData.agendaGeneral.find(d => d.id === diaId);
    const contentContainer = document.getElementById('contenido-agenda-dinamico');
    
    let eventosHTML = '';
    diaData.eventos.forEach(ev => {
        eventosHTML += `
            <div class="evento-item">
                <div class="evento-hora">${ev.hora}</div>
                <div class="evento-titulo">${ev.titulo}</div>
            </div>
        `;
    });

    contentContainer.innerHTML = `
        <div class="agenda-dia-card">
            <h3>${diaData.fecha}</h3>
            ${eventosHTML}
        </div>
    `;
};


// ==========================================
// RENDERIZADO DEL CRONOGRAMA DE TALLERES
// ==========================================
window.renderizarAgenda = async function() {
    if (!agendaContainer) return;
    
    const { data: inscripcionesActivas } = await supabase.from('inscripciones').select('taller_id');
    const ocupacionTalleres = {};
    if (inscripcionesActivas) {
        inscripcionesActivas.forEach(ins => {
            ocupacionTalleres[ins.taller_id] = (ocupacionTalleres[ins.taller_id] || 0) + 1;
        });
    }

    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    let misTalleres = [];
    if (usuarioActivo) {
        const { data: misInscripciones } = await supabase.from('inscripciones').select('taller_id').eq('asistente_id', usuarioActivo.id);
        if (misInscripciones) misTalleres = misInscripciones.map(ins => ins.taller_id);
    }

    agendaContainer.innerHTML = '';
    const diasKeys = Object.keys(congresoData.cronograma);
    const turnos = ['manana', 'tarde'];

    const wrapper = document.createElement('div');
    wrapper.className = 'agenda-table-wrapper';
    const tabla = document.createElement('table');
    tabla.className = 'agenda-table';

    let theadHTML = `<thead><tr><th class="turno-col">Horario</th>`;
    diasKeys.forEach(diaKey => {
        theadHTML += `<th>${congresoData.cronograma[diaKey].fecha}</th>`;
    });
    theadHTML += `</tr></thead>`;
    tabla.innerHTML = theadHTML;

    const tbody = document.createElement('tbody');
    
    turnos.forEach(turno => {
        const tr = document.createElement('tr');
        const textoHora = turno === 'manana' ? '14:00 HRS' : '15:45 HRS';
        tr.innerHTML = `<td class="turno-col" style="color: var(--primary); font-size: 1.1rem; font-weight: bold;">${textoHora}</td>`;
        
        diasKeys.forEach(diaKey => {
            const td = document.createElement('td');
            const dia = congresoData.cronograma[diaKey];
            
            if (dia && dia.modulos && dia.modulos[turno] && dia.modulos[turno].length > 0) {
                const talleres = dia.modulos[turno];
                talleres.forEach(taller => {
                    const inscritos = ocupacionTalleres[taller.id] || 0;
                    const cuposReales = taller.cupoMaximo - inscritos;
                    
                    let clasesTarjeta = 'taller-card';
                    if (misTalleres.includes(taller.id)) clasesTarjeta += ' inscrito';

                    let porcentajeDisponible = cuposReales / taller.cupoMaximo;
                    let claseCupos = 'cupos-altos'; 
                    if (cuposReales === 0) claseCupos = 'cupos-agotados';
                    else if (porcentajeDisponible <= 0.25) claseCupos = 'cupos-bajos';
                    else if (porcentajeDisponible <= 0.50) claseCupos = 'cupos-medios';
                    
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
};

window.abrirDetalleTaller = function(taller, moduloKey, diaKey, cuposReales) {
    const diaTexto = congresoData.cronograma[diaKey].fecha;
    const horaTexto = moduloKey === 'manana' ? '14:00 hrs' : '15:45 hrs'; 
    
    // Evaluamos la Llave Maestra para ver qué mostramos
    let bloqueInscripcion = '';
    if (INSCRIPCIONES_ABIERTAS) {
        bloqueInscripcion = `
            <form id="form-registro" class="form-inscripcion">
                <h3>¡Inscríbete a este taller!</h3>
                <div class="campo-grupo"><label>Nombre y Apellido</label><input type="text" id="ins-nombre" required></div>
                <div class="campo-grupo"><label>Correo Electrónico</label><input type="email" id="ins-email" required></div>
                <div class="campo-grupo"><label>Número de Teléfono</label><input type="tel" id="ins-tel" required></div>
                <button type="submit" class="btn-anotarse" ${cuposReales <= 0 ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                    ${cuposReales <= 0 ? 'Cupos Agotados' : 'Confirmar mi Lugar'}
                </button>
            </form>
        `;
    } else {
        bloqueInscripcion = `
            <div class="form-inscripcion" style="text-align: center; padding: 20px;">
                <h3 style="color: #f6961a; margin-top: 0; font-size: 1.3rem;">Inscripciones Cerradas</h3>
                <p style="color: #555; margin-bottom: 0; font-weight: bold;">Próximamente habilitaremos el sistema para que puedas reservar tu lugar en este taller.</p>
            </div>
        `;
    }

    modalContenedor.innerHTML = `
        <div class="modal-content">
            <button class="btn-cerrar" onclick="cerrarModal()">×</button>
            <span style="color: var(--secondary); font-weight:bold; text-transform:uppercase; font-size:0.8rem;">
                ${diaTexto} - ${horaTexto}
            </span>
            <h2 style="margin-top:5px; color: var(--dark);">${taller.titulo}</h2>
            <p><strong>Impartido por:</strong> ${taller.ponente}</p>
            <p style="background: #F4F4F9; padding: 10px; border-left: 4px solid var(--secondary); font-style: italic;">
                ${taller.resumen}
            </p>
            <p><strong>Cupos disponibles:</strong> <span id="modal-cupos">${cuposReales}</span> / ${taller.cupoMaximo}</p>
            
            ${bloqueInscripcion}
        </div>
    `;
    modalContenedor.classList.add('active');
    
    if (INSCRIPCIONES_ABIERTAS) {
        document.getElementById('form-registro').onsubmit = function(e) {
            e.preventDefault();
            procesarInscripcion(taller, moduloKey, diaKey);
        };
    }
};

window.cerrarModal = function() {
    modalContenedor.classList.remove('active');
};

// ==========================================
// SISTEMA DE INSCRIPCIÓN 
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
        let usuarioGuardar;
        
        const { data: usuarioExistente, error: errorBusqueda } = await supabase
            .from('asistentes')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (usuarioExistente) {
            usuarioId = usuarioExistente.id;
            usuarioGuardar = usuarioExistente;
        } else {
            const { data: nuevoUsuario, error: errorInsert } = await supabase
                .from('asistentes')
                .insert([{ nombre: nombre, email: email, telefono: tel }])
                .select('*')
                .single();
                
            if (errorInsert) throw new Error('El correo o teléfono ya está asociado a otro nombre.');
            usuarioId = nuevoUsuario.id;
            usuarioGuardar = nuevoUsuario;
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
                showCustomAlert('error', `⚠️ ¡Atención <strong>${nombre}</strong>! Ya estás inscrito a otro taller en este mismo turno.`);
            } else {
                throw errorInscripcion;
            }
        } else {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioGuardar));
            showCustomAlert('success', `¡Excelente, <strong>${nombre}</strong>! Tu lugar ha sido reservado con éxito.`);
            cerrarModal();
            await renderizarAgenda();
        }

    } catch (err) {
        console.error("Error en inscripción:", err);
        showCustomAlert('error', `❌ No pudimos completar tu registro. ${err.message}`);
    } finally {
        if(btnSubmit) {
            btnSubmit.innerText = 'Confirmar mi Lugar';
            btnSubmit.disabled = false;
        }
    }
};

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

if (btnAbrirPerfil) {
    btnAbrirPerfil.onclick = () => {
        modalPerfil.classList.add('active');
        renderizarContenidoPerfil(); 
    };
}

if (btnCerrarPerfil) {
    btnCerrarPerfil.onclick = () => {
        modalPerfil.classList.remove('active');
    };
}

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
            <button class="btn-anotarse btn-perfil" id="btn-ejecutar-login">Ingresar</button>
        `;
        
        const btnLogin = document.getElementById('btn-ejecutar-login');
        if (btnLogin) btnLogin.addEventListener('click', window.validarUsuario);
        
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
        if (btnLogout) btnLogout.addEventListener('click', window.cerrarSesion);
        
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
    if(btn) { btn.innerText = 'Buscando...'; btn.disabled = true; }

    try {
        const { data: usuario, error } = await supabase
            .from('asistentes')
            .select('*')
            .eq('email', emailInput)
            .eq('telefono', telInput)
            .maybeSingle();

        if (error || !usuario) {
            showCustomAlert('error', '❌ No encontramos un registro con esos datos.');
            if(btn) { btn.innerText = 'Ingresar'; btn.disabled = false; }
            return;
        }

        localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
        showCustomAlert('success', `¡Qué bueno verte de nuevo, <strong>${usuario.nombre}</strong>!`);
        renderizarContenidoPerfil();

    } catch (err) {
        console.error("Error de conexión:", err);
        showCustomAlert('error', '⚠️ Hubo un problema de conexión con el servidor.');
    } finally {
        if(btn) { btn.innerText = 'Ingresar'; btn.disabled = false; }
    }
};

window.cerrarSesion = function() {
    localStorage.removeItem('usuarioActivo');
    renderizarContenidoPerfil(); 
    showCustomAlert('success', 'Has cerrado sesión correctamente.');
};

window.cargarTalleresUsuario = async function(usuario) {
    const listaContenedor = document.getElementById('lista-mis-talleres');
    listaContenedor.innerHTML = '<p style="color: var(--dark); font-weight: bold;">Buscando tus inscripciones...</p>';

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
        const { error } = await supabase.from('inscripciones').delete().eq('id', inscripcionId);
        if (error) throw error;
        showCustomAlert('success', '✅ Te has dado de baja exitosamente.');
        await renderizarAgenda();
        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
        cargarTalleresUsuario(usuarioActivo);
    } catch (err) {
        console.error("Error al dar de baja:", err);
        showCustomAlert('error', '❌ Tuvimos un problema de conexión al intentar liberar el cupo.');
    }
};

// ==========================================
// RENDERIZAR SPONSORS
// ==========================================
window.renderizarSponsors = function() {
    const sponsorsGrid = document.querySelector('.sponsors-grid');
    if (!sponsorsGrid) return;
    sponsorsGrid.innerHTML = '';
    
    congresoData.sponsors.principales.forEach(sponsor => {
        const card = document.createElement('a'); 
        card.className = 'sponsor-card';
        card.href = sponsor.url;
        card.target = "_blank";
        card.innerHTML = `
            <img src="${sponsor.logo}" alt="Logo de ${sponsor.nombre}">
            <h4 style="font-size:1.2rem; color: var(--dark); margin-top:10px;">${sponsor.nombre}</h4>
        `;
        sponsorsGrid.appendChild(card);
    });
};

window.iniciarHeroSlider = function() {
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
};

// ==========================================
// RENDERIZAR EXPOSITORES (GRILLA DE 5 ESTRELLAS Y MODAL)
// ==========================================
window.renderizarExpositores = function() {
    const container = document.getElementById('speakers-container');
    if (!container) return;
    
    // Mapeamos los expositores para asignarles dinámicamente su imagen (Ponente1.jpg, etc.)
    window.expositoresDinamicos = congresoData.expositores.map((exp, index) => {
        return {
            ...exp,
            foto: `Imagenes/Ponente${index + 1}.jpg`
        };
    });
    
    // Contenedor Flexbox configurado para intentar alinear los 5 en una fila en pantallas grandes
    let htmlCards = '<div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; max-width: 100%;">';
    
    window.expositoresDinamicos.forEach(exp => {
        htmlCards += `
            <div class="speaker-card" style="width: 200px; cursor: pointer; flex-shrink: 0; padding: 20px 15px;" onclick="abrirModalExpositor('${exp.id}')">
                <img src="${exp.foto}" alt="${exp.nombre}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin: 0 auto 15px auto; display: block;">
                <h3 style="font-size: 1.05rem; color: #046b33;">${exp.nombre}</h3>
                <p style="font-size: 0.85rem; color: #f6961a; font-weight: bold; margin:0;">${exp.titulo}</p>
            </div>
        `;
    });
    htmlCards += '</div>';

    container.innerHTML = htmlCards;
};

window.abrirModalExpositor = function(expId) {
    const expositor = window.expositoresDinamicos.find(e => e.id === expId);
    if (!expositor) return;

    if (modalExpositor) {
        modalExpositor.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="btn-cerrar" onclick="cerrarModalExpositor()">×</button>
                <img src="${expositor.foto}" alt="${expositor.nombre}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin: 0 auto 15px auto;">
                <h2 style="margin: 0; color: #046b33;">${expositor.nombre}</h2>
                <h4 style="color: #f6961a; margin-top: 5px;">${expositor.titulo}</h4>
                <p style="font-size: 1.05rem; line-height: 1.6;">${expositor.bio}</p>
                
                <hr style="border: 1px dashed #ccc; margin: 25px 0;">
                
                <h3 style="text-align: left; color: #046b33; font-size: 1.2rem;">Ponencia que dicta:</h3>
                <p style="color: #999; font-style: italic; text-align: left; margin-top: 5px;">De momento esta información no está disponible.</p>
            </div>
        `;
        modalExpositor.classList.add('active');
    }
};

window.cerrarModalExpositor = function() {
    if (modalExpositor) modalExpositor.classList.remove('active');
};

// ==========================================
// CONTADOR EN CUENTA REGRESIVA
// ==========================================
window.iniciarContador = function() {
    const fechaInicio = new Date('August 15, 2026 14:00:00').getTime();

    const actualizarReloj = setInterval(function() {
        const ahora = new Date().getTime();
        const distancia = fechaInicio - ahora;

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        const elDias = document.getElementById('cd-dias');
        if (!elDias) { clearInterval(actualizarReloj); return; }
        
        elDias.innerText = dias < 10 ? '0' + dias : dias;
        document.getElementById('cd-horas').innerText = horas < 10 ? '0' + horas : horas;
        document.getElementById('cd-mins').innerText = minutos < 10 ? '0' + minutos : minutos;
        document.getElementById('cd-segs').innerText = segundos < 10 ? '0' + segundos : segundos;

        if (distancia < 0) {
            clearInterval(actualizarReloj);
            document.getElementById('contador-ludico').innerHTML = '<h3 style="color: var(--secondary); background: var(--white); padding: 10px 20px; border-radius: 8px; border: 3px dashed var(--primary); display: inline-block;">¡El congreso ha comenzado!</h3>';
        }
    }, 1000);
};

// ==========================================
// LÓGICA DE QUIÉNES SOMOS INTERACTIVO
// ==========================================
window.cambiarOrg = function(orgId, element) {
    const logos = document.querySelectorAll('.org-logo');
    logos.forEach(logo => logo.classList.remove('active'));
    element.classList.add('active');

    const orgData = {
        'homo-ludens': {
            titulo: 'Homo Ludens',
            color: '#046b33', 
            texto: 'Este gran evento está organizado por <strong>Homo Ludens</strong> quien lleva mas de 10 años trabajando en difundir la cultura lúdica en el país. El evento ya fue declarado de interés municipal y legislativo por su impacto en la innovación educativa.'
        },
        'hl-educacion': {
            titulo: 'Homo Ludens Educación',
            color: '#f6961a', 
            texto: 'Nuestra rama educativa se enfoca en llevar el poder de los juegos de mesa directamente a las aulas y a los profesionales de la enseñanza.'
        }
    };

    const contentBox = document.getElementById('org-content-box');
    const data = orgData[orgId];
    
    contentBox.innerHTML = `
        <h3 style="color: ${data.color}; font-size: 1.8rem; margin-top: 0;">${data.titulo}</h3>
        <p style="font-size: 1.1rem; line-height: 1.8; color: var(--dark);">${data.texto}</p>
    `;
};

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('keydown', function(event) {
    const isAlertVisible = customAlertOverlay && !customAlertOverlay.classList.contains('hidden');
    const isTallerModalVisible = modalContenedor && modalContenedor.classList.contains('active');
    const isExpositorModalVisible = modalExpositor && modalExpositor.classList.contains('active');

    if (event.key === 'Escape') {
        if (isAlertVisible) window.closeCustomAlert();
        else if (isTallerModalVisible) window.cerrarModal();
        else if (isExpositorModalVisible) window.cerrarModalExpositor();
    }
    if (event.key === 'Enter' && isAlertVisible) {
        event.preventDefault();
        window.closeCustomAlert();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if(typeof window.iniciarTabsAgenda === 'function') window.iniciarTabsAgenda();
    if(typeof window.renderizarAgenda === 'function') window.renderizarAgenda();
    if(typeof window.renderizarSponsors === 'function') window.renderizarSponsors();
    if(typeof window.renderizarExpositores === 'function') window.renderizarExpositores();
    if(typeof window.iniciarHeroSlider === 'function') window.iniciarHeroSlider();
    if(typeof window.iniciarContador === 'function') window.iniciarContador(); 
});