const someArr = [[]];
let sigm = 1;
let mu = 0;
const flags = document.querySelectorAll("input[type=checkbox]");
const standart = document.querySelector("input[name=standart]");
const first = document.querySelector("input[name=first]");
const second = document.querySelector("input[name=second]");

const chart = document.getElementById("chart");
const width = window.innerWidth;

const probabilityDensity = function(x) {
  (1 / (sigm * Math.pow(2 * Math.PI, 1 / 2))) *
    Math.exp((-1 * Math.pow(x - mu, 2)) / (2 * Math.pow(sigm, 2)));
};

//statistical point estimate of mathematical expectation
function getStandartEstimate() {
  let sum = [];
  for (let i = 0; i < 100000; i++) {
    sum.push(probabilityDensity(i));
  }
  return sum;
}

//statistical interval estimation of mathematical expectation

function render(target, val) {
  let sigm = 1;
  let mu = 0;
  const data = [];
  console.log(target, val);

  if ((target.name === "standart" && val) || standart["checked"]) {
    data.push({
      fn: `(1 / (${sigm} * sqrt(2 * PI))) * exp((-1 * (x-${mu}) ^ 2) / (2 * 1^ 2))`,
      color: "red"
    });
  }
  if ((target.name === "first" && val) || first["checked"]) {
    data.push({
      fn: `(1 / (${0.5} * sqrt(2 * PI))) * exp((-1 * (x-${0.4}) ^ 2) / (2 * 1^ 2))`,
      color: "blue"
    });
  }
  if ((target.name === "second" && val) || second["checked"]) {
    data.push({
      fn: `(1 / (${7} * sqrt(2 * PI))) * exp((-1 * (x-${1}) ^ 2) / (2 * 1^ 2))`,
      color: "green"
    });
  }

  functionPlot({
    target: "#chart",
    grid: true,
    width: width - 100,
    height: 500,
    disableZoom: true,
    xAxis: {
      label: "x",
      domain: [-6, 6]
    },
    yAxis: {
      label: "y",
      domain: [-1, 1.5]
    },
    data: data
  });
}

/**
 *
 * @param a poziom kwantyla
 * @param n Liczba stopni swobody
 */
function getDist(a, n) {
  const index = normalDestribution["n"].indexOf(a);
  return normalDestribution[n][index];
}
const normalDestribution = {
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

flags.forEach(function(el) {
  el.addEventListener("change", function({ target }) {
    render(target, this["checked"]);
  });
});

// const standart = document.querySelector("input[name=standart]");
standart["checked"] = true;
render(standart, true);

// const ctx = document.getElementById("myChart");
// if (ctx) ctx.setAttribute("width", `${width}`);

// const data = {
//     labels: [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
//     datasets: [
//       {
//         label: "standart",
//         data: getStandartEstimate(),
//         backgroundColor: ["rgba(255, 60, 86, 0.4)"],
//         borderColor: ["rgba(255, 206, 86, 0.2)"],
//         borderWidth: 1
//       },
//       {
//         label: "emmm",
//         data: [1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1],
//         backgroundColor: ["rgba(75, 192, 192, 0.2)"],
//         borderColor: ["rgba(75, 192, 192, 0.2)"],
//         borderWidth: 1
//       },
//       {
//         label: "wtf",
//         data: [-1, -2, -3, -4, -5, -6, -7, -8, -7, -6, -5, -4, -3, -2, -1],
//         backgroundColor: ["rgba(153, 102, 255, 0.2)"],
//         borderColor: ["rgba(153, 102, 255, 0.2)"],
//         borderWidth: 1
//       }
//     ]
//   }

//   Chart.pluginService.register({
//     beforeInit: function(chart) {
//         // We get the chart data
//         let data = chart.config.data;

//         // For every dataset ...
//         for (let i = 0; i < data.datasets.length; i++) {

//             // For every label ...
//             for (let j = 0; j < data.labels.length; j++) {

//                 // We get the dataset's function and calculate the value
//                 let fct = data.datasets[i].function,
//                     x = data.labels[j],
//                     y = fct(x);
//                 // Then we add the value to the dataset data
//                 data.datasets[i].data.push(y);
//             }
//         }
//     }
// });

// const myChart = new Chart(ctx, {
//   type: "line",
//   data: data,
//   options: {
//     scales: {
//       yAxes: [
//         {
//           ticks: {
//             beginAtZero: true
//           }
//         }
//       ]
//     }
//   },
//   config: {
//     scales: {
//       xAxes: [{
//         ticks: {
//           maxRotation: -90 // angle in degrees
//         }
//       }]
//     }
//   }
// });,
