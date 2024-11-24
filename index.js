/*
    1. Change accuracy if needed:
    toFixed(4) -> toFixed(needed_decimal_points)
*/

let sigm = 1,
  mu = 0,
  N = 0,
  nOfN = 0,
  alfa = 0.2,
  currentN = 0,
  generatedNumbers = [], // [[x1:string,y1:number],[x2:string,y2:number]...[xn:string,yn:number]]
  pointEstimations = [], // [[x1:number],[x2:number]...[xn:number]]
  intervalEstimations = []; // [[x1:number,x2:number],[x1:number,x2:number]...[x1:number,x2:number]]

const nav = {
  sample: document.getElementById("sample"),
  back: document.getElementById("previous"),
  forward: document.getElementById("next"),
  radio: document.getElementsByName("chart")
};
let data = {
  sigma: document.getElementById("sigma")["value"],
  mu: document.getElementById("mu")["value"],
  quantity: document.getElementById("quantity")["value"],
  n: document.getElementById("n")["value"],
  alfa: document.getElementById("alfa")["value"],
  table: document.getElementsByTagName("table")[0],
  tableDiv: document.getElementById("table"),
  samples: document.getElementById("samples")
};

const chart = document.querySelector("#chart");
//==============================CALCULATIONS===============================================>

const probabilityDensity = function(x) {
  (1 / (sigm * Math.pow(2 * Math.PI, 1 / 2))) *
    Math.exp((-1 * Math.pow(x - mu, 2)) / (2 * Math.pow(sigm, 2)));
};

function gamma(op) {
  // Lanczos Approximation of the Gamma Function
  // As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
  let z = op + 1;
  let p = [
    1.000000000190015,
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    1.208650973866179e-3,
    -5.395239384953e-6
  ];
  let d1 = Math.sqrt(2 * Math.PI) / z;
  let d2 = p[0];

  for (let i = 1; i <= 6; ++i) d2 += p[i] / (z + i);

  let d3d4 = Math.exp((z + 0.5) * Math.log(z + 5.5) - z - 5.5);

  // console.log("d1 * d2 * d3d4", d1 * d2 * d3d4);

  return d1 * d2 * d3d4;
}

function generate(arr, n) {
  const k = 2.9;
  for (let i = 0; i < n; i++) {
    //random
    arr.push([
      (Math.random() * (-k - k) + k + parseFloat(data.mu)).toFixed(4),
      0
    ]);
  }
  return arr;
}

function getStaticPointEstimates() {
  return generatedNumbers.map(el => {
    const reducer = (sum, current) => sum + parseFloat(current[0]);
    const s = el.reduce(reducer, 0);
    return (s / el.length).toFixed(8);
  });
}

function getStaticIntervalEstimates() {
  return generatedNumbers.map((el, i) => getInterval(el, i));
}

function getInterval(arr, i) {
  //Xavg -static point estimate
  const avg = pointEstimations[i];
  const reducer = (sum, curr) => {
    return sum + Math.pow(parseFloat(curr[0]) - avg, 2);
  };
  //Xi - Xavg
  const sqSum = arr.reduce(reducer, 0);
  //S(x) - unshifted variance estimate
  const S = sqSum / (nOfN - 1);
  //T(x)
  const t =
    gamma((nOfN + 1) / 2) /
    (Math.sqrt(nOfN * Math.PI) *
      gamma(nOfN / 2) *
      Math.pow(1 + Math.pow(avg, 2), (nOfN + 1) / 2));

  // console.log("avg, sqSum, S, t", avg, sqSum, S, t);

  const low = avg - (S * t) / Math.sqrt(nOfN);
  const high = avg + (S * t) / Math.sqrt(nOfN);
  return [low, high];
}

//===================================CALCULATIONS=============================================<

//=================================DOM_MANIPULATION===========================================>
function handleTableScroll() {
  document.getElementById("tableDiv").scrollLeft = this.scrollLeft;
}
function handlePreviousSample() {
  if (N === 0) return console.log("enter more numbers");

  if (currentN === 0) return console.log("no previous samples");
  currentN--;
  nav.sample.innerHTML = `${currentN + 1}`;
  render();
}

function handleNextSample() {
  if (N === 0) return console.log("enter more numbers");

  if (currentN === N - 1) return console.log("no next samples");
  currentN++;
  nav.sample.innerHTML = `${currentN + 1}`;
  render();
}

function handleGenerate() {
  refreshTable();
  refreshData();

  if (N === 0) return console.log("enter more numbers");
  data.samples.innerHTML = `${N}`;

  generatedNumbers.length = 0;
  for (let i = 0; i < N; i++) {
    generatedNumbers.push(generate([], data.n));
  }

  fillTable(generatedNumbers);
  data.tableDiv.style.height = `${nOfN * 26}px`;
  nav.radio[0].click();
}

function handleCalculate() {
  refreshTable();
  refreshData();

  pointEstimations = getStaticPointEstimates();
  intervalEstimations = getStaticIntervalEstimates();

  fillCalculatedTable(pointEstimations);
  render();

  // console.log(
  //   "point estimations",
  //   pointEstimations,
  //   "interval estimations",
  //   intervalEstimations
  // );
}

function refreshData() {
  data = {
    sigma: document.getElementById("sigma")["value"],
    mu: document.getElementById("mu")["value"],
    quantity: document.getElementById("quantity")["value"],
    n: document.getElementById("n")["value"],
    alfa: document.getElementById("alfa")["value"],
    table: document.getElementsByTagName("table")[0],
    tableDiv: document.getElementById("table"),
    samples: document.getElementById("samples")
  };
  N = data.quantity;
  nOfN = data.n;
  sigm = data.sigma;
  mu = data.mu;
  alfa = data.alfa;
}

function refreshTable() {
  if (data.table) data.table.parentNode.removeChild(data.table);
  if (data.tableDiv) data.tableDiv.parentNode.removeChild(data.tableDiv);
  const temp = document.getElementsByTagName("template")[0],
    main = document.getElementsByClassName("main")[0],
    clon = temp.content.cloneNode(true);
  main.appendChild(clon);
}

function fillTable(arr) {
  if (!arr.length || !arr[0].length) return;
  const outerLength = arr.length;
  const innerLength = arr[0].length;

  for (let i = 0; i < outerLength; i++) {
    const tr = data.table.tHead.children[0],
      th = document.createElement("th");
    th.innerHTML = `X${i + 1}`;
    tr.appendChild(th);
  }
  for (let j = 0; j < innerLength; j++) {
    const row = data.table.insertRow(j + 1);
    for (let i = 0; i < outerLength; i++) {
      const cell = row.insertCell(i);
      //array of arrays of arrays of type [x, y = 0]
      cell.innerHTML = arr[i][j][0];
    }
  }
}
function fillCalculatedTable(arr) {
  if (!arr.length) return;
  const length = arr.length;

  for (let i = 0; i < length; i++) {
    const tr = data.table.tHead.children[0],
      th = document.createElement("th");
    th.innerHTML = `X${i + 1}`;
    tr.appendChild(th);
  }
  const row = data.table.insertRow(1);
  for (let i = 0; i < length; i++) {
    const cell = row.insertCell(i);
    cell.innerHTML = arr[i];
  }
}

function getData() {
  if (nav.radio[0]["checked"]) {
    const data1 = {
      fn: `(1 / (${sigm} * sqrt(2 * PI))) * exp((-1 * (x-${mu}) ^ 2) / (2 * 1^ 2))`,
      color: "red"
    };
    const data2 = {
      points: generatedNumbers[currentN],
      graphType: "scatter",
      fnType: "points",
      color: "#8134f8"
    };
    if (N === 0 || !generatedNumbers.length) return [data1];
    return [data1, data2];

  } else if (nav.radio[1]["checked"]) {
    const x = probabilityDensity(pointEstimations[currentN]);
    const range = intervalEstimations[currentN];
    const y = Math.random() * 2;
    const data1 = {
      fn: `${x}`,
      color: "red",
      range: range
    };
    const data2 = {
      points: [[x, y], [range[0], y], [range[1], y]],
      graphType: "scatter",
      fnType: "points",
      color: "blue",
    };
    return [data1,data2];
  } else if (nav.radio[2]["checked"]) {
    const data1 = {
      fn: `(1 / (${7 * sigm} * sqrt(2 * PI))) * exp((-1 * (x-${1 *
        mu}) ^ 2) / (2 * 1^ 2))`,
      color: "green"
    };
  }
}

function render(target, val) {
  const data = getData();
  console.log("data", data);

  functionPlot({
    target: "#chart",
    title: "Calculation",
    grid: true,
    height: 500,
    // disableZoom: true,
    xAxis: {
      label: "x",
      domain: [-6, 6]
    },
    yAxis: {
      label: "y",
      domain: [-1, 1]
    },
    data: data
  });
}

function init() {
  nav.radio[0]["checked"] = true;
  render(nav.radio[0], true);
}

function radioListener({ target }) {
  render(target, this["checked"]);
}

nav.radio.forEach(function(el) {
  chart["style"].display = "none";
  el.addEventListener("click", radioListener);
  chart["style"].display = "inline";
});

init();

//=================================DOM_MANIPULATION==============================================<

//======================================CONSTANTS================================================>

const NORMAL_DISTRIBUTION = {
  n: [0.7, 0.75, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.9995],
  1: [0.7265, 1.0, 1.3764, 3.0777, 6.3137, 15.894, 31.821, 63.656, 636.58],
  2: [0.6172, 0.8165, 1.0607, 1.8856, 2.92, 4.8487, 6.9645, 9.925, 31.6],
  3: [0.5844, 0.7649, 0.9785, 1.6377, 2.3534, 3.4819, 4.5407, 5.8408, 12.924],
  4: [0.5686, 0.7407, 0.941, 1.5332, 2.1318, 2.9985, 3.7469, 4.6041, 8.6101],
  5: [0.5594, 0.7267, 0.9195, 1.4759, 2.015, 2.7565, 3.3649, 4.0321, 6.8685],
  6: [0.5534, 0.7176, 0.9057, 1.4398, 1.9432, 2.6122, 3.1427, 3.7074, 5.9587],
  7: [0.5491, 0.7111, 0.896, 1.4149, 1.8946, 2.5168, 2.9979, 3.4995, 5.4081],
  8: [0.5459, 0.7064, 0.8889, 1.3968, 1.8595, 2.449, 2.8965, 3.3554, 5.0414],
  9: [0.5435, 0.7027, 0.8834, 1.383, 1.8331, 2.3984, 2.8214, 3.2498, 4.7809],
  10: [0.5415, 0.6998, 0.8791, 1.3722, 1.8125, 2.3593, 2.7638, 3.1693, 4.5868],
  11: [0.5399, 0.6974, 0.8755, 1.3634, 1.7959, 2.3281, 2.7181, 3.1058, 4.4369],
  12: [, 0.5386, 0.6955, 0.8726, 1.3562, 1.7823, 2.3027, 2.681, 3.0545, 4.3178],
  13: [0.5375, 0.6938, 0.8702, 1.3502, 1.7709, 2.2816, 2.6503, 3.0123, 4.2209],
  14: [0.5366, 0.6924, 0.8681, 1.345, 1.7613, 2.2638, 2.6245, 2.9768, 4.1403],
  15: [0.5357, 0.6912, 0.8662, 1.3406, 1.7531, 2.2485, 2.6025, 2.9467, 4.0728],
  16: [0.535, 0.6901, 0.8647, 1.3368, 1.7459, 2.2354, 2.5835, 2.9208, 4.0149],
  17: [0.5344, 0.6892, 0.8633, 1.3334, 1.7396, 2.2238, 2.5669, 2.8982, 3.9651],
  18: [0.5338, 0.6884, 0.862, 1.3304, 1.7341, 2.2137, 2.5524, 2.8784, 3.9217],
  19: [0.5333, 0.6876, 0.861, 1.3277, 1.7291, 2.2047, 2.5395, 2.8609, 3.8833],
  20: [0.5329, 0.687, 0.86, 1.3253, 1.7247, 2.1967, 2.528, 2.8453, 3.8496],
  21: [0.5325, 0.6864, 0.8591, 1.3232, 1.7207, 2.1894, 2.5176, 2.8314, 3.8193],
  22: [0.5321, 0.6858, 0.8583, 1.3212, 1.7171, 2.1829, 2.5083, 2.8188, 3.7922],
  23: [0.5317, 0.6853, 0.8575, 1.3195, 1.7139, 2.177, 2.4999, 2.8073, 3.7676],
  24: [0.5314, 0.6848, 0.8569, 1.3178, 1.7109, 2.1715, 2.4922, 2.797, 3.7454],
  25: [0.5312, 0.6844, 0.8562, 1.3163, 1.7081, 2.1666, 2.4851, 2.7874, 3.7251],
  26: [0.5309, 0.684, 0.8557, 1.315, 1.7056, 2.162, 2.4786, 2.7787, 3.7067],
  27: [0.5306, 0.6837, 0.8551, 1.3137, 1.7033, 2.1578, 2.4727, 2.7707, 3.6895],
  28: [0.5304, 0.6834, 0.8546, 1.3125, 1.7011, 2.1539, 2.4671, 2.7633, 3.6739],
  29: [0.5302, 0.683, 0.8542, 1.3114, 1.6991, 2.1503, 2.462, 2.7564, 3.6595],
  30: [0.53, 0.6828, 0.8538, 1.3104, 1.6973, 2.147, 2.4573, 2.75, 3.646],
  40: [0.5286, 0.6807, 0.8507, 1.3031, 1.6839, 2.1229, 2.4233, 2.7045, 3.551],
  60: [0.5272, 0.6786, 0.8477, 1.2958, 1.6706, 2.0994, 2.3901, 2.6603, 3.4602],
  80: [0.5265, 0.6776, 0.8461, 1.2922, 1.6641, 2.0878, 2.3739, 2.6387, 3.4164],
  120: [0.5258, 0.6765, 0.8446, 1.2886, 1.6576, 2.0763, 2.3578, 2.6174, 3.3734]
};

//======================================CONSTANTS================================================<
