import { MAP } from "./map.js";
import { INFO } from "./info.js";

window.onload = function () {

    let displayQuart = true;

    // Setting up the right side menu
    [...document.getElementsByClassName('map-icon-selector')].forEach(elem => {
        elem.onclick = (e) => {
            function getSiblings(n){
                let siblings = []
                let parent = n.parentNode
                for(let child of [...parent.childNodes]){
                    if(child.nodeType === Node.ELEMENT_NODE && child !== n){
                        siblings.push(child)
                    }
                }
                return siblings;
            }
        

            let target = e.target;
            target.classList.toggle('current-icon');
            for(let sibling of getSiblings(target)){
                sibling.classList.toggle('current-icon')
            }

            let displayType = target.dataset.type;
            if(displayType === 'district'){
                MAP.displayGroup(MAP.types.DISTRICT)
            }
            else{
                MAP.displayGroup(MAP.types.BUILDING)
            }
        }
    });


    MAP.displayMap().then(([districtDataset, buildingDataset]) => {
        INFO.displayQuartRanking(MAP.sortDistrict('ranking'));
    });

}


