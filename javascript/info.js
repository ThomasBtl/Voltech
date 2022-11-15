import { MAP } from "./map.js";

export const INFO = (function(){

    const infoWrapper = document.getElementsByClassName('info-wrapper')[0];

    const COLORS = {
        colorLevel: [
            getComputedStyle(document.documentElement).getPropertyValue('--critical'),
            getComputedStyle(document.documentElement).getPropertyValue('--bad'),
            getComputedStyle(document.documentElement).getPropertyValue('--medium'),
            getComputedStyle(document.documentElement).getPropertyValue('--good'),
            getComputedStyle(document.documentElement).getPropertyValue('--excelent'),
        ],
    }

    function resetInfo(){
        infoWrapper.innerHTML = '';
    }

    return {
        displayQuartRanking : function(districts){
            resetInfo()
            for(let district of districts.features){
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


                let powerRanking = document.createElement('div');
                powerRanking.innerHTML = `<p>${district.properties.ranking}</p>`;
                powerRanking.classList.add('ranking-number');
                powerRanking.style.borderColor = COLORS.colorLevel[district.properties.level - 1]
                powerRanking.style.backgroundColor = `${COLORS.colorLevel[district.properties.level - 1]}20`

                let districtNameElem = document.createElement('p');
                districtNameElem.innerHTML = district.properties.quart_name;

                mainElem.appendChild(powerRanking)
                mainElem.appendChild(districtNameElem)

                infoWrapper.appendChild(mainElem)
            }
        },
        resetInfo : resetInfo,
        displayDistrictInfo : function(district){

            const mainElem = document.createElement('div');

            const totalProd = document.createElement('p');
            totalProd.innerHTML = `potentiel : ${district.properties.quart_prod}kWh/an`
            const rankingVisuElem = document.createElement('div');
            rankingVisuElem.classList.add('district-ranking-level');
            const rankingDistrict = document.createElement('p');
            rankingDistrict.innerHTML = `ranking : ${district.properties.ranking}`;
            const co2totalsave = document.createElement('p');
            co2totalsave.innerHTML = `CO2 économisé : ${district.properties.co2save}`
        
            mainElem.appendChild(totalProd)
            mainElem.appendChild(rankingDistrict)
            mainElem.appendChild(rankingVisuElem)
            mainElem.appendChild(co2totalsave)

            resetInfo()

            infoWrapper.appendChild(mainElem)        
        }

    }
})()