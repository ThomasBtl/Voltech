import { MAP } from "./map.js";
import model from '../model_result.json' assert {type: 'json'};

export const INFO = (function () {

    let userRoofSuperficy = 100;

    const infoWrapper = document.getElementsByClassName('info-wrapper')[0];

    const KWH_PRICE = 0.3377;
    const MODEL_PROD = parseFloat(model.production).toFixed(2)
    const PANEL_SIZE = 2

    const COLORS = {
        colorLevel: [
            getComputedStyle(document.documentElement).getPropertyValue('--critical'),
            getComputedStyle(document.documentElement).getPropertyValue('--bad'),
            getComputedStyle(document.documentElement).getPropertyValue('--medium'),
            getComputedStyle(document.documentElement).getPropertyValue('--good'),
            getComputedStyle(document.documentElement).getPropertyValue('--excelent'),
        ],
    }

    const LEVEL_TEXT = {
        '1': 'très faible',
        '2': 'faible',
        '3': 'moyen',
        '4': 'assez élevé',
        '5': 'élevé'
    }

    const sortedMapping = {
        'solar' : 'quart_prod',
        'eco' : 'mean_spare_co'
    }

    function resetInfo() {
        infoWrapper.innerHTML = '';
        infoWrapper.innerHTML = `<div id="info-graph"></div>`;
    }

    function resetView(){
        let view = document.querySelector('.info-view')
        if(view){
            view.remove();
        }
    }

    function getPowerRankingElement(ranking, level) {
        let powerRanking = document.createElement('div');
        powerRanking.innerHTML = `<p>${ranking}</p>`;
        powerRanking.classList.add('ranking-number');
        powerRanking.style.borderColor = COLORS.colorLevel[level - 1];
        powerRanking.style.backgroundColor = `${COLORS.colorLevel[level - 1]}20`;
        return powerRanking;
    }

    function createInfoBox(t, value, unit, type, districtName){
        const title = document.createElement('div')
        title.classList.add('info-section')
        const titleText = document.createElement('p')
        titleText.innerHTML = t;
        title.appendChild(titleText)
        
        const content = document.createElement('div');
        content.classList.add('content-info', type)
        const contentValue = document.createElement('p');
        if(type === 'amortization' && value < 0){
            value = 'Jamais';
            unit = '';
        }
        contentValue.innerHTML = `<span class='box-value'>${value}</span> ${unit}`;
        if(districtName !== ''){
            const contentCompVersion = document.createElement('button');
            contentCompVersion.onclick = () => {
    
                d3.selectAll('.info-graph').remove()
    
                let sortedDistricts = MAP.sortDistrict(sortedMapping[type])
                let x = []
                let y = []
                let l = []
    
                for(let d of sortedDistricts.features){
                    x.push(d.properties.quart_name)
                    y.push(parseFloat(d.properties[sortedMapping[type]]).toFixed(2))
                    l.push(d.properties.level)
                }
    
                const chart = createChart({
                    x : x,
                    y : y,
                    level : l
                }, districtName)
    
                infoWrapper.appendChild(chart)
            }
            contentCompVersion.innerHTML = 'Vision Comparative'
            content.appendChild(contentCompVersion)
        }
        
        content.appendChild(contentValue)

        return [title, content]
    }

    function createChart(data, selectedDistrict){

        const meanValue = data.y.reduce((acc, y) => acc + parseFloat(y), 0)/data.y.length;

        const margin = { top: 10, right: 30, bottom: 20, left: 50 }
        const width = 400 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const infoGraphWrapper = document.createElement('div');
        infoGraphWrapper.classList.add('info-graph')
        const graphSvg = d3.select(infoGraphWrapper)
            .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append('g')
                .attr("transform", `translate(${margin.left},${margin.top})`)

        const x = d3.scaleOrdinal()
            /* .domain(districts.features.map(d => d.properties.quart_name)) */
            .domain(data.x)
            .range(data.x.map((_, i) => i * (width/data.x.length)))
        graphSvg.append('g')
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
            .selectAll('text')
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start")
                .style('display', 'none');

        const y = d3.scaleLinear()
            .domain([Math.min(...data.y) - 3, Math.max(...data.y) + 3])
            .range([height, 0])
        graphSvg.append('g')
            .call(d3.axisLeft(y));

        const line = graphSvg.append('g')
            .attr('transform', `translate(0, ${y(meanValue)})`)
        line.append('line')
            .attr('x2', width)
            .attr('stroke', 'white')
            .style('stroke-width', '2px');
        line.append('text')
            .attr('transform', `translate(${width - 40}, 15)`)
            .text('mean')
            .classed('reference-text', true)

        const zip = (...arr) => Array(Math.max(...arr.map(a => a.length))).fill().map((_,i) => arr.map(a => a[i]));  

        graphSvg.append('path')
            .datum(zip(data.x, data.y))
            .attr('stroke', 'white')
            .attr('fill', 'none')
            .attr('d', d3.line()
                .x(d => x(d[0]))
                .y(d => y(d[1]))    
            )


        graphSvg.append('g')
            .selectAll('dot')
            .data(zip(data.x, data.y, data.level))
            .join('circle')
                .attr("cx", d => x(d[0]))
                .attr("cy", d => y(d[1]))
                .attr("r", 3)
                .attr("fill", d => COLORS.colorLevel[d[2] - 1])
                .attr('stroke', d => {
                    if(d[0] === selectedDistrict){
                        return 'black'
                    }
                })
                .attr('stroke-width', d => {
                    if(d[0] === selectedDistrict){
                        return 2
                    }
                })

        return infoGraphWrapper;
    }

    function getAmortization(nPanel, pot){
        let cout_installation = getPosePrice(nPanel)
        let economie = pot * KWH_PRICE
        return Math.ceil(cout_installation / economie)
    }

    function getPosePrice(nPanel){
        let tarif_prosumer = ((300*nPanel)/1000)*78.62
        let taxe_first_year = tarif_prosumer - ((tarif_prosumer / 100)*54.27)
        return parseFloat(300*nPanel + 1500 + taxe_first_year).toFixed(2)
    }

    function theoView(building){

        resetView()

        const view = document.createElement('div');
        view.classList.add('info-view')

        const potentialSection = document.createElement('div');
        const ecologySection = document.createElement('div');
        const priceSection = document.createElement('div');
        const amortizationSection = document.createElement('div');

        // Pot box
        const contentValueWrapper = document.createElement('div')
        contentValueWrapper.classList.add('content-value-wrapper');

        const potentialValue = parseFloat(building.properties.annual_prod).toFixed(2);
        const [titlePot, boxPot] = createInfoBox('Potentiel généré', potentialValue, 'kWh/an', 'solar', '')

        potentialSection.appendChild(titlePot)
        potentialSection.appendChild(boxPot)

        // Eco Box
        const ecoValue = parseFloat(building.properties.spare_co2).toFixed(2);
        const [titleEco, boxEco] = createInfoBox('CO2 économisé', ecoValue, 'CO2/an', 'eco', '')

        ecologySection.appendChild(titleEco)
        ecologySection.appendChild(boxEco)

        // Price box
        const priceValue = getPosePrice(building.properties.roof_superficy / PANEL_SIZE)
        const [titlePrix, boxPrice] = createInfoBox('Prix de la pose', priceValue, '€', 'price', '')

        priceSection.appendChild(titlePrix)
        priceSection.appendChild(boxPrice)

        // amortization box
        let nbPanels = Math.floor(building.properties.roof_superficy / PANEL_SIZE)
        const amortizationValue = getAmortization(nbPanels, potentialValue)
        const [titleamortization, boxamortization] = createInfoBox('Amorti dans ±', amortizationValue, 'an(s)', 'amortization', '')

        amortizationSection.appendChild(titleamortization)
        amortizationSection.appendChild(boxamortization)

        
        contentValueWrapper.appendChild(potentialSection)
        contentValueWrapper.appendChild(ecologySection)
        contentValueWrapper.appendChild(priceSection)
        contentValueWrapper.appendChild(amortizationSection)

        view.appendChild(contentValueWrapper)
        return view
    }

    function modelView(){

        resetView()

        const view = document.createElement('div');
        view.classList.add('info-view')

        const potentialSection = document.createElement('div');
        const ecologySection = document.createElement('div');
        const priceSection = document.createElement('div');
        const amortizationSection = document.createElement('div');

        // Pot box
        const contentValueWrapper = document.createElement('div')
        contentValueWrapper.classList.add('content-value-wrapper');

        const potentialValue = 0;
        const [titlePot, boxPot] = createInfoBox('Potentiel généré', potentialValue, 'kWh/an', 'solar', '')

        potentialSection.appendChild(titlePot)
        potentialSection.appendChild(boxPot)

        // Price box
        const priceValue = 0;
        const [titlePrix, boxPrice] = createInfoBox('Prix de la pose', priceValue, '€', 'price', '')

        priceSection.appendChild(titlePrix)
        priceSection.appendChild(boxPrice)

        // amortization box
        const amortizationValue = -1;
        const [titleamortization, boxamortization] = createInfoBox('Amorti dans', amortizationValue, 'an(s)', 'amortization', '')

        amortizationSection.appendChild(titleamortization)
        amortizationSection.appendChild(boxamortization)

        // Increase number of solar pannel
        const nbPanelSelection = document.createElement('div');
        nbPanelSelection.classList.add('nb-panels-selection')
        const nbPanels = document.createElement('input');
        const nbPanelsLabel = document.createElement('label')
        nbPanels.type = 'number';
        nbPanels.id = 'nbPanels';
        nbPanelsLabel.for = 'nbPanels'
        nbPanelsLabel.innerHTML = 'nombre de panneaux'
        nbPanels.value = 0;
       
        nbPanels.onchange = (e) => {
            let newNbPanel = e.target.value;

            if(newNbPanel < 0){
                e.target.value = 0;
                newNbPanel = 0
            }

            const maxPanel = Math.floor(userRoofSuperficy / PANEL_SIZE)
            if(newNbPanel >= maxPanel){
                e.target.value = maxPanel;
                newNbPanel = maxPanel
            }
            

            boxPot.querySelector('.box-value').innerHTML = parseFloat(newNbPanel * MODEL_PROD).toFixed(2);
            boxPrice.querySelector('.box-value').innerHTML = getPosePrice(newNbPanel)

            let amortizationValue = getAmortization(newNbPanel, newNbPanel * MODEL_PROD)
            if(amortizationValue <= 0){
                amortizationValue = 'jamais'
            }
            else{
                amortizationValue = `${amortizationValue} an(s)`
            }
            boxamortization.querySelector('.box-value').innerHTML = amortizationValue
        
        }

        nbPanelSelection.appendChild(nbPanelsLabel)
        nbPanelSelection.appendChild(nbPanels)
        
        contentValueWrapper.appendChild(potentialSection)
        contentValueWrapper.appendChild(ecologySection)
        contentValueWrapper.appendChild(priceSection)
        contentValueWrapper.appendChild(amortizationSection)

        view.appendChild(nbPanelSelection)
        view.appendChild(contentValueWrapper)

        return view
        
    }

    return {
        setRoofSuperficy: function(s){
            userRoofSuperficy = s;
        },
        superficy: userRoofSuperficy,
        displayQuartRanking: function (districts) {
            resetInfo()
            for (let district of districts.features) {
                let mainElem = document.createElement('div');
                mainElem.classList.add('power-ranking-elem')
                mainElem.onmouseover = () => {
                    const mapDistrict = d3.select(`g[data-quart="${district.properties.quart_name}"]`)
                    mapDistrict.transition()
                        .duration('50')
                        .style('opacity', '0.75')
                }
                mainElem.onmouseout = () => {
                    const mapDistrict = d3.select(`g[data-quart="${district.properties.quart_name}"]`)
                    mapDistrict.transition()
                        .duration('50')
                        .style('opacity', '1')
                }
                mainElem.onclick = () => {
                    MAP.clickDistrict(district, MAP.path())
                }


                let powerRanking = getPowerRankingElement(district.properties.ranking, district.properties.level);

                let districtNameElem = document.createElement('p');
                districtNameElem.innerHTML = district.properties.quart_name;

                mainElem.appendChild(powerRanking)
                mainElem.appendChild(districtNameElem)

                infoWrapper.appendChild(mainElem)
            }
        },
        resetInfo: resetInfo,
        displayDistrictInfo: function (district) {

            resetInfo();

            const districtName = district.properties.quart_name;
            const mainElem = document.createElement('div');

            // Create section wrapper
            const rankingSection = document.createElement('div');
            const potentialSection = document.createElement('div');
            const ecologySection = document.createElement('div');

            // populate ranking section
            const ranking = district.properties.ranking;
            const level = district.properties.level;
            const powerRankingCircle = getPowerRankingElement(ranking, level);
            powerRankingCircle.style.width = '100px';
            powerRankingCircle.style.height = '70px';
            powerRankingCircle.style.fontSize = '1.4em';

            const levelText = LEVEL_TEXT[level];
            const rankingTextElem = document.createElement('p');
            rankingTextElem.innerHTML = `Ce quartier possède un potentiel photovoltaïque <span class="vip">${levelText}</span>.`

            rankingSection.appendChild(powerRankingCircle);
            rankingSection.appendChild(rankingTextElem);
            rankingSection.classList.add('info-section', 'district-ranking-section');

            // Populate potential section
            const contentValueWrapper = document.createElement('div')
            contentValueWrapper.classList.add('content-value-wrapper');

            const potentialValue = parseFloat(district.properties.quart_prod).toFixed(2);
            const [titlePot, boxPot] = createInfoBox('Potentiel généré', potentialValue, 'kWh/an', 'solar', districtName)

            // Add potential graph

            potentialSection.appendChild(titlePot)
            potentialSection.appendChild(boxPot)

            // Populate ecology section

            const ecoValue = parseFloat(district.properties.mean_spare_co).toFixed(2);
            const [titleEco, boxEco] = createInfoBox('CO2 économisé', ecoValue, 'CO2/an', 'eco', districtName)

            ecologySection.appendChild(titleEco)
            ecologySection.appendChild(boxEco)

            // Add elements
            contentValueWrapper.appendChild(potentialSection)
            contentValueWrapper.appendChild(ecologySection)
            mainElem.appendChild(rankingSection)

            infoWrapper.appendChild(mainElem)
            infoWrapper.appendChild(contentValueWrapper)
        },
        displayInfoBuilding : function(building){

            resetInfo();

            const menuWrapper = document.createElement('div');
            menuWrapper.classList.add('menu-selector')
            const menuTheoric = document.createElement('p');
            menuTheoric.innerHTML = 'Estimation Théorique';
            const menuModel = document.createElement('p');
            menuModel.innerHTML = 'Estimation Personnalisée';

            menuTheoric.onclick = () => {
                document.getElementsByClassName('content-value-wrapper')[0].remove()
                document.querySelector('.nb-panels-selection').remove()
                infoWrapper.appendChild(theoView(building));
            }

            menuModel.onclick = () => {
                document.getElementsByClassName('content-value-wrapper')[0].remove()
                infoWrapper.appendChild(modelView(building))
            }

            menuWrapper.appendChild(menuTheoric)
            menuWrapper.appendChild(menuModel)
            infoWrapper.appendChild(menuWrapper)
            infoWrapper.appendChild(theoView(building));
        }
    }
})()