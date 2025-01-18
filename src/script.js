import AI from "./ai/ai.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.height = 1000;

const dt = 0.01;
const g = 500; // might have to tweak
const damp = false;

// fuck all that just make a simple pendulum and see what happens

// up vector is theta = 0 now
// theta increase is now clockwise
// this is wrong on all levels but i dont give enough shits

// masses
const m1 = 0.1;
const m2 = 0.1;

// radius
const r1 = 10;
const r2 = 10;

// rotational variables
let a1 = 0;
let a1_v = 0;
// dont need angular b/c it's calculated every time step

let a2 = 3.14/2;
let a2_v = 0;
// dont need angular b/c it's calculated every time step

// dist between balls
let l1 = 200;
let l2 = 200;

// pivot
let p1 = canvas.width/2;
let p2 = canvas.height/2;
let A = 200;
let T = 5;
let w = 2 * Math.PI / T;
let p1vx = 0;
const m_pivot = 1; // mass of pivot

// sliding force. positive direction = +x, to the right
let F_applied = 0;
let F = 0; // this is Fnet

// vf - vo = Fdt
// F = (vf - vo) / dt; easy as that fr

// i guess it was supposed to be positive after all chat

const PIVOT_FRAME_OF_REFERENCE = false;

let run_time = 0;

const ai = new AI();

function render(x, y, r, c='white') {
    ctx.beginPath();
    ctx.arc(x, canvas.height - y, r, 0, 2 * Math.PI);
    ctx.fillStyle = c;
    ctx.fill();
}

function connect(x1, y1, x2, y2, c='white') {
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

// for my sanity
const sin = Math.sin;
const cos = Math.cos;

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    run_time += dt;

    // F_applied = -A * w * w * Math.sin(w * run_time);

    // draw the balls
    let x1 = p1 + l1 * Math.sin(a1);
    let y1 = p2 - l1 * Math.cos(a1); // negative cuz down is theta=0
  
    let x2 = x1 + l2 * Math.sin(a2);
    let y2 = y1 - l2 * Math.cos(a2);
    
    render(p1, p2, 10);
    render(x1, y1, r1);
    render(x2, y2, r2);

    // render center for reference
    render(canvas.width/2, canvas.height/2, 5, 'red');

    connect(p1, p2, x1, y1);
    connect(x1, y1, x2, y2);
    
    let f10 = -m1 * g * cos(a1); // there should be a m1 * g
    let f10x = f10 * sin(a1);
    let f10y = f10 * cos(a1);

    let f21 = -m2 * g * cos(a2) * cos(a2 - a1); // take out the m2 * g for now, just for scaling issues, but it should be in f21
    let f21x = f21 * sin(a1);
    let f21y = f21 * cos(a1);

    // connect(x1, y1, x1 + 50 * f21x / m2 / -g, y1, 'red');
    // connect(x1, y1, x1 + 50 * f10x / m1 / -g, y1, 'blue');

    F = f10x + f21x + F_applied;
    
    // reference: https://www.myphysicslab.com/pendulum/double-pendulum-en.html

    // somewhere in here im gonna have to add a sliding force

    // ight chat; with great power comes great responsibility. fuck this shit im putting it all in unsimplified im not doing the algebra

    let num1 = 2*F_applied*m1*cos(a1) - 4*F*m2*sin(a2)*sin(a1-a2);
    let num2 = 2*F_applied*m_pivot*cos(a1);
    let num3 = l1*m2*m_pivot*a1_v**2*sin(2*a1-2*a2);
    let num4 = 2*l2*m2*m_pivot*a2_v**2*sin(a1-a2);
    let num5 = 2*g*m1*m_pivot*sin(a1);
    let num6 = g*m2*m_pivot*sin(a1) + g*m2*m_pivot*sin(a1-2*a2);
    let den = l1*m_pivot*(2*m1 - m2*cos(2*a1 - 2*a2) + m2);

    let a1_a = -(num1 + num2 + num3 + num4 + num5 + num6) / den;

    num1 = -3*F_applied*m1*cos(a2) + F_applied*m1*cos(2*a1-a2);
    num2 = -2*F_applied*m2*cos(a2) + 2*F_applied*m2*cos(2*a1-a2);
    num3 = F_applied*m_pivot*cos(a2) + F_applied*m_pivot*cos(2*a1 - a2);
    num4 = 2*l1*m1*m_pivot*a1_v**2*sin(a1 - a2);
    num5 = 2*l1*m2*m_pivot*a1_v**2*sin(a1 - a2);
    num6 = l2*m2*m_pivot*a2_v**2*sin(2*a1 - 2*a2);
    let num7 = -g*m1*m_pivot*sin(a2) + g*m1*m_pivot*sin(2*a1-a2);
    let num8 = -g*m2*m_pivot*sin(a2) + g*m2*m_pivot*sin(2*a1 - a2);
    den = l2*m_pivot*(2*m1 - m2*cos(2*a1 - 2*a2) + m2);

    let a2_a = (num1 + num2 + num3 + num4 + num5 + num6 + num7 + num8) / den;

    // now just do the rotational euler
    a1_v += a1_a * dt;
    a2_v += a2_a * dt;
    a1 += a1_v * dt;
    a2 += a2_v * dt;

    // move the pivot now
    if (!PIVOT_FRAME_OF_REFERENCE) {
        let p1ax = F / m_pivot;
        p1vx += p1ax * dt;
        p1 += p1vx * dt;
    }

    // dampening if i want it
    if (damp) {
        a1_v *= 0.99;
        a2_v *= 0.99;
    }

    requestAnimationFrame(loop);
}

start();
