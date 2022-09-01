// Creates a downloadable HTML file for learners
// from input they've made in the course.

// This is just test data.
// TODO: pull input data from the Learner Backpack.

/*************************
 Type Definitions
*************************/

// A grid item only needs a title for use in grid-template-areas,
// and a cell_type to tell us how to process it.
// Everything else is optional.
type grid_content = {
  title: string,
  cell_type: "markdown" | "image" | "table" | "graph" | "blank",
  value?: string,
  url?: string,
  alt?: string,
  table?: string[][],
};

type student_data_structure = {
  title: string,
  layout: string,
  content: grid_content[],
};

/*************************
 Sample variables
*************************/

let legal_ipsum = `Products derived from this License or those from the Original Code or ii) the combination of Original Code or any and all other entities that control, are controlled by, or is a citizen of, or an entity chartered or registered to do so, and all of the Work or Derivative Works thereof, You may distribute a Derived Program: provided that such litigation is filed. In addition, each Contributor hereby grants Recipient a license of any separate license agreement ("Agreement"). Any use, modification, and distribution of the possibility of such a notice.

If You initiate litigation by asserting a patent infringement claim against Participant alleging that the distribution and/or modification of the Modifications are Contributor's original creation(s) and/or Contributor has been modified only in the file described in Section 3.2, Contributor shall not affect the validity or enforceability of the Work. This could, for example, the production of a free program will individually obtain patent licenses, in effect beyond the termination of this License for that Work or Derivative Works in Source Code that new knowledge has been approved by Open Source license, or under its own expense. For example, if a third party.

Description of Modifications. Code" means the Contributions distributed in conjunction with the terms. As an author, you agree to be of the Licensed Product. Create Derivative Works in Source or Object form, provided the result without restriction, including without limitation, method, process, and apparatus claims, in any documentation for the International Sale of Goods is expressly excluded. Any law or regulation then You must retain, in the event Licensee prepares a derivative of it, either verbatim or with modifications and/or translated into another language. Section 2.2. The Source Code of a Larger Work, in any such Licensed Product and any translation into other free programs whose distribution conditions are met: 1.
`;

let long_list: string[] = Array(20).fill(0).map((x, i) => "* item " + i + "\n");
let long_list_string: string = long_list.join('\n');

let learner_data_example = {
  title: 'Hello World',
  layout: 'markdown_1 image_1 / markdown_1 table_1 / markdown_2 markdown_2',
  content: [
    { title: 'image_1', cell_type: "image" as const, url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', alt: 'Google Logo' },
    { title: 'table_1', cell_type: "table" as const, table: [['Header 1', 'Header 2', 'Header 3'], ['1', '2', '3'], ['4', '5', '6']] },
    { title: 'markdown_1', cell_type: "markdown" as const, value: long_list_string },
    { title: 'markdown_2', cell_type: "markdown" as const, value: 'Hello World, let\'s test things. **Bold**, *italics*, _italics?_ [link](www.example.com)' + legal_ipsum },
  ]
};

/*************************
 Functions start here
*************************/

$(function () {
  makeDownloadableOutput(learner_data_example);
});


// Creates a downloadable HTML file and starts the download.
function makeDownloadableOutput(student_data: student_data_structure) {
  let page = makePage(student_data);
  $('body').append(page);
  /*
  let blob = new Blob([page], { type: 'text/html' });
  let url = URL.createObjectURL(blob);
  let link = document.createElement('a');
  link.href = url;
  link.download = 'output.html';
  link.click();
  */
}

// Creates the HTML page.
function makePage(student_data: student_data_structure) {
  let page =
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>` +
    student_data.title +
    `</title>` +
    makeStyles(student_data) +
    makeScripts() +
    `</head>
<body>
    <h1>` + student_data.title + `</h1>` +
    makeGrid(student_data) +
    `</body>
</html>`;
  return page;
}

// Builds the css to be embedded in the page.
function makeStyles(student_data: student_data_structure) {
  return `<style>
    .grid-layout {
      display: grid;
      grid: auto auto auto / auto auto;
      grid-template-areas: ` + makeGridTemplateAreas(student_data.layout) + `;
      border: 1px solid black;
    }
    .grid-layout > div {
      border: 1px solid black;
      padding: 1em;
    }
  </style>`;
}

function makeGridTemplateAreas(layout: string): string {
  let grid_cells = layout.split(' ').filter((x) => x != '/');
  let grid_template_areas = "'" + grid_cells[0] + " " + grid_cells[1] + "' " + "'" + grid_cells[2] + " " + grid_cells[3] + "' " + "'" + grid_cells[4] + " " + grid_cells[5] + "'";
  return grid_template_areas;
}

// Builds the scripts to be embedded in the page.
function makeScripts(): string {
  let script_text = $('#chart_script')[0].innerHTML;

  return `<script id="inner_script">
      console.log('testing');\n` +
    script_text +
    `
    </script>`;

}


// Makes the grid template for the output.
// Layout format: "text_1 image_1 / text_1 table_1 / text_2 text_2"
function makeGrid(student_data: student_data_structure) {
  let grid_cells = student_data.layout.split(' ').filter((x) => x != '/');
  let cell_set = new Set(grid_cells);
  let grid = "<div class='grid-layout'>";

  cell_set.forEach((cell) => {
    grid += "<div class='grid-item' style='grid-area: " + cell + ";'>";
    grid += makeGridComponents(getContent(student_data.content, cell));
    grid += '</div>';
  });
  grid += '</div>';

  return grid;
}

// Returns the HTML for the grid components.
// Mostly shuffles things to other functions.
function makeGridComponents(content: grid_content) {
  switch (content.cell_type) {
    case 'markdown':
      return makeText(content);
    case 'image':
      return makeImage(content);
    case 'table':
      return makeTable(content);
    case 'graph':
      return makeGraph(content);
    case 'blank':
      return "";
    default:
      return content.cell_type + ' debug';
  }
}

// Content is markdown. 
// Using marked to convert to HTML and DOMPurify to sanitize.
function makeText(content: grid_content): string {
  let markdown = content.value;
  return DOMPurify.sanitize(marked.parse(markdown));
}

// Content should be a URL or data URI.
function makeImage(content: grid_content): string {
  return '<img src="' + content.url + '" alt="' + content.alt + '">';
}

// Creates an HTML table from a 2D array of strings.
function makeTable(content: grid_content): string {
  let table = "<table>";
  if (content.table != undefined) {
    content.table.forEach((row) => {
      table += "<tr>";
      row.forEach((cell) => {
        table += "<td>" + cell + "</td>";
      }
      );
      table += "</tr>";
    }
    );
    table += "</table>";
    return table;
  }
  else {
    return "No data for table";
  }
}

// Creates a graph from a JSON object.
function makeGraph(content: grid_content): string {
  return "Graphs not yet implemented.";
}



function getContent(content: grid_content[], title: string): grid_content {
  for (let i = 0; i < content.length; i++) {
    if (content[i].title == title) {
      return content[i];
    }
  }

  return {
    title: "debug",
    cell_type: "markdown",
    value: "debug - identifier mismatch for " + title,
  };
}


/*

What should this look like when I'm done?

<html><head>
  <style>
    div div {height: 100px;}
  </style>
</head><body>
<div style="display:grid; grid: auto auto auto / 120px 120px; grid-template-areas: 'top top' 'ml mr' 'bot bot'">
  <div style="border: 2px solid black; margin: 4px; grid-area: top"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: ml"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: mr"></div>
  <div style="border: 2px solid black; margin: 4px; grid-area: bot;"></div>
</div>
</body></html>

*/