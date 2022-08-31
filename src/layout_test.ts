// Creates a downloadable HTML file for learners
// from input they've made in the course.

// This is just test data.
// TODO: pull input data from the Learner Backpack.

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

let learner_data_example = {
  title: 'Hello World',
  layout: 'markdown_1 image_1 / markdown_1 table_1 / markdown_2 markdown_2',
  content: [
    { title: 'image_1', cell_type: "image" as const, url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', alt: 'Google Logo' },
    { title: 'table_1', cell_type: "table" as const, table: [['Header 1', 'Header 2', 'Header 3'], ['1', '2', '3'], ['4', '5', '6']] },
    { title: 'markdown_1', cell_type: "markdown" as const, value: '* item 1\n* item 2\n*item 3' },
    { title: 'markdown_2', cell_type: "markdown" as const, value: 'Hello World, let\'s test things. **Bold**, *italics*, _italics?_ [link](www.example.com)' },
  ]
};

$(function () {
  makeDownloadableOutput(learner_data_example);
});


// Creates a downloadable HTML file and starts the download.
function makeDownloadableOutput(student_data: student_data_structure) {
  $('body').append("<p>test</p>");
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
    makeStyles() +
    makeScripts() +
    `</head>
<body>
    <h1>` + student_data.title + `</h1>` +
    makeGrid(student_data) +
    `</body>
</html>`;
  return page;
}

function makeScripts() { }

function makeStyles() { }

// Makes the grid template for the output.
// Layout format: "text_1 image_1 / text_1 table_1 / text_2 text_2"
// TODO: Should this be done in objects instead of text?
function makeGrid(student_data: student_data_structure) {
  let grid_cells = student_data.layout.split(' ').filter((x) => x != '/');
  let cell_set = new Set(grid_cells);
  console.debug(cell_set);
  let grid = "<div class='grid-layout'>";
  cell_set.forEach((cell) => {
    grid += "<div class='grid-item' grid-area: " + cell + '>';
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

// Content is markdown. Need a parser.
// options: 
//   https://github.com/showdownjs/showdown/blob/master/dist/showdown.min.js (100kB)
//   https://github.com/markedjs/marked/blob/master/marked.min.js (50kB)
// HTML sanitizer: https://github.com/cure53/DOMPurify/ (20kB)
function makeText(content: grid_content) {
  let markdown = content.value;
  return DOMPurify.sanitize(marked.parse(markdown));
}

// Content should be a URL or data URI.
function makeImage(content: grid_content) {
  return '<img src="' + content.url + '" alt="' + content.alt + '">';
}

function makeTable(content: grid_content) {
}

function makeGraph(content: grid_content) {
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