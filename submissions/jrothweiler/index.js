const App = function() {

    let [currentPlanet, setCurrentPlanet] = React.useState(null);
    let [tableRowData, setTableRowData] = React.useState([null, null, null, null, null]);
    let requestAbortController = React.useRef(new AbortController());
    let currentUrl = React.useRef('http://localhost:3000/dark-jedis/5105')
    let currentUrlUp = React.useRef('http://localhost:3000/dark-jedis/2350')  
    let direction = React.useRef('down');
    let ws = React.useRef(null);
    let upBtnDisable = (currentUrlUp.current === null) || tableRowData.some(row => row !== null && row.homeworld.name === currentPlanet);
    let downBtnDisable = (currentUrl.current === null )|| tableRowData.some(row => row !== null && row.homeworld.name === currentPlanet);
    let upBtnClass = upBtnDisable ? "css-button-up css-button-disabled" : "css-button-up"
    let downBtnClass = downBtnDisable ? "css-button-down css-button-disabled" : "css-button-down"

    let fetchOnce = function(url) {
        return fetch(url, { signal: requestAbortController.current.signal }).then((response) => {
            return response.json();
        }).then((data) =>  {
            currentUrl.current = data.apprentice.url;
            if(tableRowData[0]){
                currentUrlUp.current = tableRowData[0].master.url;
            }
            
            setTableRowData(currentRows => {
                let newRowArray = []
                let firstNullIndex = currentRows.indexOf(null);
                currentRows.forEach((row, inx) => {
                    if(inx === firstNullIndex) {
                        newRowArray.push(data);
                    } else {
                        newRowArray.push(row);
                    }
                    
                    
                })
                //newRowArray.push(data);
                return newRowArray;
            })
        })
    }

    let fetchOnceUp = function(url) {
        return fetch(url, { signal: requestAbortController.current.signal }).then((response) => {
            return response.json();
        }).then((data) =>  {
            currentUrlUp.current = data.master.url;
            currentUrl.current = tableRowData[4].apprentice.url;
            setTableRowData(currentRows => {
                let newRowArray = []
                let lastNullIndex = currentRows.lastIndexOf(null);
                currentRows.forEach((row, inx) => {
                    if(inx === lastNullIndex) {
                        newRowArray.push(data);
                    } else {
                        newRowArray.push(row);
                    }
                    //newRowArray.push(row);
                })
                //newRowArray.unshift(data);
                return newRowArray;
            })
        })
    }

    React.useEffect(() => {
        let currentPlanetFound = tableRowData.some(row => row !== null && row.homeworld.name === currentPlanet);
        if (currentPlanetFound) {
            requestAbortController.current.abort()
        }
        else if (!currentPlanetFound && tableRowData.indexOf(null) !== -1 && currentUrl.current !== null&&direction.current ==='down') {
            fetchOnce(currentUrl.current)
        }else if(!currentPlanetFound && tableRowData.indexOf(null) !== -1 && currentUrlUp.current !== null&&direction.current ==='up'){
            fetchOnceUp(currentUrlUp.current);
        }
    }, [tableRowData]);

    React.useEffect(() => {
        ws.current = new WebSocket('ws://localhost:4000');

        ws.current.onopen = () => console.log("Socket open");

        ws.current.onmessage = function(message) {
            setCurrentPlanet(JSON.parse(message.data).name);
        }

        return () => {
            ws.current.close(1000, "Work complete");
        }
    }, []);

    let handleDownScroll = () => {
        direction.current= 'down';
        setTableRowData((previousRows) => [...previousRows.slice(2), null, null]);
    };
    
    let handleUpScroll = () =>{
        direction.current= 'up';
        
        setTableRowData((previousRows) => [null, null, ...previousRows.splice(0,3)]);
    }
    const children = tableRowData.map((data, idx) =>{
        if(data===null){
            return <li className="css-slot"/>
                    
                  
        }else {
            let currentPlanetCssClass = currentPlanet === data.homeworld.name ? "css-slot currentPlanet" : "css-slot"
            return <li className={currentPlanetCssClass} key={data.name}>
                    <h3>{data.name}</h3>
                    <h6>Homeworld: {data.homeworld.name}</h6>
                   </li>
        }
        
        
    })
    return <div class="app-container">
    <div class="css-root">
<h1 class="css-planet-monitor">Obi-Wan currently on {currentPlanet}</h1>
  
      <section class="css-scrollable-list">
        <ul class="css-slots">
          {children}
        </ul>
  
        <div class="css-scroll-buttons">
          <button class={upBtnClass} onClick={handleUpScroll} disabled={upBtnDisable}></button>
          <button class={downBtnClass} onClick={handleDownScroll} disabled={downBtnDisable}></button>
        </div>
      </section>
    </div>
  </div>
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);


