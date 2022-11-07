const PATH_BATI = './bati.geojson';
const PATH_QUART = './quartier.geojson'

function getData(path){
    return new Promise((resolve, reject) => {
        d3.json(path)
            .then((geojson) => {
                // Correct the winding order
                geojson.features.forEach(feature => {
                    feature.geometry = turf.rewind(feature.geometry, { reverse : true});
                })
                resolve(geojson);
            })
            .catch(err => {
                reject(err);
            });
    })
}

export function getDataFromFile(fileType){
    if(fileType === 'b'){
        return getData(PATH_BATI);
    }

    if(fileType === 'q'){
        return getData(PATH_QUART);
    }

    return undefined;
}


/* d3.json('./namur-limites-de-46-quartiers.geojson').then((geojson) => {

    //geojson.features = geojson.features.filter(x => x.properties.quart_nom === 'Cathédrale')

    geojson.features.forEach(function(feature){
        feature.geometry = turf.rewind(feature.geometry, { reverse : true});
    })



   color = [
        "#FF0000",
        "#FFA700",
        "#FFF400",
        "#A3FF00",
        "#2CBA00",
    ]

    let quartiers = {
        "Andoy": 40575.5947580645,
        "Bouge": 37493.5982008996,
        "Moulin à vent": 32954.2459788152,
        "Boninne": 40550.0323974082,
        "Cognelée": 37096.7446808511,
        "Champion": 36545.0315934066,
        "Dave": 32819.977245509,
        "Daussoulx": 34439.1068493151,
        "Flawinne": 31350.9431680774,
        "La Leuchère": 31714.2891278375,
        "Gelbressée": 38866.9223880597,
        "Amée": 23333.9107282694,
        "Velaine": 25043.8636481242,
        "Montagne": 34693.233562316,
        "Géronsart": 42593.6763678696,
        "Herbatte": 20499.7464788732,
        "La Plante": 29574.5478855721,
        "Salzinnes": 27349.0044272275,
        "Bomel-Heuvy": 21918.5124198718,
        "Bas-Prés": 20805.5904605263,
        "Trois-Piliers": 25891.789904502,
        "Suarlée": 38530.4455958549,
        "Vedrin": 35464.454091193,
        "Wierde": 43113.8207171315,
        "Belgrade": 33065.9899178491,
        "Fonds de Malonne": 33287.7903118779,
        "Hauts de Malonne": 37375.0862329803,
        "Namur-Centre": 20159.6320836966,
        "Cathédrale": 22248.0095759234,
        "Sources": 22253.3283302064,
        "Saint-Marc": 33032.658808933,
        "Temploux": 38727.4152249135,
        "Vierly": 36861.8187919463,
        "Beez": 35095,
        "Erpent": 43028.7147102526,
        "Jambes-Centre": 25693.5235128617,
        "Lives": 34615.095890411,
        "Loyers": 37526.4142091153,
        "Marche-les-Dames": 35262.7707129094,
        "Célestines": 18704.467164976,
        "Citadelle": 53283.3315899582,
        "Naninne": 36393.4127906977,
        "Saint-Servais": 21493.5489379425,
        "Frizet": 39638.4786516854,
        "Comognes": 34071.1393557423,
        "Fooz-Wépion": 34817.1105722599
    }

    let tranches = [
        25620.24004997244,
        32536.01293496888,
        39451.78581996532,
        46367.55870496176
    ]

    geojson.features.forEach(elem => {
        let fQuartier = elem.properties.quart_nom
        elem.properties.color = color[color.length - 1]
        if(fQuartier !== undefined){
            for(let i = 0; i < tranches.length; i++){
                if(quartiers[fQuartier] < tranches[i]){
                    elem.properties.color = color[i]
                    break;
                }
            }
        }
    });

    //geojson.features = geojson.features.filter(f => f.properties.acom_nom_m === 'FLAWINNE')

    const svg = d3.select('#map').append('svg').attr('width', width).attr('height', height);

    displayMainMap(geojson, svg)
    
}).catch(err => console.log(err)) */