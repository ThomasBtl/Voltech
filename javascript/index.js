import { MAP } from "./map.js";
import { INFO } from "./info.js";

window.onload = function () {

    let displayQuart = true;

    // Setting up the right side menu

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
                MAP.displayGroup(MAP.types.BUILDING);
                INFO.resetInfo()
            }
            else {
                MAP.displayGroup(MAP.types.DISTRICT);
                INFO.displayQuartRanking();
            }

            selectedElem.classList.remove('selected');
            e.target.classList.add('selected')
        }
    });

    MAP.displayMap().then(([districtDataset, buildingDataset]) => {
        INFO.displayQuartRanking(districtDataset);
    });

}


