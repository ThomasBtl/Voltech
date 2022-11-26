import { MAP } from "./map.js";
import { INFO } from "./info.js";

window.onload = function () {

    document.querySelector('#consommationAnnuelle').value = INFO.conso;
    document.querySelector('#superficie').value = INFO.superficy;

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
            const currentTarget = document.getElementsByClassName('current-icon')[0]
            if(currentTarget !== target){
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
        }
    });

    document.querySelector('.cancel').onclick = () => {
        document.querySelector('#form').classList.add('hidden')
    }

    document.querySelector('.setting-box').onclick = () =>{
        document.querySelector('#form').classList.toggle('hidden')
    }

    document.querySelector('.btn-confirm').onclick = () => {
        let consoValue = parseInt(document.querySelector('#consommationAnnuelle').value);
        let superficyValue = parseInt(document.querySelector('#superficie').value);

        if(consoValue < 0){
            document.querySelector('#consommationAnnuelle').value = 0;
            consoValue = 0
        }

        if(superficyValue < 0){
            document.querySelector('#superficie').value = 0
            superficyValue = 0
        }

        INFO.setConso(consoValue)
        INFO.setRoofSuperficy(superficyValue)
    }


    const inputElem = document.getElementById('adr-input-box')
    inputElem.onkeyup = (e) => {
        if(e.key === 'Enter'){
            const value = e.target.value
            if(value !== ''){
                MAP.findAdr(value)
            }
        }
    }


    MAP.displayMap().then(() => {
        INFO.displayQuartRanking(MAP.sortDistrict('ranking'));
    });

}
