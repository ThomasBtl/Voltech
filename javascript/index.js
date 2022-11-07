import { getDataFromFile } from "./service.js";

const WIDTH = 700
const HEIGHT = 500
let centered;

window.onload = function () {


    [...document.getElementsByClassName('menu')].forEach(elem => {
        elem.onclick = (e) => {
            let selectedElem = document.getElementsByClassName('selected')[0];
            let isFirst = selectedElem === document.getElementsByClassName('menu')[0]
            console.log(isFirst)
            if(isFirst && selectedElem !== e.target){
                let menuBar = document.getElementsByClassName('menu-bottom-border')[0];
                let leftOffset = parseInt(menuBar.style.left.match(/\d*/));
                menuBar.style.left = `${leftOffset + 200}px`
            }
            else{
                if(!isFirst && selectedElem !== e.target){
                    let menuBar = document.getElementsByClassName('menu-bottom-border')[0];
                    let leftOffset = parseInt(menuBar.style.left.match(/\d*/));
                    console.log(leftOffset)
                    menuBar.style.left = `${leftOffset - 200}px`
                }
            }
            selectedElem.classList.remove('selected');
            e.target.classList.add('selected')
        }
    });






    getDataFromFile('q').then(quartiersData => {
        getDataFromFile('b').then(batiData => {
            console.log(batiData)
            const svg = d3.select('#map').append('svg').attr('width', WIDTH).attr('height', HEIGHT);
            const g = svg.append('g');  
            let group = displayMainQuart(quartiersData, g)
            displayMainBati(batiData, group);

            /* var zoom = d3.zoom()
                .scaleExtent([1,8])
                .on('zoom', function(){
                    g.selectAll('path')
                        .attr('transform', d3.zoomTransform(this));
                });
            
            svg.call(zoom); */

        }).catch(err => {
            console.error(err);s
        });
        
    }).catch(err => {
        console.error(err);
    });

    function displayMainBati(featureCollection, container){
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

    function displayMainQuart(featureCollection, container){
        let projection = d3.geoMercator()
            .fitSize([WIDTH, HEIGHT], featureCollection)
        let path = d3.geoPath().projection(projection)

        const g = container.append('g').attr('id', 'quart');
        g.selectAll('path')
            .data(featureCollection.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'transparent')
            .attr('stroke', getComputedStyle(document.documentElement).getPropertyValue('--text'))
            .on('click', function(_, d){
                clickedQuart(d, g, path)
            })
        return g;
    }

    function clickedQuart(d, container, path){
        let x, y, k;

        if(d && centered !== d){
            let centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4
            centered = d;
        }
        else{
            x = WIDTH / 2;
            y = HEIGHT / 2;
            k = 1;
            centered = null;
        }

        container.select('#quart').selectAll('path')
            .classed('active', centered && function(d){return d === centered})
        
        if(centered){
            container.selectAll(`#bati :not(path[data-quart="${d.properties.quart_name}"])`)
                .style('display', 'none')
            container.selectAll(`#bati path[data-quart="${d.properties.quart_name}"]`)
                .style('display', 'block')
        }

        container.transition()
            .duration(1000)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function(){
                if(!centered){
                    container.selectAll('#bati path').style('display','block')
                }
            })

    }

    function selectLocality(data, container){

        let featureCollection = {type:'FeatureCollection', 'features':[data]}

        let projection = d3.geoMercator()
            .fitSize([WIDTH, HEIGHT], featureCollection)
        let path = d3.geoPath().projection(projection)

        container.selectAll('*').remove();
        const g = container.append('g').append('g');

        g.selectAll('path')
            .data(featureCollection.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', 'transparent')
            .attr('stroke', getComputedStyle(document.documentElement).getPropertyValue('--text'))

        console.log(data)           
        document.getElementById('selection-name').innerHTML = data.properties.quart_name;
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


