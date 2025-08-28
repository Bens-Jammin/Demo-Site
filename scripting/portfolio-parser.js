
let loaded_code_portfolio = null;
let loaded_bass_portfolio = null;


async function load_selector_with_bands() {
    let manifest = "../portfolios/bass.json";
    let response = await fetch(manifest);

    // Fix: response.ok is a property, not a method
    if (!response.ok) {
        throw new Error(`Error fetching bass portfolio: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();

    let unique_bands = '<select class="filter" id="filterby-tags" onchange="filter_bass_portfolio(event, \'bands\')">';
    let unique_band_list = [];
    for (let entry of data) {
        if (!unique_band_list.includes(entry.band)) { 
            unique_band_list.push(entry.band); 
            unique_bands += "<option>"+entry.band+"</option>";
        } 
    }
    unique_bands += "</select>";

    console.log(unique_bands);
    document.getElementById("band-selector").innerHTML = unique_bands;
}

async function load_code_portfolio() {
    try {
        let data = null; 
        if (loaded_code_portfolio !== null) { data = loaded_code_portfolio } // use pre-loaded data
        else {
            let manifest = "../portfolios/code.json";
            let response = await fetch(manifest);
            
            // Fix: response.ok is a property, not a method
            if (!response.ok) {
                throw new Error(`Error fetching code porfolio: ${response.status} ${response.statusText}`);
            }
            
            data = await response.json();
        }
        

        let counter = 0;
        let container = [ "" , "" , "" ];  
        for (let obj of data) {
            // NOTE: target:"_blank" opens a new page , rel="noopener" does : 
            // "instructs the browser to navigate to the target resource without granting 
            // the new browsing context access to the document that opened it" 
            // (see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/noopener)
            if (obj["link"] == "") {
                container[ counter++ % 3 ] += `
                    <div class="portfolio-entry">
                        <h2>${obj["title"]}</h2>
                        <i><h4>${obj["languages"].join(", ")}</h4></i>
                        <span class="tag" data-type="${obj["tag"]}"></span>
                        <br>
                        <i style="display: flex; justify-content:center;">
                        </i>
                    </div>`;
            } else {
                container[ counter++ % 3 ] += `
                    <a href="${obj["link"]}" target="_blank" rel="noopener" class="portfolio-link">
                    <div class="portfolio-entry">
                        <h2>${obj["title"]}</h2>
                        <i><h4>${obj["languages"].join(", ")}</h4></i>
                        <span class="tag" data-type="${obj["tag"]}"></span>
                        <br>
                        <i style="display: flex; justify-content:center;">
                        </i>
                    </div></a>`;    
                } 
            }
        document.getElementById('col-1').innerHTML = container[0]
        document.getElementById('col-2').innerHTML = container[1]
        document.getElementById('col-3').innerHTML = container[2]
        loaded_code_portfolio = data;
        
    } catch (err) {
        console.error('Error when loading bass portfolio:', err);
        // Return null instead of undefined when there's an error
        return null;
    }
}


async function filter_code_portfolio(event, type) {
    console.log(event.target.value);
    // clear the current filter setting, that way the data needs to be loaded, hence getting all the data
    // Also so it doesn't look weird when one is filtering but the other is set to 'all', set all selectors to 'all'...
    if (event.target.value === "All") { 
        loaded_code_portfolio = null; 
        load_code_portfolio(); 
        document.getElementById('filterby-tags').value = 'All';
        document.getElementById('filterby-languages').value = 'All';
        return;
    }

    let manifest = "../portfolios/code.json";
    let response = await fetch(manifest);
    let filtered_porfolio = []

    // Fix: response.ok is a property, not a method
    if (!response.ok) {
    throw new Error(`Error fetching code porfolio: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();
    console.log(data)
    if (type === "tags") {
        switch (event.target.value) {
                                                                // need to ensure its a lowercase val here 
            case "Deployed":    { for (let entry of data) { if (entry.tag === "deployed")    {filtered_porfolio.push(entry)} } break; }
            case "Progressing": { for (let entry of data) { if (entry.tag === "progressing") {filtered_porfolio.push(entry)} } break; }
            case "Delayed":     { for (let entry of data) { if (entry.tag === "delayed")     {filtered_porfolio.push(entry)} } break; }
            case "Secondary":   { for (let entry of data) { if (entry.tag === "secondary")   {filtered_porfolio.push(entry)} } break; }
            case "Deprecated":  { for (let entry of data) { if (entry.tag === "deprecated")  {filtered_porfolio.push(entry)} } break; }
            case "Misc":        { for (let entry of data) { if (entry.tag === "misc")        {filtered_porfolio.push(entry)} } break; }
        }
    } else if (type === "languages") {

        function languages_contains(langs, lang) {
            for (let l of langs ) {
                if (l === lang) { return true; }
            }
            return false;
        }
        let i = 0
        switch (event.target.value) {
                                                                // need to ensure its a lowercase val here 
            case "C":          { for (let entry of data) { if (languages_contains(entry.languages, "C")          ) filtered_porfolio.push(entry) } break;  }
            case "CSS":        { for (let entry of data) { if (languages_contains(entry.languages, "CSS")        ) filtered_porfolio.push(entry) } break;  }
            case "HTML":       { for (let entry of data) { if (languages_contains(entry.languages, "HTML")       ) filtered_porfolio.push(entry) } break;  }
            case "JS":         { for (let entry of data) { if (languages_contains(entry.languages, "JS")         ) filtered_porfolio.push(entry) } break;  }
            case "Powershell": { for (let entry of data) { if (languages_contains(entry.languages, "Powershell") ) filtered_porfolio.push(entry) } break;  }
            case "Python":     { for (let entry of data) { if (languages_contains(entry.languages, "Python")     ) filtered_porfolio.push(entry) } break;  }
            case "Rust":       { for (let entry of data) { if (languages_contains(entry.languages, "Rust")       ) filtered_porfolio.push(entry) } break;  }
        }
        i = 0;
    }
    loaded_code_portfolio = filtered_porfolio;
    load_code_portfolio()
}

function sort_code_portfolio(method) {
    if (method === "tags") {
        loaded_code_portfolio.sort( (a, b) => 
            a.tag > b.tag ? 1 : a.tag < b.tag ? -1 : 0
        )
    } else { // method === "name"
        loaded_code_portfolio.sort( (a, b) => 
            a.title > b.title ? 1 : a.title < b.title ? -1 : 0
        )
    }
    load_code_portfolio()
}



async function load_bass_portfolio() {
    try {
        let data = null; 
        if (loaded_bass_portfolio !== null) { data = loaded_bass_portfolio } // use pre-loaded data
        else {
            let manifest = "../portfolios/bass.json";
            let response = await fetch(manifest);
            
            // Fix: response.ok is a property, not a method
            if (!response.ok) {
                throw new Error(`Error fetching bass porfolio: ${response.status} ${response.statusText}`);
            }
            
            data = await response.json();
        }
        
        console.log("loading porfolio");
        let counter = 0;
        let container = [ "" , "" , "" ];  
        for (let obj of data) {
            container[ counter++ % 3 ] += `
                <div class="portfolio-entry">
                    <h2>${obj["title"]}</h2>
                    <i><h4>${obj["band"]}</h4></i>
                    <span class="tag" data-type="${obj["tag"]}"></span>
                    <br>
                    <i style="display: flex; justify-content:center;">
                    </i>
                </div>`;
        } 
        document.getElementById('col-1').innerHTML = container[0]
        document.getElementById('col-2').innerHTML = container[1]
        document.getElementById('col-3').innerHTML = container[2]
        loaded_bass_portfolio = data;

    } catch (err) {
        console.error('Error when loading bass portfolio:', err);
        // Return null instead of undefined when there's an error
        return null;
    }
}

async function filter_bass_portfolio(event, type) {
    console.log(event.target.value);
    // clear the current filter setting, that way the data needs to be loaded, hence getting all the data
    // Also so it doesn't look weird when one is filtering but the other is set to 'all', set all selectors to 'all'...
    if (event.target.value === "All") { 
        loaded_bass_portfolio = null; 
        load_bass_portfolio(); 
        // document.getElementById('filterby-tags').value = 'All';
        // document.getElementById('filterby-languages').value = 'All';
        return;
    }

    let manifest = "../portfolios/bass.json";
    let response = await fetch(manifest);
    let filtered_porfolio = []

    // Fix: response.ok is a property, not a method
    if (!response.ok) { throw new Error(`Error fetching bass porfolio: ${response.status} ${response.statusText}`); }

    let data = await response.json();
    console.log(data)
    if (type === "tags") {
        switch (event.target.value) {
                                                                // need to ensure its a lowercase val here 
            case "Deployed":    { for (let entry of data) { if (entry.tag === "deployed")    {filtered_porfolio.push(entry)} } break; }
            case "Progressing": { for (let entry of data) { if (entry.tag === "progressing") {filtered_porfolio.push(entry)} } break; }
            case "Delayed":     { for (let entry of data) { if (entry.tag === "delayed")     {filtered_porfolio.push(entry)} } break; }
            case "Secondary":   { for (let entry of data) { if (entry.tag === "secondary")   {filtered_porfolio.push(entry)} } break; }
            case "Deprecated":  { for (let entry of data) { if (entry.tag === "deprecated")  {filtered_porfolio.push(entry)} } break; }
            case "Misc":        { for (let entry of data) { if (entry.tag === "misc")        {filtered_porfolio.push(entry)} } break; }
        }
    // } else if (type === "bands") {
    //     let i = 0
    //     switch (event.target.value) {
        
    //     }
    }
    loaded_bass_portfolio = filtered_porfolio;
    load_bass_portfolio()
}

function sort_bass_portfolio(method) {
    if (method === "tags") {
        loaded_bass_portfolio.sort( (a, b) => 
            a.tag > b.tag ? 1 : a.tag < b.tag ? -1 : 0
        )
    } else if (method === "bands") {
        loaded_bass_portfolio.sort( (a, b) => 
            a.band > b.band ? 1 : a.band < b.band ? -1 : 0
        )
    }
    else { // method === "name"
        loaded_bass_portfolio.sort( (a, b) => 
            a.title > b.title ? 1 : a.title < b.title ? -1 : 0
        )
    }
    load_bass_portfolio()
}
