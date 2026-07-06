export const congresoData = {
    infoGeneral: {
        nombre: "1er Congreso Nacional de Aprendizaje Basado en Juego (ABJ)",
        descripcion: "Reunirá a docentes, profesionales de la salud, estudiantes y diseñadores de juegos para explorar el uso de los juegos de mesa como herramientas pedagógicas y de transformación social.",
        organizador: "Homo Ludens"
    },
    expositores: [
        { 
            id: "exp-or", 
            nombre: "Oriol Ripoll", 
            avatar: "OR", 
            titulo: "Magisterio especializado en juegos y didáctica", 
            bio: "Cofundador del estudio 'Jocs al segon'. Profesor universitario de Game Design y director del Máster en Juego, Gamificación y Tecnología.", 
            web: "" 
        },
        { 
            id: "exp-fo", 
            nombre: "Fernando Ortiz Cueva", 
            avatar: "FO", 
            titulo: "Doctor en Educación", 
            bio: "Coordinador de la unidad de gamificación de la Escuela de Negocios ITESO. Maestro en administración educativa, especializado en estrategias para el aprendizaje. Licenciado en Diseño.", 
            web: "" 
        },
        { 
            id: "exp-se", 
            nombre: "Lic. Solange Estevez", 
            avatar: "SE", 
            titulo: "Licenciada en Psicología Clínica", 
            bio: "Especializada en Terapia de Aceptación y Compromiso. Investigadora en conducta lúdica y Coordinadora de espacios lúdicos.", 
            web: "" 
        },
        { 
            id: "exp-rl", 
            nombre: "Dr. Ricardo Lema Álvarez", 
            avatar: "RL", 
            titulo: "Doctor en Ocio y Desarrollo Humano", 
            bio: "Licenciado en Comunicación Social y Docente en la Licenciatura de Recreación Educativa. Coautor del libro 'Pedagogía de la Lúdica - Pedagogía de la Recreación'.", 
            web: "" 
        },
        { 
            id: "exp-ap", 
            nombre: "Lic. Alejandra Pytel", 
            avatar: "AP", 
            titulo: "Licenciada en Psicología MP 3182", 
            bio: "Especialista en Adolescencia (UNC), Tallerista Grupal, Profesora de Educación preescolar e Investigadora en conducta lúdica.", 
            web: "" 
        }
    ],
    sponsors: {
        principales: [ 
            { nombre: "La Regadera", logo: "Imagenes/Sponsor1.jpg", url: "#" },
            { nombre: "Dragón Azul", logo: "Imagenes/Sponsor2.jpg", url: "#" }
        ]
    },
    agendaGeneral: [
        {
            id: "dia1",
            dia: "1er DÍA",
            fecha: "SÁBADO 15",
            eventos: [
                { hora: "9:00hs", titulo: "ACREDITACIÓN" },
                { hora: "9:30hs", titulo: "APERTURA" },
                { hora: "10:30hs", titulo: "PONENCIA MAGISTRAL" },
                { hora: "14:00HS", titulo: "TALLERES" },
                { hora: "15:45HS", titulo: "TALLERES" },
                { hora: "DE 12HS A 19HS", titulo: "EXPOSITORES" }
            ]
        },
        {
            id: "dia2",
            dia: "2º DÍA",
            fecha: "DOMINGO 16",
            eventos: [
                { hora: "9:30hs", titulo: "PONENCIA MAGISTRAL" },
                { hora: "10:30hs", titulo: "PONENCIA MAGISTRAL" },
                { hora: "14:00HS", titulo: "TALLERES" },
                { hora: "15:45HS", titulo: "TALLERES" },
                { hora: "DE 12HS A 19HS", titulo: "EXPOSITORES" }
            ]
        },
        {
            id: "dia3",
            dia: "3er DÍA",
            fecha: "LUNES 17",
            eventos: [
                { hora: "9:30hs", titulo: "PONENCIA MAGISTRAL" },
                { hora: "10:30hs", titulo: "TALLERES" },
                { hora: "14:00HS", titulo: "CIERRE" },
                { hora: "DE 12HS A 19HS", titulo: "EXPOSITORES" }
            ]
        }
    ],
    cronograma: {
        dia1: {
            fecha: "Sábado 15 de Agosto",
            modulos: {
                manana: [
                    { id: "d1-m-1", titulo: "Ludificación de la enseñanza en Ciencias Sociales", ponente: "Ricardo Lema", resumen: "Eje Temático: Educación.", cupoMaximo: 30 },
                    { id: "d1-m-2", titulo: "“La gran revolución” Juego de rol masivo", ponente: "Franco Toffoli", resumen: "Eje Temático: Educación / Familia.", cupoMaximo: 30 },
                    { id: "d1-m-3", titulo: "Ajedrez 4.0", ponente: "Mariano Avalos", resumen: "Herramientas de pensamiento estratégico.", cupoMaximo: 30 },
                    { id: "d1-m-4", titulo: "Juegos cooperativos no competitivos", ponente: "Luciana Ballestero", resumen: "Abordaje desde la neuroeducación.", cupoMaximo: 30 },
                    { id: "d1-m-5", titulo: "Bienestar emocional", ponente: "Dayana Rubira", resumen: "El juego como puente para aprender, sentir y crear.", cupoMaximo: 30 },
                    { id: "d1-m-6", titulo: "No es juego, es cerebro aprendiendo", ponente: "Natalia Felicetti", resumen: "Neurociencia aplicada al juego.", cupoMaximo: 30 },
                    { id: "d1-m-7", titulo: "Decidir para aprender", ponente: "Marisa Conde", resumen: "Creación de aventuras point & click.", cupoMaximo: 30 }
                ],
                tarde: [
                    { id: "d1-t-1", titulo: "Las editoriales y los juegos con posibilidades", ponente: "La regadera, Dragón Azul y Sudoku2", resumen: "Panel de editoriales nacionales.", cupoMaximo: 30 },
                    { id: "d1-t-2", titulo: "Colorido Juegos su aplicación", ponente: "Micaela Koncurat", resumen: "Aplicación a contextos educativos.", cupoMaximo: 30 },
                    { id: "d1-t-3", titulo: "Juegos matemáticos en primaria", ponente: "Fernando Ariel", resumen: "Didáctica de las matemáticas.", cupoMaximo: 30 },
                    { id: "d1-t-4", titulo: "QuoriDUA: Caminos para Aprender Jugando", ponente: "Liliana Mendez", resumen: "Eje Temático: Educación.", cupoMaximo: 30 },
                    { id: "d1-t-5", titulo: "La Chatarra Inteligente y el Alma de la Máquina", ponente: "Patricia B. Ramirez y María R. Fernandez", resumen: "Dispositivos de juego para crear mundos.", cupoMaximo: 30 },
                    { id: "d1-t-6", titulo: "Aulas épicas", ponente: "Paula Moyano", resumen: "El poder de la narrativa y el juego.", cupoMaximo: 30 }
                ]
            }
        },
        dia2: {
            fecha: "Domingo 16 de Agosto",
            modulos: {
                manana: [
                    { id: "d2-m-1", titulo: "Taller (Por definir)", ponente: "Oriol Ripoll", resumen: "Detalles próximamente.", cupoMaximo: 30 },
                    { id: "d2-m-2", titulo: "El juego como gran enlazador de contenidos", ponente: "Marisa Torres", resumen: "Integración curricular transversal.", cupoMaximo: 30 },
                    { id: "d2-m-3", titulo: "Experiencias de juegos aplicados en Mendoza", ponente: "Emanuel y Gianina", resumen: "Casos de estudio y experiencias locales.", cupoMaximo: 30 },
                    { id: "d2-m-4", titulo: "Juegos de educación ambiental", ponente: "Compostate bien", resumen: "Concientización a través del tablero.", cupoMaximo: 30 },
                    { id: "d2-m-5", titulo: "Escape rooms educativos", ponente: "Fabian Zamit", resumen: "Diseño y aplicación en el aula.", cupoMaximo: 30 },
                    { id: "d2-m-6", titulo: "Juegos en la secundaria", ponente: "Sandra Enrique", resumen: "Estrategias para adolescentes.", cupoMaximo: 30 },
                    { id: "d2-m-7", titulo: "Juegos para actuar", ponente: "Damián Valgiusti", resumen: "Dinámicas de rol y expression corporal.", cupoMaximo: 30 }
                ],
                tarde: [
                    { id: "d2-t-1", titulo: "Adolescencias en juego", ponente: "Alejandra y Sol", resumen: "Experiencias de talleres lúdicos.", cupoMaximo: 30 },
                    { id: "d2-t-2", titulo: "Juegos que se tocan", ponente: "Andrea Rocca", resumen: "ABJ con Scratch y Chimeleta.", cupoMaximo: 30 },
                    { id: "d2-t-3", titulo: "Juegos nómadas del mundo", ponente: "Riccardo Acuña", resumen: "Perspectiva multicultural del juego.", cupoMaximo: 30 },
                    { id: "d2-t-4", titulo: "Jugar a las matemáticas", ponente: "Olga (Neuquén)", resumen: "Estrategias numéricas.", cupoMaximo: 30 },
                    { id: "d2-t-5", titulo: "Explora, aprende y disfruta", ponente: "Tekun", resumen: "Colección de juegos expedición (Naturaleza Argentina).", cupoMaximo: 30 },
                    { id: "d2-t-6", titulo: "ABJ desde la enseñanza oficial", ponente: "Yuguets", resumen: "Políticas y prácticas formales.", cupoMaximo: 30 }
                ]
            }
        },
        dia3: {
            fecha: "Lunes 17 de Agosto",
            modulos: {
                manana: [
                    { id: "d3-m-1", titulo: "Taller (Por definir)", ponente: "Sofo", resumen: "Detalles próximamente.", cupoMaximo: 30 },
                    { id: "d3-m-2", titulo: "Juegos de bazas", ponente: "Fabian Martinez", resumen: "Mecánicas y aplicación.", cupoMaximo: 30 },
                    { id: "d3-m-3", titulo: "Scrabble para el aula", ponente: "Luis Osvaldo Carestia", resumen: "Desarrollo del lenguaje y vocabulario.", cupoMaximo: 30 },
                    { id: "d3-m-4", titulo: "Juegos para consultorio", ponente: "Micaela Koncurat", resumen: "Eje Temático: Salud.", cupoMaximo: 30 },
                    { id: "d3-m-5", titulo: "El diseño al aula", ponente: "Por confirmar", resumen: "Experiencias de un trayecto de formación docente.", cupoMaximo: 30 },
                    { id: "d3-m-6", titulo: "Homo ludens de los 0 a los 99 años", ponente: "Mesa de experiencias", resumen: "Eje Temático: Familia.", cupoMaximo: 30 },
                    { id: "d3-m-7", titulo: "Juegos de ciencias sociales en primaria", ponente: "Fernando Ariel", resumen: "Aplicación práctica e histórica.", cupoMaximo: 30 }
                ],
                tarde: [] 
            }
        }
    }
};