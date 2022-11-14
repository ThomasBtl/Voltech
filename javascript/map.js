import { getDataFromFile } from "./service.js";

export const MAP = (function () {

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

    const svg = d3.select('#map').append('svg').attr('width', WIDTH).attr('height', HEIGHT)

    let districtDataset;
    let buildingDataset;
    let buildingByDistrictDataset;
    let container;  // The main container for the map
    let districtContainer;
    let projection;
    let centered;
    let path;

    function init() {
        return new Promise((resolve, reject) => {
            getDataFromFile('q').then(districts => {
                districtDataset = districts;
                getDataFromFile('b').then(buildings => {
                    // Arrange buildings in order to have a set of building for each districts
                    let buildingByDistrict = {}
                    for(let b of buildings.features){
                        if(!buildingByDistrict[b.properties.quart_name]){
                            buildingByDistrict[b.properties.quart_name] = []
                        }
                        buildingByDistrict[b.properties.quart_name].push(b)
                    }

                    buildingDataset = buildings;
                    buildingByDistrictDataset = buildingByDistrict

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
        const g = container.append('g').attr('id', 'district');
        districtContainer = g.selectAll('path')
            .data(districtDataset.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'transparent')
            .attr('stroke', COLORS.border)
            .attr('data-quart', d => d.properties.quart_name)
            .on('click', function (_, d) {
                clickDistrict(d, g, path)
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

        return g;
    }

    function displayColorfulDistrict(){
        districtContainer.selectAll('path')
            .attr('fill', d => COLORS.colorLevel[d.properties.level - 1])
    }

    function displayTernDistrict(){
        const districtPaths = districtContainer.selectAll('path')
            .attr('fill', 'transparent')

        // Add districts events
        districtPaths
            .on('mouseover', function () {
                d3.select(this).transition()
                    .duration('50')
                    .attr('fill',  COLORS.border)
                    .style('opacity', '0.3')
            })
            .on('mouseout', function () {
                d3.select(this).transition()
                    .duration('50')
                    .attr('fill', 'transparent')
                    .style('opacity', '1')
            });
    }

    function displayBuilding() {
        const g = districtContainer.append('g').attr('id', 'bati');
        g.selectAll('path')
            .data(buildingDataset.features)
            .enter()
            .append('path')
            .classed('active', true)
            .attr('d', path)
            .attr('fill', d => COLORS.colorLevel[d.properties.level])
            .attr('data-quart', d => d.properties.quart_name)

    }

    function removeBuilding(){
        d3.select('#bati').remove();
    }

    function __setUpProjection() {
        projection = d3.geoMercator()
            .fitSize([WIDTH-50, HEIGHT-50], { ...districtDataset, ...buildingDataset })
        path = d3.geoPath().projection(projection)
    }

    function clickDistrict(d, container, path) {

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
            container.selectAll(`:not(path[data-quart="${d.properties.quart_name}"])`)
                .style('display', 'none')
            container.selectAll(`path[data-quart="${d.properties.quart_name}"]`)
                .style('display', 'block')
            quartName = d.properties.quart_name
        }
        
        document.getElementById('selection-name').innerHTML = quartName;


        container.transition()
            .duration(1000)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function () {
                container.selectAll('#bati').style('display', 'block')
                if (!centered) {
                    container.selectAll('#bati path').style('display', 'block')
                    container.selectAll('#district path').style('display', 'block')
                }
            })

    }

    function displayGroup(type){
        if(type === TYPES.DISTRICT){
            removeBuilding();
            displayColorfulDistrict()
        }
        else{
            if(type === TYPES.BUILDING){
                displayTernDistrict()
                displayBuilding();
            }
        }
    }

    return {
        types: TYPES,
        path: function(){
            return path;
        },
        displayMap: async function () {
            try {
                await init();

                __setUpProjection()

                // Set up the map container
                container = svg.append('g');

                districtContainer = displayDistricts()
                displayColorfulDistrict();
                // displayBuilding(buildingContainer);

                return new Promise((resolve, _) => {
                    resolve([districtDataset, buildingDataset])
                })

            }
            catch (e) {
                console.error(e)
            }
        },
        displayGroup: displayGroup,
        clickDistrict : clickDistrict
    }
})();



