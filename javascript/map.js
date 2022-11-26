import { INFO } from "./info.js";
import { getDataFromFile } from "./service.js";

export const MAP = (function () {

    //#region constante

    const WIDTH = 700
    const HEIGHT = 500

    const COLORS = {
        colorLevel: [
            getComputedStyle(document.documentElement).getPropertyValue('--critical'),
            getComputedStyle(document.documentElement).getPropertyValue('--bad'),
            getComputedStyle(document.documentElement).getPropertyValue('--medium'),
            getComputedStyle(document.documentElement).getPropertyValue('--good'),
            getComputedStyle(document.documentElement).getPropertyValue('--excelent'),
        ],
        border: getComputedStyle(document.documentElement).getPropertyValue('--text')
    }

    const TYPES = {
        DISTRICT : 'districts',
        BUILDING : 'buildings'
    };

    //#endregion

    const svg = d3.select('#map').append('svg')
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .classed('map-svg', true)

    let districtDataset;
    let buildingDataset;
    let container;  // The main container for the map
    let districtContainer;
    let projection;
    let centered;
    let buildingCentered;
    let path;
    let currentZoomedDistrict;
    let currentZoomedBuilding;
    let displayedMode = TYPES.BUILDING;

    /**
     * Gather the data to display. Initialize this.districtDataset and this.buildingDataset.
     * @returns A Promise that resolve if the data has been fetch without any problem, and reject if a problem occured during the fetching.
     */
    function init() {
        return new Promise((resolve, reject) => {
            getDataFromFile('q').then(districts => {
                districtDataset = districts;
                getDataFromFile('b').then(buildings => {
                    buildingDataset = buildings;
                    resolve();
                }).catch(e => {
                    console.error(e);
                    reject('An error occurs during the loading of the disrict dataset. Check previous log');
                })
            }).catch(e => {
                console.error(e);
                reject('An error occurs during the loading of the building dataset. Check previous log');
            })
        })
    }

    function displayDistricts() {
        for(let district of districtDataset.features){
            const g = container.append('g')
                .attr('id', district.properties.quart_name.replaceAll(' ', '-'))
                .attr('data-quart', district.properties.quart_name)

            g.selectAll('path')
                .data([district])
            .enter().append('path')
                .classed('district-elem', true)
                .attr('d', path)
                .attr('fill', 'transparent')
                .attr('stroke', COLORS.border)
        }
    }

    function addDistrictEvent(){
        container.selectAll('.district-elem')
                .on('click', function (_, d) {
                    clickDistrict(d, path)
                })
                .on('mouseover', function () {
                    d3.select(this).transition()
                        .duration('50')
                        .style('opacity', '0.75')
                })
                .on('mouseout', function () {
                    d3.select(this).transition()
                        .duration('50')
                        .style('opacity', '1')
                });
    }

    function removeDistrictEvent(){
        container.selectAll('.district-elem')
                .on('click', null)
                .on('mouseover', null)
                .on('mouseout', null);
    }
        
    async function displayDistrictColor(){
        displayedMode = TYPES.DISTRICT;
        return new Promise((resolve, _) => {
            let n = 0;
            let animDuration = 600;
            let sortedDistrict = sortDistrictByLongitude()
            for(let district of sortedDistrict.features){
                setTimeout(() => {
                    const name = district.properties.quart_name; 
                    container.select(`#${name.replaceAll(' ', '-')}`).selectAll('.district-elem')
                        .transition()
                            .duration(animDuration)
                            .attr('fill', d => COLORS.colorLevel[d.properties.level - 1])
                }, n * 10)
                n++
            }

            // Send signal when transition is finish
            setTimeout(() => {
                resolve()
            }, n * 15 + animDuration)
        })
        
    }

    async function removeDistrictColor(){
        displayedMode = TYPES.BUILDING;
        return new Promise((resolve, _) => {
            let sortedDistrict = sortDistrictByLongitude()
            for(let n = sortedDistrict.features.length - 1; n >= 0; n--){
                setTimeout(() => {
                    const name = sortedDistrict.features[n].properties.quart_name; 
                    container.select(`#${name.replaceAll(' ', '-')}`).selectAll('.district-elem')
                        .transition()
                            .duration(600)
                            .attr('fill', 'transparent')
                    if(n === 0){
                        resolve()
                    }
                }, (n - 45) * (-10))
            }
        })
    }

    function sortDistrict(by, reverse=false){

        // Check if by is a valid key
        if(!districtDataset.features[0].properties[by]){
            console.error(`${by} is not a valid key`)
        }

        let sortedDistricts = {
            'type' : 'FeatureCollection',
            features : []
        }

        for(let district of districtDataset.features){
            // sortedDistrict.features is empty
            if(sortedDistricts.features.length === 0){
                sortedDistricts.features.push(district)
            }
            else{
                // Find district index in sortedDistrict
                for(var i = 0; i < sortedDistricts.features.length; i++){
                    const a = district.properties[by];
                    const b = sortedDistricts.features[i].properties[by];
                    // asc sort
                    if(a < b){
                        sortedDistricts.features.splice(i, 0, district)
                        break; // index has been found we can stop the iteration
                    }
                }
                // If index has not been found, add district as the last sortedDistricts
                if(i === sortedDistricts.features.length){
                    sortedDistricts.features.push(district)
                }
            }
        }

        if(reverse){
            sortedDistricts.features.reverse()
        }

        return sortedDistricts
    }

    /**
     * @return A new geojson object with features sorted by centroid longitude
     */
    function sortDistrictByLongitude(){
        let sortedDistricts = {
            'type' : 'FeatureCollection',
            features : []
        }

        for(let district of districtDataset.features){
            // sortedDistrict.features is empty
            if(sortedDistricts.features.length === 0){
                sortedDistricts.features.push(district)
            }
            else{
                for(var i = 0; i < sortedDistricts.features.length; i++){
                    const districtToInsertLong = district.properties.geo_point_2d[1];
                    const currentDistrictLong = sortedDistricts.features[i].properties.geo_point_2d[1];
                    if(districtToInsertLong < currentDistrictLong){
                        sortedDistricts.features.splice(i, 0, district)
                        break;
                    }
                }
                if(i === sortedDistricts.features.length){
                    sortedDistricts.features.push(district)
                }
            }
        }

        return sortedDistricts
    }

    function displayDistrictBuilding(districtName, buildingIndex=undefined){
        // Clear all building
        d3.selectAll('.buildings-group').remove();

        // Display building of districtName
        const districtContainer = d3.select(`#${districtName.replaceAll(' ', '-')}`)

        const filteredBuildings = {
            'type' : 'FeatureCollection',
            features : buildingDataset.features.filter(b => b.properties.quart_name === districtName)
        };

        const g = districtContainer.append('g').classed('buildings-group', true)
        g.selectAll('path')
            .data(filteredBuildings.features)
            .enter()
            .append('path')
            .classed('active', true)
            .attr('d', path)
            .attr('fill', d => COLORS.colorLevel[d.properties.level])
            .attr('opacity', d => {
                if(!currentZoomedBuilding || (buildingIndex && d.properties.id === buildingIndex)){
                    return 1
                }
                return 0.1
            })
            .attr('data-quart', d => d.properties.quart_name)
            .on('click', (_, d) => {
                clickBuidling(d, path)
            })
            .on('mouseover', function (_, d) {
                if(currentZoomedDistrict !== null || (buildingIndex && d.properties.id === buildingIndex)){
                    return null
                }
                else{
                    d3.select(this).transition()
                    .duration('50')
                    .style('opacity', '1')
                }
            })
            .on('mouseout', function (_, d) {
                if(currentZoomedDistrict !== null || (buildingIndex && d.properties.id === buildingIndex)){
                    return null
                }
                else{
                    d3.select(this).transition()
                    .duration('50')
                    .style('opacity', '0.1')
                }
            })
    }

    function displayBuilding() {
        const g = container.append('g').attr('id', 'bati');
        g.selectAll('path')
            .data(buildingDataset.features)
            .enter()
            .append('path')
            .classed('active', true)
            .attr('d', path)
            .attr('fill', d => COLORS.colorLevel[d.properties.level])
            .attr('data-quart', d => d.properties.quart_name)
            .on('click', (_, d) => {
                console.log(d)
            })

    }

    function removeBuilding(){
        d3.select('.buildings-group').remove();
    }

    function __setUpProjection() {
        projection = d3.geoMercator()
            .fitSize([WIDTH-50, HEIGHT-50], { ...districtDataset, ...buildingDataset })
        path = d3.geoPath().projection(projection)
    }

    function clickBuidling(d, path){
        let x, y, k;

        if (d && buildingCentered !== d) {
            let centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 20
            buildingCentered = d;
        }
        else {
            x = WIDTH / 2;
            y = HEIGHT / 2;
            k = 1;
            buildingCentered = null;
        }

        if (buildingCentered) {
            let quartName = d.properties.quart_name
            container.selectAll(`:not(g[data-quart="${quartName}"])`)
                .style('display', 'none')
            container.selectAll(`g[data-quart="${quartName}"] .district-elem`)
                .style('display', 'block')
                .style('pointer-events', 'auto')
            currentZoomedBuilding = d
            currentZoomedDistrict = null
            removeBuildingsBackground();
            displayDistrictBuilding(quartName, d.properties.id)
            INFO.displayInfoBuilding(d)
        }
        else{
            currentZoomedBuilding = null;
        }

        container.transition()
            .duration(1000)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function () {
                /* container.selectAll('#bati').style('display', 'block') */
                if (!buildingCentered) {
                    /* container.selectAll('#bati path').style('display', 'block') */
                    removeBuilding();
                    displayBuildingBackground();
                    INFO.displayQuartRanking(sortDistrict('ranking'))
                    container.selectAll('g')
                        .style('display', 'block')
                        .selectAll('path')
                            .style('display', 'block')
                }
            })
    }

    function clickDistrict(d, path) {

        let x, y, k;

        if (d && centered !== d) {
            let centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4
            centered = d;
        }
        else {
            x = WIDTH / 2;
            y = HEIGHT / 2;
            k = 1;
            centered = null;
        }

        container.select('#district').selectAll('path')
            .classed('active', centered && function (d) { return d === centered })

        let quartName = 'Namur'
        if (centered) {
            currentZoomedBuilding = null
            container.selectAll(`:not(g[data-quart="${d.properties.quart_name}"])`)
                .style('display', 'none')
            container.selectAll(`g[data-quart="${d.properties.quart_name}"] .district-elem`)
                .style('display', 'block')
                .style('pointer-events', 'auto')
            currentZoomedDistrict = d
            currentZoomedBuilding = null
            quartName = d.properties.quart_name
            console.log(displayedMode)
            if(displayedMode === TYPES.BUILDING){
                displayDistrictBuilding(quartName)
            }
            removeBuildingsBackground();
            INFO.displayDistrictInfo(d)
        }
        else{
            currentZoomedDistrict = null;
        }
        
        document.getElementById('selection-name').innerHTML = quartName;


        container.transition()
            .duration(1000)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function () {
                /* container.selectAll('#bati').style('display', 'block') */
                if (!centered) {
                    /* container.selectAll('#bati path').style('display', 'block') */
                    removeBuilding();
                    displayBuildingBackground();
                    INFO.displayQuartRanking(sortDistrict('ranking'))
                    container.selectAll('g')
                        .style('display', 'block')
                        .selectAll('path')
                            .style('display', 'block')
                }
            })
    }

    function removeBuildingsBackground(){
        document.getElementsByClassName('map-svg')[0].classList.remove('buildings')
    }

    function displayBuildingBackground(){
        document.getElementsByClassName('map-svg')[0].classList.add('buildings')
    }

    function displayGroup(type){
        if(type === TYPES.DISTRICT){
            removeDistrictEvent();
            removeBuilding(); // If map is centered, the displayed building need to be removed too
            removeBuildingsBackground();
            displayDistrictColor().then(() => {
                addDistrictEvent()
            });
        }
        else{
            if(type === TYPES.BUILDING){
                // Do not display the building background if the map is zoomed in
                if(!centered){
                    displayBuildingBackground();
                }
                removeDistrictColor().then(() => {
                    if(centered){
                        displayDistrictBuilding(currentZoomedDistrict.properties.quart_name)
                    }
                });
            }
        }
    }

    return {
        types: TYPES,
        districtProdMean : function(){
            let total = 0;
            for(let district of districtDataset.features){
                total += district.properties.quart_prod;
            }
            return total/districtDataset.features.length
        },
        path: function(){
            return path;
        },
        displayMap: async function () {
            try {
                await init();

                __setUpProjection();

                // Set up the map container
                container = svg.append('g');
                svg.node().classList.add('buildings')

                districtContainer = displayDistricts()
                addDistrictEvent()
                /* displayDistrictColor().then(() => {
                    addDistrictEvent();
                });
                 */
                //displayBuilding();

                return new Promise((resolve, _) => {
                    resolve([districtDataset, buildingDataset]);
                })

            }
            catch (e) {
                console.error(e);
            }
        },
        findAdr : function(str){
            const streetName = str.toLowerCase().match(/\D+/g).join('')
                .replaceAll(',', '')
                .replaceAll('rue ', '')
            const streetNumber = str.match(/\d+/g)[0]
            let delta = 99999;
            let result;
            for(let b of buildingDataset.features){
                if(b.properties.street_name.toLowerCase().includes(streetName)){
                    if(b.properties.street_num && Math.abs(b.properties.street_num - streetNumber) < delta){
                        result = b
                        delta = Math.abs(b.properties.street_num - streetNumber)
                    }
                }
            }
            clickBuidling(result, path)
        },
        displayBuildings : displayBuilding,
        displayGroup: displayGroup,
        clickDistrict : clickDistrict,
        sortDistrict : sortDistrict
    }
})();
