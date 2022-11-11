import { getDataFromFile } from "./service.js";

const WIDTH = 700
const HEIGHT = 500
let centered;

let dataBati;
let dataQuart;

let displayQuart = true;
let quartGroupe;

window.onload = function () {


    [...document.getElementsByClassName('menu')].forEach(elem => {


        elem.onclick = (e) => {
            let selectedElem = document.getElementsByClassName('selected')[0];
            let isFirst = selectedElem === document.getElementsByClassName('menu')[0]
            if (isFirst && selectedElem !== e.target) {
                let menuBar = document.getElementsByClassName('menu-bottom-border')[0];
                let leftOffset = parseInt(menuBar.style.left.match(/\d*/));
                menuBar.style.left = `${leftOffset + 200}px`
            }
            else {
                if (!isFirst && selectedElem !== e.target) {
                    let menuBar = document.getElementsByClassName('menu-bottom-border')[0];
                    let leftOffset = parseInt(menuBar.style.left.match(/\d*/));
                    menuBar.style.left = `${leftOffset - 200}px`
                }
            }

            displayQuart = elem.dataset.type === 'quartier';
            if (!displayQuart) {
                displayMainBati(dataBati, quartGroupe);
            }
            else {
                removeBati()
            }

            selectedElem.classList.remove('selected');
            e.target.classList.add('selected')
        }
    });

    function removeBati() {
        d3.select('#bati').remove()
    }

    getDataFromFile('q').then(quartiersData => {
        dataQuart = quartiersData;
        getDataFromFile('b').then(batiData => {
            dataBati = batiData;
            const svg = d3.select('#map').append('svg').attr('width', WIDTH).attr('height', HEIGHT);
            const g = svg.append('g');
            quartGroupe = displayMainQuart(quartiersData, g)
            if (!displayQuart) {
                displayMainBati(batiData, quartGroupe);
            }

            /* var zoom = d3.zoom()
                .scaleExtent([1,8])
                .on('zoom', function(){
                    g.selectAll('path')
                        .attr('transform', d3.zoomTransform(this));
                });
            
            svg.call(zoom); */

        }).catch(err => {
            console.error(err); s
        });

    }).catch(err => {
        console.error(err);
    });

    function displayMainBati(featureCollection, container) {
        let projection = d3.geoMercator()
            .fitSize([WIDTH, HEIGHT], featureCollection)
        let path = d3.geoPath().projection(projection)

        const COLORS = [
            getComputedStyle(document.documentElement).getPropertyValue('--critical'),
            getComputedStyle(document.documentElement).getPropertyValue('--bad'),
            getComputedStyle(document.documentElement).getPropertyValue('--medium'),
            getComputedStyle(document.documentElement).getPropertyValue('--good'),
            getComputedStyle(document.documentElement).getPropertyValue('--excelent'),
        ]

        const g = container.append('g').attr('id', 'bati');
        g.selectAll('path')
            .data(featureCollection.features)
            .enter()
            .append('path')
            .classed('active', true)
            .attr('d', path)
            .attr('fill', d => COLORS[d.properties.level])
            .attr('data-quart', d => d.properties.quart_name)
    }

    function displayMainQuart(featureCollection, container) {
        let projection = d3.geoMercator()
            .fitSize([WIDTH, HEIGHT], featureCollection)
        let path = d3.geoPath().projection(projection)

        console.log(featureCollection.features);

        const g = container.append('g').attr('id', 'quart');
        g.selectAll('path')
            .data(featureCollection.features)
            .enter()
            .append('path')
                .attr('d', path)
                .attr('fill', 'transparent')
                .attr('stroke', getComputedStyle(document.documentElement).getPropertyValue('--text'))
                .attr('data-quart', d => d.properties.quart_name)
                .on('click', function (_, d) {
                    clickedQuart(d, g, path)
                })
                .on('mouseover', function (d, i) {
                    d3.select(this).transition()
                        .duration('50')
                        .attr('fill', d.properties)
                })
                .on('mouseout', function (d, i) {
                    d3.select(this).transition()
                        .duration('50')
                        .attr('fill', 'transparent')
                });
        return g;
    }

    function clickedQuart(d, container, path) {
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

        let quartName = 'Namur'
        if(centered){
            quartName = d.properties.quart_name
        }
        document.getElementById('selection-name').innerHTML = quartName;

        container.select('#quart').selectAll('path')
            .classed('active', centered && function (d) { return d === centered })

        if (centered) {
            container.selectAll(`#bati :not(path[data-quart="${d.properties.quart_name}"])`)
                .style('display', 'none')
            container.selectAll(`#quart :not(path[data-quart="${d.properties.quart_name}"])`)
                .style('display', 'none')
            container.selectAll(`#bati path[data-quart="${d.properties.quart_name}"]`)
                .style('display', 'block')
            container.selectAll(`#quart path[data-quart="${d.properties.quart_name}"]`)
                .style('display', 'block')
        }

        container.transition()
            .duration(1000)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function () {
                if (!centered) {
                    container.selectAll('#bati path').style('display', 'block')
                    container.selectAll('#quart path').style('display', 'block')
                }
            })

    }


    /*
    .attr('stroke', d => {
        if(d.properties.rue_nom === 'Rue de Bruxelles' && d.properties.adr_nopol === '61'){
            console.log('hello')
            return '#000'
        }
        return 'none'
    })
    .attr('stroke-width', 4)
    */


    /*
    var width = 960
    var height = 500

    const svg = d3.select('#content').append('svg').attr('width', width).attr('height', height);

    var offset = [width / 2, height / 2];

    var projection = d3.geoMercator()
        .scale(1000)
        .center([1, 50])

    var path = d3.geoPath().projection(projection)

    var ds = JSON.parse(data);

    let group = svg.selectAll('g')
        .data(ds.features)
        .enter()
        .append('g')

    group.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', '#222')
    */
}


