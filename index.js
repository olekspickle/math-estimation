/*
    1. Change accuracy if needed:
    toFixed(4) -> toFixed(needed_decimal_points)
    2. Change functionPlot axis domain to change scale:
    xAxis:{
      domain: [1,1]
    },
    yAxis:{
      domain: [1,1]
    }
*/

let sigm = 1,
  mu = 0,
  N = 0,
  nOfN = 0,
  alfa = 0.2,
  currentN = 0,
  xMin = -8,
  yMin = -0.05,
  xMax = 8,
  yMax = 0.6,
  renderData = [],
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
  screen: {
    width: window.innerWidth,
    height: window.innerHeight
  },
  graphInstance: {},
  sigma: document.getElementById("sigma")["value"],
  mu: document.getElementById("mu")["value"],
  quantity: document.getElementById("quantity")["value"],
  n: document.getElementById("n")["value"],
  alfa: document.getElementById("alfa")["value"],
  table: document.getElementsByTagName("table")[0],
  tableDiv: document.getElementById("table"),
  samples: document.getElementById("samples")
};

const chart = document.getElementById("chart");
chart.height = window.innerWIdtht < 600 ? 300 : 350;
chart.width = window.innerWidth < 600 ? 300 : chart.height * 1.6;
let Ctx = null;
if (chart.getContext) {
  Ctx = chart.getContext("2d");
  Ctx.clearRect(0, 0, chart.width, chart.height);
}

const Width = chart.width;
const Height = chart.height;
//==============================CANVAS===============================================>

// Returns the right boundary of the logical viewport:
function MaxX() {
  return xMax;
}

// Returns the left boundary of the logical viewport:
function MinX() {
  return xMin;
}

// Returns the top boundary of the logical viewport:
function MaxY() {
  return yMax;
}

// Returns the bottom boundary of the logical viewport:
function MinY() {
  return yMin;
}

// Returns the physical x-coordinate of a logical x-coordinate:
function XC(x) {
  return ((x - MinX()) / (MaxX() - MinX())) * Width;
}

// Returns the physical y-coordinate of a logical y-coordinate:
function YC(y) {
  return Height - ((y - MinY()) / (MaxY() - MinY())) * Height;
}

/* Rendering functions */
function Draw() {
  if (nav.radio[0]["checked"]) {
    DrawNormal();
  } else if (nav.radio[1]["checked"]) {
    DrawOne();
  } else if (nav.radio[2]["checked"]) {
    const reducer = (sum, current, i) => {
      const el = getIntervalVectors(i);
      el.forEach(item => sum.push(item));

      return sum;
    };
    return pointEstimations.reduce(reducer, []);
  }
}
// Clears the canvas, draws the axes and graphs the function F.
function DrawNormal() {
  data = eval(probabilityDensity);
  Ctx.clearRect(0, 0, Width, Height);
  DrawAxes();
  Ctx.strokeStyle = '#f00'
  RenderFunction(data);
  Ctx.strokeStyle = '#000'
}

function DrawOne(x) {
  Ctx.strokeStyle = "#f00";
  const intervals = getIntervalVectors(currentN, true);
  data = getOneEstimation();
  Ctx.clearRect(0, 0, Width, Height);
  DrawAxes();
  RenderFunction(F);
}
function DrawAll() {
  data = getAllEstimations();
  Ctx.clearRect(0, 0, Width, Height);
  DrawAxes();
  RenderFunction(F);
}

// Returns the distance between ticks on the X axis:
function XTickDelta() {
  return 1;
}

// Returns the distance between ticks on the Y axis:
function YTickDelta() {
  return 0.1;
}

// DrawAxes draws the X ad Y axes, with tick marks.
function DrawAxes() {
  Ctx.save();
  Ctx.lineWidth = 1;
  // +Y axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(0), YC(MaxY()));
  Ctx.stroke();

  // -Y axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(0), YC(MinY()));
  Ctx.stroke();

  // Y axis tick marks
  var delta = YTickDelta();
  for (let i = 1; i * delta < MaxY(); ++i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(0) - 3, YC(i * delta));
    Ctx.lineTo(XC(0) + 3, YC(i * delta));
    Ctx.stroke();
  }

  var delta = YTickDelta();
  for (let i = 1; i * delta > MinY(); --i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(0) - 3, YC(i * delta));
    Ctx.lineTo(XC(0) + 3, YC(i * delta));
    Ctx.stroke();
  }

  // +X axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(MaxX()), YC(0));
  Ctx.stroke();

  // -X axis
  Ctx.beginPath();
  Ctx.moveTo(XC(0), YC(0));
  Ctx.lineTo(XC(MinX()), YC(0));
  Ctx.stroke();

  // X tick marks
  var delta = XTickDelta();
  for (let i = 1; i * delta < MaxX(); ++i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(i * delta), YC(0) - 5);
    Ctx.lineTo(XC(i * delta), YC(0) + 5);
    Ctx.stroke();
  }

  var delta = XTickDelta();
  for (let i = 1; i * delta > MinX(); --i) {
    Ctx.beginPath();
    Ctx.moveTo(XC(i * delta), YC(0) - 5);
    Ctx.lineTo(XC(i * delta), YC(0) + 5);
    Ctx.stroke();
  }
  Ctx.restore();
}

// When rendering, XSTEP determines the horizontal distance between points:
let XSTEP = (MaxX() - MinX()) / Width;

// RenderFunction(f) renders the input funtion f on the canvas.
function RenderFunction(f) {
  let first = true;
  Ctx.beginPath();
  for (let x = MinX(); x <= MaxX(); x += XSTEP) {
    let y = f(x);
    if (first) {
      Ctx.moveTo(XC(x), YC(y));
      first = false;
    } else {
      Ctx.lineTo(XC(x), YC(y));
    }
  }
  Ctx.stroke();
}

//==============================CANVAS===============================================>
//==============================CALCULATIONS===============================================>

const probabilityDensity = function(x) {
  return (
    (1 / (sigm * Math.pow(2 * Math.PI, 1 / 2))) *
    Math.exp((-1 * Math.pow(x - mu, 2)) / (2 * Math.pow(sigm, 2)))
  );
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
  // let num = op
  //   const p = [
  //     0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  //     771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  //   ];
  //   let i;
  //   const g = 7;
  //   if (num < 0.5) return Math.PI / (Math.sin(Math.PI * num) * calculus.LanczosGamma(1 - num));
  //   num -= 1;
  //   const a = p[0];
  //   const t = num + g + 0.5;
  //   for (i = 1; i < p.length; i++) {
  //     a += p[i] / (num + i);
  //   }
  //   return Math.sqrt(2 * Math.PI) * Math.pow(t, num + 0.5) * Math.exp(-t) * a;
}

function generate(arr, n) {
  // const k = 2.9;
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
    const reducer = (sum, current) => sum + +current[0];
    const s = el.reduce(reducer, 0);
    const X = s / el.length;

    return X;
  });
}

function getStaticIntervalEstimates() {
  return generatedNumbers.map((el, i) => getInterval(el, i));
}

function getInterval(arr, i) {
  //Xavg -static point estimate
  const avg = +pointEstimations[i];
  const reducer = (sum, curr) => {
    return sum + Math.pow(+curr[0] - avg, 2);
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

  let lowPrelim = avg - (S * t) / Math.sqrt(nOfN);
  let highPrelim = avg + (S * t) / Math.sqrt(nOfN);

  //parse to float that javascript can handle
  const low = `${lowPrelim}`.substring(0, 10);
  const high = `${highPrelim}`.substring(0, 10);

  // console.log("avg, sqSum, S, t", avg, sqSum, S, t);
  // console.log("low", low, "high", high);

  return [+low, +high];
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
  // render();
  Draw();
}

function handleNextSample() {
  if (N === 0) return console.log("enter more numbers");

  if (currentN === N - 1) return console.log("no next samples");
  currentN++;
  nav.sample.innerHTML = `${currentN + 1}`;
  // render();
  Draw();
}

function handleGenerate() {
  refreshAll();
  if (data.sigma === 0) data.sigma = 1;
  if (N === 0) return alert("enter more numbers");
  data.samples.innerHTML = `${N}`;
  //clear generated
  generatedNumbers.length = 0;
  for (let i = 0; i < N; i++) {
    generatedNumbers.push(generate([], data.n));
  }
  fillTable(generatedNumbers);
  //adjust table height
  data.tableDiv.style.height = `${nOfN * 26}px`;
}

function handleCalculate() {
  refreshAll();
  pointEstimations = [];
  intervalEstimations = [];
  pointEstimations = getStaticPointEstimates();
  intervalEstimations = getStaticIntervalEstimates();
  fillCalculatedTable(pointEstimations);
  // render();
  Draw();
}

function refreshAll() {
  refreshTable();
  refreshData();
}
function refreshCoordinates() {
  const reduceX = (max, el) => (max < el[1] ? el[1] : max);
  xMax = intervalEstimations.reduce(reduceX, 0);
  yMax = data.quantity * 0.1 + 1;
}

function refreshData() {
  data = {
    screen: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    sigma: document.getElementById("sigma")["value"],
    mu: document.getElementById("mu")["value"],
    quantity: document.getElementById("quantity")["value"],
    n: document.getElementById("n")["value"],
    alfa: document.getElementById("alfa")["value"],
    table: document.getElementsByTagName("table")[0],
    tableDiv: document.getElementById("table"),
    samples: document.getElementById("samples")
  };

  nav.sample.innerHTML = 0;
  (currentN = 0),
    (xMax = 8),
    (yMax = 0.6),
    (renderData = []),
    (N = data.quantity);
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

function refreshChart() {
  // if (
  //   data.graphInstance &&
  //   data.graphInstance.root &&
  //   data.graphInstance.root[0] &&
  //   data.graphInstance.root[0][0]
  // ) {
  //   data.graphInstance.canvas[0][0].innerHTML = "";
  //   data.graphInstance.root[0][0].innerHTML = "";
  // }
  // render();
  Draw();
}

function fillTable(arr) {
  if (!arr.length || !arr[0].length) return;
  const outerLength = arr.length;
  const innerLength = arr[0].length;
  const caption = data.table.caption;

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

  caption.innerHTML = "Generated numbers";
}

function fillCalculatedTable(arr) {
  if (!arr.length) return;
  const length = arr.length;
  const caption = data.table.caption;

  for (let i = 0; i < length; i++) {
    const tr = data.table.tHead.children[0],
      th = document.createElement("th");
    th.innerHTML = `X${i + 1}`;
    tr.appendChild(th);
  }

  const row = data.table.insertRow(1);
  for (let i = 0; i < length; i++) {
    const cell = row.insertCell(i);
    cell.innerHTML = arr[i].toFixed(8);
  }

  caption.innerHTML = "Average estimation for each sample";
}

function getIntervalVectors(i, isOne) {
  // console.log('pointEstimations', pointEstimations, 'intervalEstimations', intervalEstimations)
  let x = pointEstimations[i],
    range = intervalEstimations[i],
    y;
  if (isOne) y = 1.01 * (1 / (data.sigma * Math.sqrt(2 * Math.PI)));
  else y = ((yMax - 0.1) / data.quantity) * i;

  const vertical = { line: [[x, yMax - 0.05], [x, 0]], color: "black" };
  const horizontal = { line: [[range[0], y], [range[1], y]], color: "red" };
  const data2 = {
    points: [[x, y], [range[0], y], [range[1], y]],
    color: "blue"
  };
  return { vertical, horizontal, data2 };
}

// function getData() {
//   if (nav.radio[0]["checked"]) {
//     return probabilityDensity;
//   } else if (nav.radio[1]["checked"]) {
//     return getIntervalVectors(currentN, true);
//   } else if (nav.radio[2]["checked"]) {
//     const reducer = (sum, current, i) => {
//       const el = getIntervalVectors(i);
//       el.forEach(item => sum.push(item));

//       return sum;
//     };
//     return pointEstimations.reduce(reducer, []);
//   }
// }

function handleRadio(target) {
  switch (target.value) {
    case "second":
      refreshCoordinates();
      break;
    case "first":
      refreshCoordinates();
      break;
    default:
      yMax = 0.45;
      xMax = 8;
  }
  refreshChart();
}

// function render() {
//   //chart width
//   const isMobile = data.screen.width < 600;
//   const makeWider = xMax + 0.2,
//     height = isMobile ? 300 : 350;

//   renderData = getData();
//   // console.log("renderData", renderData);

//   // data.graphInstance = functionPlot({
//   //   target: "#chart",
//   //   title: "Calculation",
//   //   grid: true,
//   //   height: height,
//   //   width: (!isMobile && height * 1.45) || 300,
//   //   // disableZoom: true,
//   //   xAxis: {
//   //     label: "x",
//   //     domain: [-makeWider, makeWider]
//   //   },
//   //   yAxis: {
//   //     label: "y",
//   //     domain: [-0.05, yMax]
//   //   },
//   //   data: renderData
//   // });
// }

function init() {
  nav.radio[0]["checked"] = true;
  Draw();
}

function radioListener({ target }) {
  handleRadio(target);
}

nav.radio.forEach(function(el) {
  el.addEventListener("click", radioListener);
});

init();

//=================================DOM_MANIPULATION==============================================<
