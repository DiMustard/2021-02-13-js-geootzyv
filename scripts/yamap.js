class YaMap {
    constructor(onClick, getContent, balloonBlank) {
        this.onClick = onClick;
        this.getContent = getContent;
        this.balloonBlank = balloonBlank;
        this.newCoords;

        this.localS = new LocalStorage();
    }



    async init() {
        await new Promise(resolve => ymaps.ready(resolve));
        this.initMap();
    }



    openBalloon(coords, content) {
        this.map.balloon.open(coords, content);
    }

    closeBalloon() {
        this.map.balloon.close();
    }



    createPlacemark(coords) {
        if (coords) this.newCoords = coords;

        let newMarker = new ymaps.Placemark(this.newCoords, {
            balloonContent: `${this.getContent(this.newCoords)}`
        }, {
            iconLayout: "default#image",
            iconImageHref: "images/marker.svg",
            iconImageSize: [64, 64],
            iconImageOffset: [-32, -64]
        });

        myObjects.push(newMarker);
        this.map.geoObjects.add(newMarker);
        this.map.clusterer.add(myObjects);
    }


    // deletePlacemark(placemark) {
    //     console.log(this.map.geoObjects);
    //     console.log(this.map.clusterer);
    // }


    initMap() {
        this.map = new ymaps.Map("map", {
            center: [56.852676, 53.206891],
            zoom: 14,
            controls: []
        });


        this.map.events.add("click", e => {
            if (this.map.balloon.isOpen()) {
                this.closeBalloon();
                // document.querySelector("#map").classList.toggle("blackout");

            } else {
                this.newCoords = e.get("coords");
                this.onClick(this.newCoords);
                // document.querySelector("#map").classList.toggle("blackout");
            }
        });


        this.map.clusterer = new ymaps.Clusterer({
            gridSize: 100,
            groupByCoordinates: false,
            clusterBalloonMaxHeight: 360,
            clusterIconColor: "#FF5722",
            clusterDisableClickZoom: true,
            clusterOpenBalloonOnClick: true,
            clusterBalloonContentLayout: ymaps.templateLayoutFactory.createClass(this.balloonBlank)
        });
        this.map.geoObjects.add(this.map.clusterer);
        this.map.clusterer.add(myObjects);


        this.map.geoObjects.events.add("click", e => {
            this.newCoords = e.get("target").geometry.getCoordinates();
            let newCluster = e.get("target").properties._data.geoObjects;
            if (this.map.balloon.isOpen()) this.closeBalloon();

            if (newCluster) {
                let coordsCluster = [];
                newCluster.forEach(mark =>
                    coordsCluster.push(mark.geometry.getCoordinates()));
                // this.onClick(e.get("target").geometry.getCoordinates(), coordsCluster);
                this.map.clusterer.options.set("clusterBalloonContentLayout",
                    ymaps.templateLayoutFactory.createClass(this.getContent(coordsCluster)))

            } else {
                // this.onClick(this.newCoords);
            }
        });
        // this.map.clusterer.events.add("click", e => {});
    }
}