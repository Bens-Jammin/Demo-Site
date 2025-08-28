

function save_schedule(name, schedule_matrix) {

}


function load_created_schedules() {

}

function load_schedule(name) {

}



let startCell = null;


document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".schedule tbody td").forEach(td => {
        td.addEventListener("mousedown", e => {
            startCell = td;
            console.log("start merging");
        });

        td.addEventListener("mouseup", e => {
                console.log("end merging");

                if (!startCell) return;

            let startRow = startCell.parentNode.rowIndex; // includes THEAD offset
            let endRow   = td.parentNode.rowIndex;
            let colIndex = startCell.cellIndex;

            if (td.cellIndex !== colIndex) {
                startCell = null;
                return;
            }

            let table = document.getElementById("schedule");
            console.log("table is "+table);
            let minRow = Math.min(startRow, endRow);
            let maxRow = Math.max(startRow, endRow);
            let span   = maxRow - minRow + 1;

            // merge into the top cell
            let topCell = table.rows[minRow].cells[colIndex];
            topCell.rowSpan = span;

            // remove the merged cells below
            for (let r = minRow + 1; r <= maxRow; r++) {
            table.rows[r].deleteCell(colIndex);
            }

            startCell = null;
        });
    });
});