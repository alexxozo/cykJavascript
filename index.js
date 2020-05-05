const normalizeArray = table => {
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j < table[0].length; j++) {
      if (table[i][j].length == 0) {
        table[i][j].push("");
      }
    }
  }
};

// Cartesian product
const cartesianProduct = (a, b) =>
  [].concat(...a.map(i1 => b.map(i2 => [].concat(i1, i2))));

// Created an empty table for CYK
const createEmptyTable = (lines, columns) => {
  let table = [];
  for (let i = 0; i < lines; i++) {
    table[i] = [];
    for (let j = 0; j < columns; j++) {
      table[i][j] = [""];
    }
  }
  return table;
};

// Finds all productions that results in a given terminal
const findTerminalProductions = (terminal, grammar) => {
  let allProductions = [];
  for (let name of _.keys(grammar)) {
    let production = grammar[name];
    if (_.indexOf(production, terminal) != -1) {
      allProductions.push(name);
    }
  }
  return allProductions;
};

// Generate for each split of a word the states used to get there
const generateProductions = (word, start, end, table, grammar) => {
  const length = end - start;
  let union = [];
  for (let i = 1; i < length; i++) {
    const leftPart = word.substring(start, start + i);
    const rightPart = word.substring(start + i, end);
    const product = cartesianProduct(
      table[leftPart.length - 1][start],
      table[rightPart.length - 1][start + i]
    );
    let result = [];
    for (let item of product) {
      const nonTerminal = item.join("");
      const terminalProd = findTerminalProductions(nonTerminal, grammar);
      result.push(terminalProd);
    }
    union = _.union(union, ...result);
    table[length - 1][start] = union;
  }
};

const createHtmlTable = tableArray => {
  let tableContent = "";

  for (let i = tableArray.length - 1; i >= 0; i--) {
    let tableRow = "<tr>";
    for (let j = 0; j < tableArray[0].length; j++) {
      if (tableArray[i][j].length == 0) {
        tableRow += "<td style='display:none; border:none;'></td>";
      } else {
        tableRow += "<td>" + tableArray[i][j] + "</td>";
      }
    }
    tableContent += tableRow + "</tr>";
  }

  return "<table>" + tableContent + "</table>";
};

const runCYK = () => {
  let word = document.getElementById("word").value;
  let tableArr = calculateTable(word);
  normalizeArray(tableArr);
  document.getElementById("table").innerHTML = createHtmlTable(tableArr);
};

const calculateTable = word => {
  const grammarOne = {
    S: ["SS", "AB", "AC", "DE", "DF", "DB"],
    C: ["SB"],
    F: ["SE"],
    A: ["("],
    B: [")"],
    D: ["["],
    E: ["]"]
  };

  const grammarTwo = {
    S: ["AB", "BA"],
    A: ["CD", "a"],
    B: ["CE", "b"],
    C: ["a", "b"],
    D: ["AC"],
    E: ["BC"]
  };

  let table = createEmptyTable(word.length, word.length);

  // 1. Complete first row
  for (let index in word) {
    const terminalProd = findTerminalProductions(word[index], grammarOne);
    table[0][index] = terminalProd;
  }

  // 2. Complete the other rows
  for (let i = 1; i < word.length; i++) {
    for (let j = 0; j < word.length - i; j++) {
      generateProductions(word, j, j + i + 1, table, grammarOne);
    }
  }

  console.log(table);
  if (table[word.length - 1][0].includes("S")) {
    document.getElementById("fail").style.display = "none";
    document.getElementById("success").style.display = "block";
  } else {
    document.getElementById("success").style.display = "none";
    document.getElementById("fail").style.display = "block";
  }

  return table;
};
