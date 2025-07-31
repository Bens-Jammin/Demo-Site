
document.addEventListener('DOMContentLoaded', () => parseNoteTree());






function onScroll() {
    const tocLinks = document.querySelectorAll("#toc a");
    const headers = Array.from(tocLinks).map(link => {
        const id = link.getAttribute('href').slice(1);

        return document.getElementById(id);
    })

    let activeIndex = headers.length - 1;
    
    for (let i = 0; i < headers.length; i++) {
        const rect = headers[i].getBoundingClientRect();
        if (rect.top > 0) {
            activeIndex = i === 0 ? 0 : i - 1;
            break;
        }
    }



    tocLinks.forEach(link => link.classList.remove('active'));
    tocLinks[activeIndex]?.classList.add('active');
    toc
}

window.addEventListener('scroll', onScroll);


async function parseNoteTree() {
    try {
        let html = "";

        let data = await manifest();

        let notesSection = document.getElementById('notes-list');

        // Check if data exists and is an object
        if (!data || typeof data !== 'object') {
            console.error('No valid data received from manifest');
            notesSection.innerHTML += '<p>Error: Could not load notes manifest</p>';
            return;

        }
       
        for (let [k, v] of Object.entries(data)) {
            if (!Array.isArray(v)) continue;

            html += `<details><summary><strong>${k}</strong></summary><ul>`;
            
            for (let note of v) {
                if (typeof note === 'object' && note !== null) { 
                    let entries = Object.entries(note);
                    if (entries.length === 0) continue;

                    let [directoryName, subdirectory] = entries[0];
                    if (typeof subdirectory === 'string') {
                        subdirectory = subdirectory.split(',');
                    } else if (!Array.isArray(subdirectory)) {
                        continue;
                    }

                    html += `<details><summary><strong>${directoryName}</strong></summary><ul>`;
                    for (let subnote of subdirectory) {
                        html += `<li class="note" id="${k}/${directoryName}/${subnote}">${subnote.replace(".md", "")}</li>`;
                    }
                    html += "</ul></details>";
                } else {
                    html += `<li class="note" id="${k}/${note}">${note.replace(".md", "")}</li>`;
                }
            }

            html += "</ul></details>";
        }

        html += "</ul>";
        notesSection.innerHTML += html;

        document.querySelectorAll(".note").forEach((item) => {
            item.addEventListener("click", async () => {
                try {
                    const path = `./notes/${item.id}`.replace(/ /g, '%20'); // replace spaces with the space symbol
                    
                    
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`Error fetching note: ${response.status} ${response.statusText}`);
                    }
                    
                    const markdownText = await response.text();
                    const output = marked.parse(markdownText);

                    let styledOutput = addStyling(output);
                    
                    let htmlOutput = ""
                    if (styledOutput === "") {
                        htmlOutput = "<h1>Your file is Empty!</h1><p>The contents of your markdown file will appear here once you add text to it...</p>"
                    } else {
                        htmlOutput = styledOutput + '<br><hr><br><span class="centerer"><button type="button" class="download">Download Open Note (inactive)</button></span>'
                    }


                    if (htmlOutput !== "") { 
                        document.getElementById("note-display").style = "border: var(--border-width) solid var(--borders);";
                    
                        // add content to the table of contents panel
                        let toc = document.getElementById("toc");
                        toc.innerHTML = tableOfContents(htmlOutput);
                    }
                    document.getElementById("note-display").innerHTML = htmlOutput;
                } catch (err) {
                    console.error('Error loading note:', err);
                    document.getElementById("note-display").innerHTML = '<p>Error loading note content: '+err+' for '+path+'</p>';
                }
            });
        });

    } catch (err) {
        console.error('Error parsing note tree:', err);
        notesSection.innerHTML += '<p>Error loading notes: '+err+'</p>';
    }
}

async function manifest() {
    try {
        let manifest = "./notes/manifest.json";
        let response = await fetch(manifest);
        
        // Fix: response.ok is a property, not a method
        if (!response.ok) {
            throw new Error(`Error fetching manifest: ${response.status} ${response.statusText}`);
        }
        
        let data = await response.json();
        return data;
    } catch (err) {
        console.error('Error in manifest function:', err);
        // Return null instead of undefined when there's an error
        return null;
    }
}

function tableOfContents(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const headers = doc.querySelectorAll('h1, h2, h3');
    
    let toc = '<ol class="toc">\n';
    let currentLevel = 0;
    
    headers.forEach((header, index) => {
        const level = parseInt(header.tagName.charAt(1));
        const text = header.textContent.replaceAll('#', '').trim();
        const id = header.id || `header-${index}`;
        
        // Add id to header if it doesn't exist
        if (!header.id) {
            header.id = id;
        }
        
        if (level > currentLevel) {
            // Open new nested lists
            for (let i = currentLevel; i < level - 1; i++) {
                toc += '  '.repeat(i + 1) + '<li><ol>\n';
            }
            toc += '  '.repeat(level) + `<ol><li><a class="toc-link" href="#${id}">${text}</a></li>\n`;
        } else if (level === currentLevel) {
            // Same level
            toc += '  '.repeat(level) + `<li><a class="toc-link" href="#${id}">${text}</a></li>\n`;
        } else {
            // Close nested lists
            for (let i = currentLevel; i > level; i--) {
                toc += '  '.repeat(i) + '</ol></li>\n';
            }
            toc += '  '.repeat(level) + `<li><a class="toc-link" href="#${id}">${text}</a></li>\n`;
        }
        
        currentLevel = level;
    });
    
    toc += '</ol>';
    return toc;
}


function addStyling(html) {
    
   let output = html.replace(/<(h[1-6])([^>]*)>(.*?)<\/(h[1-6])>/gi, (match, openTag, attributes, content, closeTag) => {
        // Determine how many # symbols based on header level
        const level = parseInt(openTag.charAt(1));
        const symbols = '#'.repeat(level);
        
        return `<${openTag}${attributes} id="${content.replaceAll(" ", "-")}" >${symbols} ${content}</${closeTag}>`;
    });

    
    // center the images
    output = output.replace(/<img([^>]*)>/gi, (match, attributes) => {
        return `<div class="centerer"><img${attributes}></div>`;
    });

    return output;
}