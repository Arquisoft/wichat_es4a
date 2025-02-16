module.exports =[
    {
        "question": "¿A qué país pertenece esta bandera: <countryLabel>?",
        "selector": "<countryLabel>",
        "topics": ["geography"],
        //la consulta selecciona 3 variables -> nombre del pais, nombre de la bandera y la imagen de la bandera
        "query": "SELECT ?countryLabel ?flagLabel ?flag" +
        //country debe ser una -> instancia(P31) de -> pais(Q6256)
                 "WHERE { ?countryLabel wdt:P31 wd:Q6256." +
        //country tiene -> una relación con bandera(P41)
                 "?country wdt:P41 ?flag." +
        //solicitar que se obtengan las etiquetas
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } }",
        //el valor de flag será reemplazado dinámicamente con la URL de la imagen de la bandera
        "imageurl": "<flag>"
    },

    {
        //dangeer!!!!!!!!!!!!! -> igual hay que plantear otra pregunta porque no hay contornos para todos :') ????
        "question": "¿A qué país pertenece este contorno: <countryLabel>?",
        "selector": "<countryLabel>",
        "topics": ["geography", "map"],
        "query": "SELECT ?countryLabel ?contour" +
                 "WHERE { ?country wdt:P31 wd:Q6256." +
                 "?country wdt:P18 ?contour." +
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } }",
        "imageurl": "<contour>"
    },
    
    {
        "question": "¿Cuál es la capital de este país: <countryLabel>?",
        "selector": "<countryLabel>",
        "topics": ["geography", "image"],
        "query": "SELECT ?countryLabel ?capitalLabel ?capitalImage WHERE { " +
                 "?country wdt:P31 wd:Q6256. " + 
                 "?country wdt:P36 ?capital. " + 
                 "?capital wdt:P18 ?capitalImage. " + // Intenta obtener una imagen de la capital
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } }",
        "imageurl": "<capitalImage>"
    },

    {
        "question": "¿Quién es la persona histórica que aparece en esta foto: <personLabel>?",
        "selector": "<personLabel>",
        "topics": ["history"],
        "query": "SELECT ?personLabel ?image WHERE { " +
                 "?person wdt:P31 wd:Q5. " + //seres humanos
                 "?person wdt:P570 ?deathDate. " + //personas fallecidas (históricas)
                 "?person wdt:P18 ?image. " + //imagen
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } } ",
        "imageurl": "<image>"
    },
    
    {
        "question": "¿En qué fecha ocurrió este acontecimiento histórico?",
        "selector": "<eventLabel>",
        "topics": ["history", "image"],
        "query": "SELECT ?eventLabel ?date ?image WHERE { " +
                 "?event wdt:P31 wd:Q1190554. " + //eventos históricos
                 "?event wdt:P585 ?date. " + //fecha de ocurrencia
                 "?event wdt:P18 ?image. " + //imagen
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } } ",
        "imageurl": "<image>"
    },

    {
        "question": "¿Dónde ocurrió este acontecimiento histórico?",
        "selector": "<eventLabel>",
        "topics": ["history", "location", "image"],
        "query": "SELECT ?eventLabel ?locationLabel ?image WHERE { " +
                 "?event wdt:P31 wd:Q1190554. " + //eventos históricos
                 "?event wdt:P276 ?location. " + //ubicación del evento
                 "?event wdt:P18 ?image. " + //imagen
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],es\". } } ",
        "imageurl": "<image>"
    }
]