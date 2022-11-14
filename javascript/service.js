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