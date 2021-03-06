"use strict"

function homeApp(){
    let data = {
        branches : {},
        branch : {},
        branch_id: ""
    }

    let directionsDisplay;
    let directionsService = new google.maps.DirectionsService();
    let map;   
    let routesDisplays = [];
    
    setTimeout( ()=>{
        directionsDisplay = new google.maps.DirectionsRenderer();
        let bsas = {lat: -34.6037, lng: -58.3816};
        let mapOptions = {
            zoom: 12,
            center: bsas
        }
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        directionsDisplay.setMap(map);
    } , 100)

    function setGoogleMapsDisplays(){
        for (let branch of data.branches){
            routesDisplays[branch.id] = new google.maps.DirectionsRenderer();
            axios.get("api/branch/" + branch.id)
                .then(resp => {
                    branch = resp.data
                    const points = branch.stops.map( s => ({lat:s.latitude,lng:s.longitude, id : s.number}))
                    const waypoints =  points.slice(1, -1).map( p => ({ location : p , stopover : false}))

                    let request = {
                        origin: points[0],
                        destination: points[points.length - 1],
                        waypoints: waypoints,
                        optimizeWaypoints: false,   
                        travelMode: 'DRIVING'
                    };
                    
                    let color = colorById(branch.id)
                    branch.color = color;

                   /* document.getElementById(branch.id).style.background = color;
                    console.log(branch);*/

                    directionsService.route(request, function(result, status) {
                        if (status == 'OK') {
                            routesDisplays[branch.id].setMap(map);
                            routesDisplays[branch.id].setDirections(result);
                            routesDisplays[branch.id].setOptions({
                                suppressMarkers: true,
                                polylineOptions : {
                                    strokeColor : color,
                                    visible: true
                                }
                            })
                        } else {
                            console.error(response);
                        }
                    })                    
                })
                .catch((err)=>
                console.error(err.response)
            )
        }
    }

    function colorById(id){
        return "hsl(" + (id * 205) % 360 + ",100%,50%)";
    }

    function updateBranchsList(){
        axios.get("/api/branch")
            .then((resp)=>{
                data.branches = resp.data
                setGoogleMapsDisplays()
            })
            .catch((err)=>
                console.error(err)
            )
    }
    
    updateBranchsList() 

    new Vue({
        el: "#welcomeApp",
        data: data,
        methods : {
            updateBranchsList : updateBranchsList
        }
    })
}

window.addEventListener("load", function(){
    homeApp()
})