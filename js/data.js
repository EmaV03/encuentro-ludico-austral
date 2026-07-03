export const congresoData = {
    infoGeneral: {
        nombre: "Encuentro Lúdico Austral 2026",
        descripcion: "Tres días de inmersión total en mecánicas, diseño, arte y partidas épicas.",
        organizador: "Casa Homo Ludens"
    },
    expositores: [
        { 
            id: "exp-al", 
            nombre: "Ana López", 
            avatar: "AL", 
            titulo: "Experta en Diseño y Balanceo", 
            bio: "Especialista en mecánicas de Eurogames y economía cerrada. Su enfoque es la optimización de recursos y la mitigación del azar.",
            web: "https://ejemplo.com/analopez"
        },
        { 
            id: "exp-cr", 
            nombre: "Carlos Ruiz", 
            avatar: "CR", 
            titulo: "Artista de Miniaturas", 
            bio: "Modelador y pintor con más de 10 años de experiencia dando vida a ejércitos de plástico y resina con técnicas avanzadas.",
            web: "https://ejemplo.com/carlosruiz"
        },
        { 
            id: "exp-df", 
            nombre: "Diego Fernández", 
            avatar: "DF", 
            titulo: "Maestro del Prototipado", 
            bio: "Defensor del 'hazlo tú mismo', transforma ideas abstractas en mecánicas jugables usando componentes reciclados.",
            web: "" 
        },
        { 
            id: "exp-sm", 
            nombre: "Sofía Martínez", 
            avatar: "SM", 
            titulo: "Directora de Juego y Narradora", 
            bio: "Apasionada por los juegos temáticos. Su fuerte es la integración de narrativas profundas y mecánicas inmersivas.",
            web: "https://ejemplo.com/sofiamartinez"
        }
    ],
    sponsors: {
        diamante: [ 
            { nombre: "Editorial Lúdica X", logo: "Imagenes/Sponsor1.jpg", url: "https://example.com/editorial-x" },
            { nombre: "Giga Games", logo: "Imagenes/Sponsor2.jpg", url: "https://example.com/giga-games" }
        ],
        oro: [ 
            { nombre: "Tienda El Dado Dorado", logo: "Imagenes/Sponsor3.jpg", url: "https://example.com/dado-dorado" },
            { nombre: "Meeple Factory", logo: "Imagenes/Sponsor4.jpg", url: "https://example.com/meeple-factory" }
        ]
    },
    cronograma: {
        dia1: {
            fecha: "Viernes 14 de Agosto",
            modulos: {
                manana: [
                    { id: "d1-m-t1", titulo: "Diseño de Eurogames", ponente: "Ana López", resumen: "Aprende a balancear la economía interna, flujos de recursos y la colocación de trabajadores en tu juego de mesa.", cupoMaximo: 30, cuposDisponibles: 30 },
                    { id: "d1-m-t2", titulo: "Pintura de Miniaturas", ponente: "Carlos Ruiz", resumen: "Técnicas esenciales de preparación, imprimación, pincel seco y lavados de tinta.", cupoMaximo: 15, cuposDisponibles: 15 }
                ],
                tarde: [
                    { id: "d1-t-t1", titulo: "Introducción al Rol Dinámico", ponente: "Sofía Martínez", resumen: "Herramientas de improvisación y técnicas avanzadas para Directores de Juego.", cupoMaximo: 20, cuposDisponibles: 20 },
                    { id: "d1-t-t2", titulo: "Mecánicas de Deckbuilding", ponente: "Martín Gómez", resumen: "Análisis profundo sobre la progresión de curvas de poder y optimización de mazos.", cupoMaximo: 25, cuposDisponibles: 25 }
                ]
            }
        },
        dia2: {
            fecha: "Sábado 15 de Agosto",
            modulos: {
                manana: [
                    { id: "d2-m-t1", titulo: "Prototipado Rápido", ponente: "Diego Fernández", resumen: "Usa dados en blanco y cartas genéricas para dar forma a tus mecánicas en minutos.", cupoMaximo: 20, cuposDisponibles: 20 },
                    { id: "d2-m-t2", titulo: "Psicología del Jugador", ponente: "Laura Peña", resumen: "Cómo influyen los incentivos visuales en la toma de decisiones competitivas.", cupoMaximo: 40, cuposDisponibles: 40 }
                ],
                tarde: [
                    { id: "d2-t-t1", titulo: "Matemática del Balanceo", ponente: "Javier Ortega", resumen: "Hojas de cálculo aplicadas al testeo y equilibrio de cartas de combate.", cupoMaximo: 15, cuposDisponibles: 15 },
                    { id: "d2-t-t2", titulo: "Campañas en Kickstarter", ponente: "Elena Rostova", resumen: "Estrategias de marketing, metas de recompensa y logística de envíos.", cupoMaximo: 50, cuposDisponibles: 50 }
                ]
            }
        },
        dia3: {
            fecha: "Domingo 16 de Agosto",
            modulos: {
                manana: [
                    { id: "d3-m-t1", titulo: "Construcción de Mundos", ponente: "Lucas Blanco", resumen: "Sincroniza el trasfondo ficticio con los componentes mecánicos para lograr inmersión.", cupoMaximo: 25, cuposDisponibles: 25 },
                    { id: "d3-m-t2", titulo: "Ilustración de Portadas", ponente: "Patricia Marín", resumen: "El diseño gráfico aplicado a manuales y la claridad visual en las cartas.", cupoMaximo: 15, cuposDisponibles: 15 }
                ],
                tarde: [
                    { id: "d3-t-t1", titulo: "Maratón de Playtesting", ponente: "Coordinadores de Mesa", resumen: "Mesas simultáneas dedicadas a probar prototipos de los asistentes y recabar feedback.", cupoMaximo: 60, cuposDisponibles: 60 },
                    { id: "d3-t-t2", titulo: "Futuro del Sector Lúdico", ponente: "Invitados Especiales", resumen: "Debate abierto sobre distribución, impresión ecológica y juegos analógicos.", cupoMaximo: 100, cuposDisponibles: 100 }
                ]
            }
        }
    }
};