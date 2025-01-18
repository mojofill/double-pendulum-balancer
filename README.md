# Double Pendulum Balancer
Simple triple jointed double pendulum on a horizontal slide with full physics implemented.

## How to run
Run `npm install esbuild`

Run `npm start`

If you don't have the `start` command, add a script to your `package.json` called `"start": "npx esbuild --bundle ./src/script.js --outfile=bundle.js"`

## Notes
References: https://www.myphysicslab.com/pendulum/double-pendulum-en.html

`PIVOT_FRAME_OF_REFERENCE` allows the pendulum to be in the pivot's frame of reference.

Might potentially add a joystick controller to manually control the pendulum and try to balance it myself.

Currently only the physics is implemented, as well as an applied force and a net horizontal force from the `m1` and `m2` balls.

Will use PPO algorithm for neural network (maybe implement genetic if I want to compare the two).