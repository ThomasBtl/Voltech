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

    return {
        displayQuartRanking : function(districts){
            console.log(MAP.path())
            for(let district of districts.features){
                let mainElem = document.createElement('div');
                mainElem.classList.add('power-ranking-elem')
                mainElem.onmouseover = () => {
                    const mapDistrict = d3.select(`path[data-quart="${district.properties.quart_name}"]`)
                    mapDistrict.transition()
                        .duration('50')
                        .style('opacity', '0.75')
                }
                mainElem.onmouseout = () => {
                    const mapDistrict = d3.select(`path[data-quart="${district.properties.quart_name}"]`)
                    mapDistrict.transition()
                        .duration('50')
                        .style('opacity', '1')
                }
                mainElem.onclick = () => {
                    MAP.clickDistrict(district, d3.select('#district'), MAP.path())
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
        resetInfo : function(){
            infoWrapper.innerHTML = '';
        }

    }
})()