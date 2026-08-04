import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { congresoData } from './data.js';

// ==========================================
// CONTROL AUTOMÁTICO DE INSCRIPCIONES
// ==========================================
// Fecha de apertura: 4 de Agosto de 2026 a las 14:00 hrs.
const FECHA_APERTURA_INSCRIPCIONES = new Date(2026, 7, 4, 14, 0, 0).getTime();
let INSCRIPCIONES_ABIERTAS = false;

function verificarAperturaInscripciones() {
    const ahora = new Date().getTime();
    INSCRIPCIONES_ABIERTAS = ahora >= FECHA_APERTURA_INSCRIPCIONES;
}

verificarAperturaInscripciones();

// ==========================================
// SISTEMA DE COLORES PARA AULAS
// ==========================================
window.obtenerColorAula = function(aula) {
    if (!aula) return '#94a3b8'; // Gris por defecto si no hay aula
    const txt = aula.toLowerCase();
    
    if (txt.includes('amarilla') || txt.includes('ambar')) return '#d9c406'; 
    if (txt.includes('azul')) return '#2563EB'; 
    if (txt.includes('roja') || txt.includes('rojo')) return '#DC2626'; 
    if (txt.includes('naranja')) return '#EA580C'; 
    if (txt.includes('verde')) return '#16A34A'; 
    if (txt.includes('rosa') || txt.includes('rosado') || txt.includes('rosada')) return '#DB2777'; 
    if (txt.includes('violeta')) return '#7C3AED'; 
    
    return '#046b33'; // Verde institucional por defecto
};

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
const modalCreadora = document.getElementById('modal-creadora');
const modalEditorial = document.getElementById('modal-editorial');
const modalActividad = document.getElementById('modal-actividad');
const modalSponsor = document.getElementById('modal-sponsor');

// ==========================================
// CARD NAV LOGIC
// ==========================================
const menuToggleBtn = document.getElementById('menu-toggle');
const cardNavMenu = document.getElementById('card-nav-menu');
const cardLinks = document.querySelectorAll('.card-link');

if (menuToggleBtn && cardNavMenu) {
    menuToggleBtn.addEventListener('click', () => {
        const isClosed = cardNavMenu.classList.contains('hidden');
        if (isClosed) {
            cardNavMenu.classList.remove('hidden');
            menuToggleBtn.classList.add('open');
        } else {
            cardNavMenu.classList.add('hidden');
            menuToggleBtn.classList.remove('open');
        }
    });

    cardLinks.forEach(link => {
        link.addEventListener('click', () => {
            cardNavMenu.classList.add('hidden');
            menuToggleBtn.classList.remove('open');
        });
    });
}

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
// MODALES: CREADORAS, EDITORIALES Y ACTIVIDADES
// ==========================================
window.abrirModalCreadora = function(creaId) {
    const creadora = congresoData.creadoras.find(c => c.id === creaId);
    if (!creadora) return;

    if (modalCreadora) {
        modalCreadora.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="btn-cerrar" onclick="cerrarModalCreadora()">×</button>
                <div style="width: 120px; height: 120px; border-radius: 50%; background-color: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; margin: 0 auto 15px auto; overflow: hidden; border: 3px solid var(--primary);">
                    <img src="${creadora.foto}" alt="${creadora.nombre}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" style="width: 100%; height: 100%; object-fit: cover;">
                    <span style="display: none;">${creadora.nombre.charAt(0)}</span>
                </div>
                <h2 style="margin: 0; color: #046b33;">${creadora.nombre}</h2>
                <h4 style="color: #f6961a; margin-top: 5px;">${creadora.rol}</h4>
                <hr style="border: 1px dashed #ccc; margin: 15px 0;">
                <p style="font-size: 1.05rem; line-height: 1.6; text-align: left;">${creadora.bio}</p>
            </div>
        `;
        modalCreadora.classList.add('active');
    }
};

window.cerrarModalCreadora = function() {
    if (modalCreadora) modalCreadora.classList.remove('active');
};

window.abrirModalEditorial = function(editorialId) {
    const editorial = congresoData.editoriales.find(e => e.id === editorialId);
    if (!editorial) return;

    let socialLinks = '';
    if (editorial.instagram) {
        socialLinks += `<a href="${editorial.instagram}" target="_blank" class="cta-button" style="margin-right: 10px; background-color: #E1306C;"><svg style="width:16px; height:16px; vertical-align:middle; margin-right:5px; fill:currentColor;" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>Instagram</a>`;
    }
    if (editorial.web) {
        socialLinks += `<a href="${editorial.web}" target="_blank" class="cta-button" style="background-color: var(--secondary);">🌐 Sitio Web</a>`;
    }

    if (modalEditorial) {
        modalEditorial.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="btn-cerrar" onclick="cerrarModalEditorial()">×</button>
                <img src="${editorial.logo}" alt="${editorial.nombre}" style="max-width: 150px; height: auto; margin: 0 auto 15px auto; border-radius: 8px;">
                <h2 style="margin: 0; color: #046b33;">${editorial.nombre}</h2>
                <hr style="border: 1px dashed #ccc; margin: 15px 0;">
                <h4 style="color: #f6961a; text-align: left; margin-bottom: 5px;">📍 ¿Dónde encontrarnos en el evento?</h4>
                <p style="font-size: 1.05rem; line-height: 1.6; text-align: left; background: #F8F9FA; padding: 10px; border-radius: 8px; border-left: 4px solid var(--primary);">${editorial.dondeEncontrar}</p>
                <div style="margin-top: 25px; display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
                    ${socialLinks}
                </div>
            </div>
        `;
        modalEditorial.classList.add('active');
    }
};

window.cerrarModalEditorial = function() {
    if (modalEditorial) modalEditorial.classList.remove('active');
};

window.abrirModalActividad = function(actId) {
    const actividad = congresoData.actividadesExtra.find(a => a.id === actId);
    if (!actividad) return;

    if (modalActividad) {
        modalActividad.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="btn-cerrar" onclick="cerrarModalActividad()">×</button>
                <div style="height: 150px; background-color: #FFFFFF; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid var(--secondary);">
                    <img src="${actividad.imagen}" alt="${actividad.nombre}" onerror="this.style.display='none';" style="width: 100%; height: 100%; object-fit: contain; padding: 10px;">
                </div>
                <h2 style="margin: 0; color: #046b33;">${actividad.nombre}</h2>
                <hr style="border: 1px dashed #ccc; margin: 15px 0;">
                <p style="font-size: 1.05rem; line-height: 1.6; text-align: left;">${actividad.descripcion}</p>
            </div>
        `;
        modalActividad.classList.add('active');
    }
};

window.cerrarModalActividad = function() {
    if (modalActividad) modalActividad.classList.remove('active');
};

// ==========================================
// RENDERIZAR AGENDA GENERAL (TABS)
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

    let theadHTML = `<thead><tr>`;
    diasKeys.forEach(diaKey => {
        theadHTML += `<th>${congresoData.cronograma[diaKey].fecha}</th>`;
    });
    theadHTML += `</tr></thead>`;
    tabla.innerHTML = theadHTML;

    const tbody = document.createElement('tbody');
    
    // Objeto para mapear los horarios de inicio globales por turno y día
    const horariosInicioGlobal = {
        dia1: { manana: '14:00 hs', tarde: '15:45 hs' },
        dia2: { manana: '14:00 hs', tarde: '15:45 hs' },
        dia3: { manana: '10:30 hs' } 
    };

    turnos.forEach(turno => {
        let hayTalleresEnTurno = false;
        diasKeys.forEach(diaKey => {
            if (congresoData.cronograma[diaKey] && congresoData.cronograma[diaKey].modulos && congresoData.cronograma[diaKey].modulos[turno] && congresoData.cronograma[diaKey].modulos[turno].length > 0) {
                hayTalleresEnTurno = true;
            }
        });

        if (!hayTalleresEnTurno) return; 

        // 1. FILA SEPARADORA DE HORARIOS
        const trHorario = document.createElement('tr');
        trHorario.className = 'fila-separadora-horario';

        diasKeys.forEach(diaKey => {
            const tdHorario = document.createElement('td');
            
            tdHorario.style.backgroundColor = '#E2E8F0'; 
            tdHorario.style.textAlign = 'center';
            tdHorario.style.padding = '15px 10px';
            tdHorario.style.borderTop = '3px solid #cbd5e1';
            tdHorario.style.borderBottom = '3px solid #cbd5e1';
            
            if (horariosInicioGlobal[diaKey] && horariosInicioGlobal[diaKey][turno]) {
                tdHorario.innerHTML = `<span style="background-color: var(--white); color: #046b33; font-weight: 900; font-size: 0.95rem; padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: inline-block; border: 1px solid #cbd5e1;">🕗 Inicio: ${horariosInicioGlobal[diaKey][turno]}</span>`;
            } else {
                tdHorario.innerHTML = ``; 
            }
            
            trHorario.appendChild(tdHorario);
        });
        tbody.appendChild(trHorario);

        // 2. FILA DE TALLERES
        const trTalleres = document.createElement('tr');
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
                    
                    const colorAula = window.obtenerColorAula(taller.aula);
                    card.style.borderLeftColor = colorAula;
                    
                    let etiquetaHorarioEspecifico = '';
                    if (horariosInicioGlobal[diaKey] && horariosInicioGlobal[diaKey][turno]) {
                        etiquetaHorarioEspecifico = `<span style="background-color: var(--dark); color: var(--white); font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-left: 5px;">⏰ ${horariosInicioGlobal[diaKey][turno]}</span>`;
                    }
                    
                    card.innerHTML = `
                        <h4>${taller.titulo}</h4>
                        <div style="margin-bottom: 5px;">
                            <p style="color: ${colorAula}; font-weight: bold; margin: 0; font-size: 0.85rem; border: 1px solid ${colorAula}; display: inline-block; padding: 2px 8px; border-radius: 12px; background-color: ${colorAula}1A;">
                                📍 ${taller.aula ? taller.aula : 'Aula a confirmar'}
                            </p>
                            ${etiquetaHorarioEspecifico}
                        </div>
                        <p style="margin-top: 5px;"><strong>Ponente:</strong> ${taller.ponente}</p>
                        <p>Cupos: <span class="${claseCupos}">${cuposReales} / ${taller.cupoMaximo}</span></p>
                    `;
                    card.onclick = () => abrirDetalleTaller(taller, turno, diaKey, cuposReales);
                    td.appendChild(card);
                });
            } else {
                td.innerHTML = '<span style="color: #999; font-style: italic; font-size: 0.9rem;">Sin programación</span>';
            }
            trTalleres.appendChild(td);
        });
        tbody.appendChild(trTalleres);
    });
    tabla.appendChild(tbody);
    wrapper.appendChild(tabla);
    agendaContainer.appendChild(wrapper);
};

window.abrirDetalleTaller = function(taller, moduloKey, diaKey, cuposReales) {
    const diaTexto = congresoData.cronograma[diaKey].fecha;
    const horaTexto = moduloKey === 'manana' ? '14:00 hrs' : '15:45 hrs'; 
    
    let bloqueInscripcion = '';
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

    if (INSCRIPCIONES_ABIERTAS) {
        if (usuarioActivo) {
            bloqueInscripcion = `
                <div class="form-inscripcion" style="text-align: center; padding: 20px;">
                    <h3 style="color: #046b33; margin-top: 0; font-size: 1.3rem;">¡Hola, ${usuarioActivo.nombre}!</h3>
                    <p style="color: #555; margin-bottom: 15px; font-weight: bold;">Estás habilitado para reservar tu lugar en este taller.</p>
                    
                    <button id="btn-inscripcion-directa" class="btn-anotarse" style="${cuposReales <= 0 ? 'background:#ccc; cursor:not-allowed;' : ''}" ${cuposReales <= 0 ? 'disabled' : ''}>
                        ${cuposReales <= 0 ? 'Cupos Agotados' : 'Confirmar mi lugar'}
                    </button>
                </div>
            `;
        } else {
            bloqueInscripcion = `
                <div class="form-inscripcion" style="text-align: center; padding: 20px;">
                    <h3 style="color: #046b33; margin-top: 0; font-size: 1.2rem;">¡Reserva tu lugar!</h3>
                    
                    <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 15px;">
                        <p style="color: #555; margin-top: 0; margin-bottom: 10px; font-weight: bold; font-size: 0.95rem;">¿Ya tienes cuenta?</p>
                        <input type="email" id="taller-login-email" placeholder="Correo Electrónico" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        <input type="password" id="taller-login-dni" placeholder="Contraseña (DNI)" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">
                        <button id="btn-login-y-reservar" class="btn-anotarse" style="margin-top: 0; padding: 8px; font-size: 1rem; ${cuposReales <= 0 ? 'background:#ccc; cursor:not-allowed;' : ''}" ${cuposReales <= 0 ? 'disabled' : ''}>
                            ${cuposReales <= 0 ? 'Cupos Agotados' : 'Ingresar y Reservar'}
                        </button>
                    </div>
                    
                    <hr style="border: 0.5px dashed #ccc; margin: 15px 0;">
                    
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">¿Aún no estás registrado en el congreso?</p>
                    <a href="https://forms.gle/mn71uqKEjV9UcAS39" target="_blank" class="btn-anotarse" style="display: block; text-decoration: none; background: var(--secondary); padding: 8px; font-size: 1rem; ${cuposReales <= 0 ? 'background:#ccc; cursor:not-allowed; pointer-events: none;' : ''}">
                        Ir al Formulario de Registro
                    </a>
                </div>
            `;
        }
    } else {
        bloqueInscripcion = `
            <div class="form-inscripcion" style="text-align: center; padding: 20px;">
                <h3 style="color: #f6961a; margin-top: 0; font-size: 1.3rem;">Inscripciones en Pausa</h3>
                <p style="color: #555; margin-bottom: 0; font-weight: bold;">Las reservas se abrirán nuevamente hoy a partir de las 14:00 hs.</p>
            </div>
        `;
    }

    const colorAula = window.obtenerColorAula(taller.aula);

    modalContenedor.innerHTML = `
        <div class="modal-content">
            <button class="btn-cerrar" onclick="cerrarModal()">×</button>
            <span style="color: var(--secondary); font-weight:bold; text-transform:uppercase; font-size:0.8rem;">
                ${diaTexto} - ${horaTexto}
            </span>
            <h2 style="margin-top:5px; color: var(--dark);">${taller.titulo}</h2>
            <p style="font-size: 1.1rem; color: ${colorAula}; font-weight: bold; margin-top: 0; border: 2px solid ${colorAula}; display: inline-block; padding: 4px 10px; border-radius: 8px; background-color: ${colorAula}1A;">
                📍 Lugar: ${taller.aula ? taller.aula : 'Aula a confirmar'}
            </p>
            <p><strong>Impartido por:</strong> ${taller.ponente}</p>
            <p style="background: #F4F4F9; padding: 10px; border-left: 4px solid var(--secondary); font-style: italic;">
                ${taller.resumen}
            </p>
            <p><strong>Cupos disponibles:</strong> <span id="modal-cupos">${cuposReales}</span> / ${taller.cupoMaximo}</p>
            
            ${bloqueInscripcion}
        </div>
    `;
    modalContenedor.classList.add('active');

    if (INSCRIPCIONES_ABIERTAS && cuposReales > 0) {
        if (usuarioActivo) {
            const btnDirecto = document.getElementById('btn-inscripcion-directa');
            if (btnDirecto) {
                btnDirecto.addEventListener('click', () => {
                    window.procesarInscripcionDirecta(taller, moduloKey, diaKey);
                });
            }
        } else {
            const btnLoginReservar = document.getElementById('btn-login-y-reservar');
            if (btnLoginReservar) {
                btnLoginReservar.addEventListener('click', async () => {
                    const emailInput = document.getElementById('taller-login-email').value.trim().toLowerCase();
                    const dniInput = document.getElementById('taller-login-dni').value.trim();
                    if (!emailInput || !dniInput) {
                        window.showCustomAlert('error', '⚠️ Por favor, ingresa tu correo y contraseña (DNI).');
                        return;
                    }
                    
                    btnLoginReservar.innerText = 'Validando...';
                    btnLoginReservar.disabled = true;
                    
                    try {
                        const { data: usuario, error } = await supabase
                            .from('asistentes')
                            .select('*')
                            .eq('email', emailInput)
                            .eq('dni', dniInput)
                            .maybeSingle();

                        if (error || !usuario) {
                            window.showCustomAlert('error', '❌ Credenciales incorrectas. Verifica tu correo y DNI.');
                            btnLoginReservar.innerText = 'Ingresar y Reservar';
                            btnLoginReservar.disabled = false;
                            return;
                        }

                        // Login exitoso
                        localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
                        
                        // Reservar taller inmediatamente
                        await window.procesarInscripcionDirecta(taller, moduloKey, diaKey);
                        
                    } catch (err) {
                        console.error("Error de conexión:", err);
                        window.showCustomAlert('error', '⚠️ Hubo un problema de conexión con el servidor.');
                        btnLoginReservar.innerText = 'Ingresar y Reservar';
                        btnLoginReservar.disabled = false;
                    }
                });
            }
        }
    }
};

window.cerrarModal = function() {
    modalContenedor.classList.remove('active');
};

// ==========================================
// SISTEMA DE INSCRIPCIÓN DIRECTA
// ==========================================
window.procesarInscripcionDirecta = async function(taller, moduloKey, diaKey) {
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!usuarioActivo) return;

    const btnSubmit = document.getElementById('btn-inscripcion-directa');
    if (btnSubmit) {
        btnSubmit.innerText = 'Procesando...';
        btnSubmit.disabled = true;
    }

    try {
        const { error: errorInscripcion } = await supabase
            .from('inscripciones')
            .insert([{
                asistente_id: usuarioActivo.id,
                taller_id: taller.id,
                dia_key: diaKey,
                modulo_key: moduloKey
            }]);

        if (errorInscripcion) {
            if (errorInscripcion.code === '23505') {
                window.showCustomAlert('error', `⚠️ Ya estás inscrito a otro taller en este mismo turno.`);
            } else {
                throw errorInscripcion;
            }
        } else {
            window.showCustomAlert('success', `¡Excelente, <strong>${usuarioActivo.nombre}</strong>! Tu lugar ha sido reservado con éxito.`);
            window.cerrarModal();
            await window.renderizarAgenda();
            
            // Si el modal de perfil está abierto, lo recargamos
            const modalPerfilActivo = document.getElementById('modal-perfil');
            if (modalPerfilActivo && modalPerfilActivo.classList.contains('active')) {
                 window.cargarTalleresUsuario(usuarioActivo);
            }
        }

    } catch (err) {
        console.error("Error en inscripción:", err);
        window.showCustomAlert('error', `❌ No pudimos completar tu registro. Por favor, intenta nuevamente.`);
    } finally {
        if(btnSubmit) {
            btnSubmit.innerText = 'Reservar mi lugar';
            btnSubmit.disabled = false;
        }
    }
};

// ==========================================
// VENTANA DE CONFIRMACIÓN CUSTOM
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

window.darseDeBaja = async function(inscripcionId, tituloTaller) {
    const confirmado = await window.mostrarConfirmacion(`¿Estás completamente seguro de que deseas liberar tu cupo para <strong>"${tituloTaller}"</strong>?<br>Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    try {
        const { error } = await supabase.from('inscripciones').delete().eq('id', inscripcionId);
        if (error) throw error;
        window.showCustomAlert('success', '✅ Te has dado de baja exitosamente.');
        await window.renderizarAgenda();
        const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
        window.cargarTalleresUsuario(usuarioActivo);
    } catch (err) {
        console.error("Error al dar de baja:", err);
        window.showCustomAlert('error', '❌ Tuvimos un problema de conexión al intentar liberar el cupo.');
    }
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
            <p>Ingresa tus credenciales para ver tu agenda:</p>
            <div class="campo-grupo">
                <label>Correo Electrónico</label>
                <!-- Bloqueamos el autocompletado del navegador -->
                <input type="email" id="login-email" placeholder="tu@email.com" autocomplete="off" name="email-no-autofill">
            </div>
            <div class="campo-grupo">
                <label>Contraseña (Tu DNI)</label>
                <!-- Forzamos al navegador a no sugerir contraseñas guardadas -->
                <input type="password" id="login-dni" placeholder="Ej: 12345678" autocomplete="new-password" name="pwd-no-autofill">
            </div>
            <button class="btn-anotarse btn-perfil" id="btn-ejecutar-login">Ingresar</button>
            <p style="font-size: 0.8rem; color: #666; margin-top: 15px; text-align: center;">* El acceso está habilitado únicamente para los asistentes registrados oficialmente.</p>
        `;
        
        const btnLogin = document.getElementById('btn-ejecutar-login');
        if (btnLogin) btnLogin.addEventListener('click', window.validarUsuario);
        
    } else {
        perfilContenido.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <h3 style="margin: 0;">Hola, ${usuarioActivo.nombre}</h3>
            </div>
            <p style="font-size: 0.85rem; color: #666; margin-top: 0; margin-bottom: 20px;">
                📧 ${usuarioActivo.email} | 🆔 DNI: ${usuarioActivo.dni}
            </p>
            <hr style="border: 0.5px solid #E2E8F0; margin-bottom: 15px;">
            <div id="lista-mis-talleres">Cargando tus talleres...</div>
            <button id="btn-ejecutar-logout" class="btn-anotarse" style="margin-top:20px; background-color: var(--dark);">Cerrar sesión</button>
        `;
        
        const btnLogout = document.getElementById('btn-ejecutar-logout');
        if (btnLogout) btnLogout.addEventListener('click', window.cerrarSesion);
        
        window.cargarTalleresUsuario(usuarioActivo);
    }
}

window.validarUsuario = async function() {
    // Quitamos el toLowerCase() para que Supabase maneje el filtro inteligentemente
    const emailInput = document.getElementById('login-email').value.trim();
    const dniInput = document.getElementById('login-dni').value.trim();

    if (!emailInput || !dniInput) {
        window.showCustomAlert('error', '⚠️ Por favor, completa tu correo y contraseña (DNI) para ingresar.');
        return;
    }

    const btn = document.getElementById('btn-ejecutar-login');
    if(btn) { btn.innerText = 'Buscando...'; btn.disabled = true; }

    try {
        const { data: usuario, error } = await supabase
            .from('asistentes')
            .select('*')
            .ilike('email', emailInput) // Búsqueda flexible (ignora mayúsculas/minúsculas)
            .ilike('dni', dniInput)     // Búsqueda flexible para DNIs con letras (ej. D177538)
            .maybeSingle();

        if (error || !usuario) {
            window.showCustomAlert('error', '❌ Credenciales incorrectas o usuario no registrado. Verifica tu correo y DNI.');
            if(btn) { btn.innerText = 'Ingresar'; btn.disabled = false; }
            return;
        }

        localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
        window.showCustomAlert('success', `¡Qué bueno verte, <strong>${usuario.nombre}</strong>!`);
        renderizarContenidoPerfil();

    } catch (err) {
        console.error("Error de conexión:", err);
        window.showCustomAlert('error', '⚠️ Hubo un problema de conexión con el servidor.');
    } finally {
        if(btn) { btn.innerText = 'Ingresar'; btn.disabled = false; }
    }
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

// ==========================================
// RENDERIZAR SPONSORS (CON EXCEPCIÓN PARA BIBLIOTECA)
// ==========================================
window.renderizarSponsors = function() {
    const sponsorsGrid = document.querySelector('.sponsors-grid');
    if (!sponsorsGrid) return;
    sponsorsGrid.innerHTML = '';
    
    congresoData.sponsors.principales.forEach(sponsor => {
        if (sponsor.id === "sp-biblio") {
            const card = document.createElement('div'); 
            card.className = 'sponsor-card';
            card.style.cursor = 'pointer'; 
            card.onclick = () => window.abrirModalSponsor(JSON.stringify(sponsor));
            
            card.innerHTML = `
                <img src="${sponsor.logo}" alt="Logo de ${sponsor.nombre}">
                <h4 style="font-size:1.2rem; color: var(--dark); margin-top:10px;">${sponsor.nombre}</h4>
            `;
            sponsorsGrid.appendChild(card);
        } else {
            const card = document.createElement('a'); 
            card.className = 'sponsor-card';
            card.href = sponsor.url;
            card.target = "_blank";
            
            card.innerHTML = `
                <img src="${sponsor.logo}" alt="Logo de ${sponsor.nombre}">
                <h4 style="font-size:1.2rem; color: var(--dark); margin-top:10px;">${sponsor.nombre}</h4>
            `;
            sponsorsGrid.appendChild(card);
        }
    });
};

window.abrirModalSponsor = function(sponsorDataStr) {
    const sponsor = JSON.parse(sponsorDataStr);
    const modalSponsor = document.getElementById('modal-sponsor');
    
    if (modalSponsor) {
        modalSponsor.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="btn-cerrar" onclick="cerrarModalSponsor()">×</button>
                <img src="${sponsor.logo}" alt="${sponsor.nombre}" style="max-width: 200px; height: 110px; object-fit: contain; margin: 0 auto 15px auto;">
                <h2 style="margin: 0; color: #046b33;">${sponsor.nombre}</h2>
                <hr style="border: 1px dashed #ccc; margin: 15px 0;">
                <p style="font-size: 1.05rem; line-height: 1.6; text-align: left;">${sponsor.descripcion}</p>
                <div style="margin-top: 25px;">
                    <a href="${sponsor.url}" target="_blank" class="cta-button" style="background-color: var(--secondary); width: 100%; display: block; text-decoration: none;">🌐 Visitar Sitio Web</a>
                </div>
            </div>
        `;
        modalSponsor.classList.add('active');
    }
};

window.cerrarModalSponsor = function() {
    const modalSponsor = document.getElementById('modal-sponsor');
    if (modalSponsor) modalSponsor.classList.remove('active');
};

window.iniciarHeroSlider = function() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const imagenesFondo = [
        'Imagenes/image.png',
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
    
    window.expositoresDinamicos = congresoData.expositores.map((exp, index) => {
        return {
            ...exp,
            foto: `Imagenes/Ponente${index + 1}.jpg`
        };
    });
    
    let htmlCards = '<div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; max-width: 100%;">';
    
    window.expositoresDinamicos.forEach(exp => {
        htmlCards += `
            <div class="speaker-card" style="width: 200px; cursor: pointer; flex-shrink: 0; padding: 20px 15px;" onclick="abrirModalExpositor('${exp.id}')">
                <img src="${exp.foto}" alt="${exp.nombre.replace(/<[^>]*>?/gm, '')}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin: 0 auto 15px auto; display: block;">
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
                <img src="${expositor.foto}" alt="Expositor" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin: 0 auto 15px auto;">
                <h2 style="margin: 0; color: #046b33;">${expositor.nombre}</h2>
                <h4 style="color: #f6961a; margin-top: 5px;">${expositor.titulo}</h4>
                <p style="font-size: 1.05rem; line-height: 1.6;">${expositor.bio}</p>
                
                <hr style="border: 1px dashed #ccc; margin: 25px 0;">
                
                <h3 style="text-align: left; color: #046b33; font-size: 1.2rem;">Ponencia que dicta:</h3>
                <p style="color: #555; text-align: left; margin-top: 5px; font-weight: bold;">${expositor.ponencia ? expositor.ponencia : 'De momento esta información no está disponible.'}</p>
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
    const fechaInicio = new Date('2026-08-15T14:00:00').getTime();

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
            texto: 'Casa Homo Ludens es un espacio pionero en Argentina dedicado al universo del juego y las experiencias inmersivas. Con diez años de trayectoria en la ciudad Bahía Blanca, nació como una casa abierta a la comunidad para disfrutar de juegos de mesa y no tardó en expandirse, transformándose en el referente local de las salas de escape y el diseño de experiencias lúdicas. A lo largo de esta década, Homo Ludens ha sabido reinventarse y abrirse paso en distintas áreas, consolidándose como un ícono de la cultura del juego y el entretenimiento en todo el país. Además la empresa se ha expandido con distintas sucursales, franquicias y asesorías tanto en Argentina como Brasil.'
        },
        'hl-educacion': {
            titulo: 'Homo Ludens Educación',
            color: '#f6961a', 
            texto: '<p>Homo ludens Educación es un programa pedagógico surgido en Homo ludens, en Bahía Blanca, que promueve el Aprendizaje Basado en Juegos (ABJ) para transformar la experiencia educativa en todos los niveles educativos. A través del juego de mesa y diversas dinámicas de ingenio, la iniciativa busca integrar los contenidos educativos con la diversión, ofreciendo talleres educativos que muestran como mediante el juego de mesa se pueden reforzar áreas clave como la matemática, la comprensión lectora, la lógica y el pensamiento crítico. Además, mediante su proyecto "De la mesa al aula", llevan tableros, juegos de mesa y estrategias de trabajo en equipo directamente a escuelas y jardines, convirtiendo el aula en un espacio colaborativo donde aprender se vuelve una experiencia motivadora y significativa. Tambien desde el año pasado se implementa el Programa "Biblios ludicas" en bibliotecas publicas de todo el pais. Ambos programas se realizan gracias al acompañamiento de Cultura de la Cooperativa Obrera. Además Homo ludens educación cuenta con un club docente con el objetivo de dar a conocer los juegos y sus aplicaciones aulicas'
        }
    };

    const contentBox = document.getElementById('org-content-box');
    const data = orgData[orgId];
    
    contentBox.innerHTML = `
        <h3 id="titulo-animado" style="color: ${data.color}; font-size: 1.8rem; margin-top: 0; display: inline-block;"></h3>
        <p id="texto-animado" style="font-size: 1.1rem; line-height: 1.8; color: var(--dark); margin-top: 15px; min-height: 80px;"></p>
    `;

    const tituloEl = document.getElementById('titulo-animado');
    const caracteres = data.titulo.split(''); 
    
    caracteres.forEach((char, index) => {
        const span = document.createElement('span');
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        span.className = 'char-anim';
        span.style.animationDelay = `${index * 0.08}s`; 
        tituloEl.appendChild(span);
    });

    let indexTexto = 0;
    
    if (window.typingOrgInterval) clearInterval(window.typingOrgInterval);
    if (window.typingOrgTimeout) clearTimeout(window.typingOrgTimeout);

    const delayTitulo = (caracteres.length * 80) + 200;

    window.typingOrgTimeout = setTimeout(() => {
        window.typingOrgInterval = setInterval(() => {
            const textoEl = document.getElementById('texto-animado');
            if (!textoEl) {
                clearInterval(window.typingOrgInterval);
                return;
            }

            if (indexTexto < data.texto.length) {
                textoEl.innerHTML = data.texto.substring(0, indexTexto + 1) + '<span class="typing-cursor"></span>';
                indexTexto++;
            } else {
                textoEl.innerHTML = data.texto; 
                clearInterval(window.typingOrgInterval);
            }
        }, 15); 
    }, delayTitulo);
};

// ==========================================
// ANIMACIONES DE SCROLL 
// ==========================================
window.iniciarAnimacionesScroll = function() {
    const blurElements = document.querySelectorAll('.blur-animated');
    
    const observerBlur = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('blur-hidden');
            } else {
                entry.target.classList.add('blur-hidden');
            }
        });
    }, { threshold: 0.15 });

    blurElements.forEach(el => observerBlur.observe(el));

    const seccionNosotros = document.getElementById('quienes-somos');
    const orgContentBox = document.getElementById('org-content-box');
    
    if (seccionNosotros) {
        const observerNosotros = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const orgActiva = document.querySelector('.org-logo.active');
                    if(orgActiva && orgContentBox.innerHTML.trim() === '') {
                        const idOrg = orgActiva.alt === 'Homo Ludens Educación' ? 'hl-educacion' : 'homo-ludens';
                        window.cambiarOrg(idOrg, orgActiva);
                    }
                } else {
                    if(orgContentBox) orgContentBox.innerHTML = '';
                    if (window.typingOrgInterval) clearInterval(window.typingOrgInterval);
                    if (window.typingOrgTimeout) clearTimeout(window.typingOrgTimeout);
                }
            });
        }, { threshold: 0.4 });
        observerNosotros.observe(seccionNosotros);
    }
};

window.iniciarSliderInstituciones = function() {
    const track = document.getElementById('instituciones-track');
    if (!track) return;

    let html = '';
    congresoData.instituciones.forEach(inst => {
        html += `
            <a href="${inst.url}" target="_blank" class="institucion-slide">
                <img src="${inst.logo}" alt="${inst.nombre}">
                <h4 style="margin:0; font-size:1rem; color:#046b33;">${inst.nombre}</h4>
                <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #666; font-weight: 500;">
                    📍 ${inst.ubicacion}
                </p>
            </a>
        `;
    });
    track.innerHTML = html;

    let indiceActual = 0;
    let intervaloSlider;
    
    function moverSlider(direccion) {
        const itemsVisibles = window.innerWidth > 900 ? 4 : (window.innerWidth > 600 ? 2 : 1);
        const maxIndice = congresoData.instituciones.length - itemsVisibles;

        if (direccion === 'next') {
            indiceActual = indiceActual >= maxIndice ? 0 : indiceActual + 1;
        } else {
            indiceActual = indiceActual <= 0 ? maxIndice : indiceActual - 1;
        }

        const slideWidth = track.children[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${indiceActual * (slideWidth + 20)}px)`;
    }

    document.getElementById('btn-next-inst').addEventListener('click', () => {
        moverSlider('next');
        reiniciarIntervalo();
    });
    document.getElementById('btn-prev-inst').addEventListener('click', () => {
        moverSlider('prev');
        reiniciarIntervalo();
    });

    function iniciarIntervalo() {
        intervaloSlider = setInterval(() => moverSlider('next'), 10000);
    }
    function reiniciarIntervalo() {
        clearInterval(intervaloSlider);
        iniciarIntervalo();
    }

    iniciarIntervalo();
};

// ==========================================
// RENDERIZAR EDITORIALES (NUEVO SLIDER)
// ==========================================
window.iniciarSliderEditoriales = function() {
    const track = document.getElementById('editoriales-track');
    if (!track) return;

    let html = '';
    congresoData.editoriales.forEach(ed => {
        html += `
            <div class="institucion-slide editorial-card" onclick="abrirModalEditorial('${ed.id}')" style="cursor: pointer;">
                <img src="${ed.logo}" alt="${ed.nombre}" style="width: 100%; height: 100px; object-fit: contain; margin-bottom: 10px;">
                <h4 style="color: #046b33; margin: 0; font-size: 1.1rem;">${ed.nombre}</h4>
            </div>
        `;
    });
    track.innerHTML = html;

    let indiceActual = 0;
    let intervaloSlider;
    
    function moverSlider(direccion) {
        const itemsVisibles = window.innerWidth > 900 ? 4 : (window.innerWidth > 600 ? 2 : 1);
        const maxIndice = congresoData.editoriales.length - itemsVisibles;

        if (maxIndice <= 0) return;

        if (direccion === 'next') {
            indiceActual = indiceActual >= maxIndice ? 0 : indiceActual + 1;
        } else {
            indiceActual = indiceActual <= 0 ? maxIndice : indiceActual - 1;
        }

        const slideWidth = track.children[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${indiceActual * (slideWidth + 20)}px)`;
    }

    document.getElementById('btn-next-edit').addEventListener('click', () => {
        moverSlider('next');
        reiniciarIntervalo();
    });
    document.getElementById('btn-prev-edit').addEventListener('click', () => {
        moverSlider('prev');
        reiniciarIntervalo();
    });

    function iniciarIntervalo() {
        intervaloSlider = setInterval(() => moverSlider('next'), 10000);
    }
    function reiniciarIntervalo() {
        clearInterval(intervaloSlider);
        iniciarIntervalo();
    }

    if (congresoData.editoriales.length > (window.innerWidth > 900 ? 4 : (window.innerWidth > 600 ? 2 : 1))) {
        iniciarIntervalo();
    }
};

// ==========================================
// CONTADOR PARA APERTURA DE INSCRIPCIONES
// ==========================================
window.iniciarContadorInscripciones = function() {
    const contenedorAviso = document.getElementById('aviso-inscripciones');
    const elContador = document.getElementById('contador-inscripciones');
    
    if (!contenedorAviso || !elContador) return;

    if (INSCRIPCIONES_ABIERTAS) {
        contenedorAviso.innerHTML = '<p style="margin: 0; font-weight: bold; color: #046b33; font-size: 1.3rem;">✅ ¡El sistema de reservas ya está habilitado!</p>';
        return;
    }

    const actualizarRelojInscripciones = setInterval(function() {
        const ahora = new Date().getTime();
        const distancia = FECHA_APERTURA_INSCRIPCIONES - ahora;

        if (distancia <= 0) {
            clearInterval(actualizarRelojInscripciones);
            verificarAperturaInscripciones(); 
            contenedorAviso.innerHTML = '<p style="margin: 0; font-weight: bold; color: #046b33; font-size: 1.3rem;">✅ ¡El sistema de reservas ya está habilitado!</p>';
            if(typeof window.renderizarAgenda === 'function') window.renderizarAgenda();
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        let textoFaltante = "Faltan: ";
        if (dias > 0) textoFaltante += `${dias}d `;
        textoFaltante += `${horas < 10 ? '0'+horas : horas}h : ${minutos < 10 ? '0'+minutos : minutos}m : ${segundos < 10 ? '0'+segundos : segundos}s`;
        
        elContador.innerText = textoFaltante;

    }, 1000);
};

// ==========================================
// INICIALIZACIÓN GLOBAL
// ==========================================
document.addEventListener('keydown', function(event) {
    const isAlertVisible = customAlertOverlay && !customAlertOverlay.classList.contains('hidden');
    const isTallerModalVisible = modalContenedor && modalContenedor.classList.contains('active');
    const isExpositorModalVisible = modalExpositor && modalExpositor.classList.contains('active');
    const isEditorialModalVisible = document.getElementById('modal-editorial') && document.getElementById('modal-editorial').classList.contains('active');
    const isActividadModalVisible = document.getElementById('modal-actividad') && document.getElementById('modal-actividad').classList.contains('active');
    const isCreadoraModalVisible = document.getElementById('modal-creadora') && document.getElementById('modal-creadora').classList.contains('active');
    const isSponsorModalVisible = document.getElementById('modal-sponsor') && document.getElementById('modal-sponsor').classList.contains('active');
    
    const modalPerfil = document.getElementById('modal-perfil');
    const isPerfilModalVisible = modalPerfil && modalPerfil.classList.contains('active');
    
    const cardNavMenu = document.getElementById('card-nav-menu');
    const isMenuVisible = cardNavMenu && !cardNavMenu.classList.contains('hidden');

    if (event.key === 'Escape') {
        if (isAlertVisible) {
            window.closeCustomAlert();
        } else if (isTallerModalVisible) {
            window.cerrarModal();
        } else if (isExpositorModalVisible) {
            window.cerrarModalExpositor();
        } else if (isEditorialModalVisible) {
            window.cerrarModalEditorial();
        } else if (isActividadModalVisible) {
            window.cerrarModalActividad();
        } else if (isCreadoraModalVisible) {
            window.cerrarModalCreadora();
        } else if (isSponsorModalVisible) {
            window.cerrarModalSponsor();
        } else if (isPerfilModalVisible) {
            modalPerfil.classList.remove('active'); 
        } else if (isMenuVisible) {
            cardNavMenu.classList.add('hidden'); 
            const menuToggleBtn = document.getElementById('menu-toggle');
            if (menuToggleBtn) menuToggleBtn.classList.remove('open');
        }
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
    if(typeof window.iniciarSliderEditoriales === 'function') window.iniciarSliderEditoriales();
    if(typeof window.iniciarHeroSlider === 'function') window.iniciarHeroSlider();
    if(typeof window.iniciarContador === 'function') window.iniciarContador(); 
    if(typeof window.iniciarAnimacionesScroll === 'function') window.iniciarAnimacionesScroll();
    if(typeof window.iniciarSliderInstituciones === 'function') window.iniciarSliderInstituciones();
    
    // Iniciar el contador de inscripciones
    if(typeof window.iniciarContadorInscripciones === 'function') window.iniciarContadorInscripciones();
});