//Set up parameters
var columnSize, rowSize;
var mark=[];
var frequency = [];
var svg;
var x, y;
const margin = { top: 30, right: 30, bottom: 70, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

$(document).ready(function () {
    let table = $('#sheet');

    //read data from grades.csv
    $.ajax({
        type: 'GET',
        url: 'grades.csv',
        datatype: 'text',
        success: function (response) {
            let fileRow = response.split('\n');
            let fileCol = fileRow[0].split(',');

            columnSize = fileCol.length-1;
            rowSize = fileRow.length;
            
           
            for (let row = 0; row <= rowSize; row++) {
                let tr = $('<tr>');
                for (let col = 0; col <= columnSize; col++) {
                    fileCell = fileRow[row].split(',');
                    let data = $('<td>');
                    data.text(fileCell[col]);
                    data.attr('id', '' + row + col);
                    data.click(boardOnClick);
                    tr.append(data);

                    //Set Background color for headers
                    if (row == 0 || col == 0) {
                        data.css("background-color", "#d0d0d0");
                        data.css("font-weight", "bold");
                    }
                    //set data cell to editable
                    else {
                        data.attr("contenteditable", "true");
                    }
                    
                }
                table.append(tr);

            }
        }
    })

    drawChart();
    

    //de-selects every cell in the spreadsheet
    function deselectAll() {
        for (var row = 1; row <= 9; row++) {
            for (var col = 1; col <= 5; col++) {
                getCell('' + row + col).css("background-color", "");
            }
        }
    }

    // selects every non-header cell in the specified row (indexed, starting with zero)
    function selectRow(rowIndex) {
        //clear previous selections
        deselectAll();
        //set color for header cell
        getCell('' + rowIndex + 0).css("background-color", "#d0d0d0");
        //set color for others cells
        for (col = 1; col <= columnSize; col++) {
            var cellID = '' + rowIndex + col;
            getCell(cellID).css("background-color", "#e0e0ff");
            mark.push(categorize(getCell(cellID).text()));
        }

    }

    //selects every non-header cell in the specified column (indexed, starting with zero)
    function selectColumn(colIndex) {
        //clear previous selections
        deselectAll();
        //set color for header cell
        getCell('' + 0 + colIndex).css("background-color", "#d0d0d0");
        //set color for others cells
        for (row = 1; row <= rowSize; row++) {
            cellID = '' + row + colIndex;
            getCell(cellID).css("background-color", "#e0e0ff");
            mark.push(categorize(getCell(cellID).text()));
        }
    }


    //monitor user input on board
    function boardOnClick() {
        var selected_value = $(this).text();
        var selected_id = $(this).attr('id');
        var rowIndex = selected_id[0];
        var colIndex = selected_id[1];

        //check if first cell is selected
        if (rowIndex == 0 && colIndex == 0) {}
        else {
            //check if row header is selected
            if (colIndex == 0) {
                selectRow(rowIndex);
            }
            //check if col header is selected
            else if (rowIndex == 0) {
                selectColumn(colIndex);
            }

            
            const marks = ['A', 'B', 'C', 'D', 'F'];
            
            for (var i = 0; i < 5; i++) {
                var count = 0;
                count = countArr(mark, marks[i]);
                if (count == 0) {
                    frequency.push(count);
                }
                else {
                    frequency.push((count / mark.length).toFixed(2));
                }
            }
            
            var data=buildData(marks, frequency);
            console.log(data);
            enterData(data);
            mark = [];
            frequency = [];
            
        }
        
    }
    
    //categorize mark into A-F
    function categorize(rawMark) {
        //90-100 = A
        if (rawMark >= 90) {
            return 'A';
        }
        //80-89 = B
        else if (rawMark >= 80) {
            return 'B';
        }
        //70-79 = C
        else if (rawMark >= 70) {
            return 'C';
        }//60-69 = D
        else if (rawMark >= 60) {
            return 'D';
        }//under 59 = F
        else{
            return 'F';
        }
    }

    function countArr(array, targetChar) {
        var temp = '';
        for (i = 0; i < array.length; i++) {
            temp += array[i]+'';
        }
        var count = temp.split(targetChar).length - 1;
        return count;
    }

    function randomNum(min, max) {
        var random = Math.random() * (max - min + 1) + min
        var decimal = parseFloat(random).toFixed(2)
        return decimal;
    }

    //return cell by its position
    function getCell(id) {
        return $("[id=" + id + "]")
    }

    function buildData(scores,freq) {
        var data = [];
        for (var i = 0; i < freq.length; i++) {
            var temp = {
                Marks: scores[i],
                Frequency: freq[i]
            };
            data.push(temp);
        }
        return data;
    }
})


//Darw X Y Axis
function drawChart() {
    // append the svg object to the body of the page
    svg = d3.select("#Chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X axis
    x = d3.scaleBand()
        .range([0, width])
        .domain(['A', 'B', 'C', 'D', 'F'])
        .padding(0.2);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(3,0)")
        .style("text-anchor", "end");

    // Add Y axis
    y = d3.scaleLinear()
        .domain([0, 0.5])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    //add chart label
    svg.append("text")
        .attr("class", "chart label")
        .attr("text-anchor", "end")
        .attr("x", width - 165)
        .attr("y", 0)
        .text("Grade Distribution");

    //add X label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width-165)
        .attr("y", height + 50)
        .text("Grade");

    //add Y label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", "-2.75em")
        .attr("transform", "rotate(-90)")
        .text("Frequency (%)");
        
}

function enterData(data) {
    //Clear Chart
    svg.selectAll("rect").remove();
        
    //Add Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Marks))
        .attr("y", d => y(d.Frequency))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Frequency))
        .attr("fill", "#69b3a2");
}