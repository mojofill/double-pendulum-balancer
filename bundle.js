(() => {
  // src/ai/neuron.js
  function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
  }
  var Neuron = class {
    weight = Math.random() * 2 - 1;
    bias = Math.random() * 2 - 1;
    value = 0;
    layerIndex;
    constructor(layerIndex) {
      this.layerIndex = layerIndex;
    }
    activate(layers) {
      if (this.layerIndex === 0) return this.value;
      let sum = 0;
      const previousLayer = layers[this.layerIndex - 1];
      for (let i = 0; i < previousLayer.neuronAmount; i++) {
        const neuron = previousLayer.get(i);
        sum += neuron.weight * neuron.value;
      }
      sum += this.bias;
      return sigmoid(sum);
    }
  };

  // src/ai/layer.js
  var Layer = class {
    neurons = [];
    neuronAmount;
    constructor(neuronAmount, layerIndex) {
      this.neuronAmount = neuronAmount;
      this.layerIndex = layerIndex;
      for (let i = 0; i < neuronAmount; i++) {
        this.neurons.push(new Neuron(layerIndex));
      }
    }
    /** returns neuron at `k` */
    get(k) {
      return this.neurons[k];
    }
    set(k, n) {
      this.neurons[k].value = n;
    }
  };

  // src/ai/ai.js
  var AI = class {
    layerAmount = 4;
    // do i really need that many. whatever i'll see
    layers = [];
    neuronsInLayer = [
      // input layer - decide on how many later
      4,
      3,
      1
    ];
    constructor() {
      for (let i = 0; i < this.layerAmount; i++) {
        this.layers.push(new Layer());
      }
    }
  };

  // src/script.js
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = canvas.height = 1e3;
  var dt = 0.01;
  var g = 500;
  var damp = false;
  var m1 = 0.1;
  var m2 = 0.1;
  var r1 = 10;
  var r2 = 10;
  var a1 = 0;
  var a1_v = 0;
  var a2 = 3.14 / 2;
  var a2_v = 0;
  var l1 = 200;
  var l2 = 200;
  var p1 = canvas.width / 2;
  var p2 = canvas.height / 2;
  var T = 5;
  var w = 2 * Math.PI / T;
  var p1vx = 0;
  var m_pivot = 1;
  var F_applied = 0;
  var F = 0;
  var PIVOT_FRAME_OF_REFERENCE = false;
  var run_time = 0;
  var ai = new AI();
  function render(x, y, r, c = "white") {
    ctx.beginPath();
    ctx.arc(x, canvas.height - y, r, 0, 2 * Math.PI);
    ctx.fillStyle = c;
    ctx.fill();
  }
  function connect(x1, y1, x2, y2, c = "white") {
    ctx.beginPath();
    ctx.moveTo(x1, canvas.height - y1);
    ctx.lineTo(x2, canvas.height - y2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c;
    ctx.stroke();
    ctx.closePath();
  }
  function start() {
    requestAnimationFrame(loop);
  }
  var sin = Math.sin;
  var cos = Math.cos;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    run_time += dt;
    let x1 = p1 + l1 * Math.sin(a1);
    let y1 = p2 - l1 * Math.cos(a1);
    let x2 = x1 + l2 * Math.sin(a2);
    let y2 = y1 - l2 * Math.cos(a2);
    render(p1, p2, 10);
    render(x1, y1, r1);
    render(x2, y2, r2);
    render(canvas.width / 2, canvas.height / 2, 5, "red");
    connect(p1, p2, x1, y1);
    connect(x1, y1, x2, y2);
    let f10 = -m1 * g * cos(a1);
    let f10x = f10 * sin(a1);
    let f10y = f10 * cos(a1);
    let f21 = -m2 * g * cos(a2) * cos(a2 - a1);
    let f21x = f21 * sin(a1);
    let f21y = f21 * cos(a1);
    F = f10x + f21x + F_applied;
    let num1 = 2 * F_applied * m1 * cos(a1) - 4 * F * m2 * sin(a2) * sin(a1 - a2);
    let num2 = 2 * F_applied * m_pivot * cos(a1);
    let num3 = l1 * m2 * m_pivot * a1_v ** 2 * sin(2 * a1 - 2 * a2);
    let num4 = 2 * l2 * m2 * m_pivot * a2_v ** 2 * sin(a1 - a2);
    let num5 = 2 * g * m1 * m_pivot * sin(a1);
    let num6 = g * m2 * m_pivot * sin(a1) + g * m2 * m_pivot * sin(a1 - 2 * a2);
    let den = l1 * m_pivot * (2 * m1 - m2 * cos(2 * a1 - 2 * a2) + m2);
    let a1_a = -(num1 + num2 + num3 + num4 + num5 + num6) / den;
    num1 = -3 * F_applied * m1 * cos(a2) + F_applied * m1 * cos(2 * a1 - a2);
    num2 = -2 * F_applied * m2 * cos(a2) + 2 * F_applied * m2 * cos(2 * a1 - a2);
    num3 = F_applied * m_pivot * cos(a2) + F_applied * m_pivot * cos(2 * a1 - a2);
    num4 = 2 * l1 * m1 * m_pivot * a1_v ** 2 * sin(a1 - a2);
    num5 = 2 * l1 * m2 * m_pivot * a1_v ** 2 * sin(a1 - a2);
    num6 = l2 * m2 * m_pivot * a2_v ** 2 * sin(2 * a1 - 2 * a2);
    let num7 = -g * m1 * m_pivot * sin(a2) + g * m1 * m_pivot * sin(2 * a1 - a2);
    let num8 = -g * m2 * m_pivot * sin(a2) + g * m2 * m_pivot * sin(2 * a1 - a2);
    den = l2 * m_pivot * (2 * m1 - m2 * cos(2 * a1 - 2 * a2) + m2);
    let a2_a = (num1 + num2 + num3 + num4 + num5 + num6 + num7 + num8) / den;
    a1_v += a1_a * dt;
    a2_v += a2_a * dt;
    a1 += a1_v * dt;
    a2 += a2_v * dt;
    if (!PIVOT_FRAME_OF_REFERENCE) {
      let p1ax = F / m_pivot;
      p1vx += p1ax * dt;
      p1 += p1vx * dt;
    }
    if (damp) {
      a1_v *= 0.99;
      a2_v *= 0.99;
    }
    requestAnimationFrame(loop);
  }
  start();
})();
