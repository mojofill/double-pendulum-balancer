export function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

export function sigmoid_derivative(x) {
    return sigmoid(x) * (1 - sigmoid(x));
}

export class Neuron {
    constructor(layer_index) {
        // specific data for neurons
        // shiiit - every neuron has specific weights attached to every connection to the previous layer --- that might be why my old code was so shitty. thats interesting and makes total sense
        this.weights = []; // updated layer in initialization
        this.gradients = [];
        this.bias = Math.random() * 2 - 1;
        this.value = 0;
        
        // needed for activation function
        this.layer_index = layer_index;

        // everything else is for back propagation
        this.delta = 0; // gradient of cost
        this.gradients = []; // gradients for each weight (connected to the neuron before)
        this.bias_gradient = 0;
    }

    activate(layers) {
        // just take all the data from the one before to activate this layer
        if (this.layer_index === 0) return this.value; // the input layer cant evaluate anything, just return initial value
        let sum = 0;
        const previousLayer = layers[this.layer_index-1]
        for (let i = 0; i < previousLayer.neuron_amount; i++) {
            const neuron = previousLayer.get(i);
            sum += neuron.weights[i] * neuron.value;
        }

        sum += this.bias;
        
        this.value = sigmoid(sum);
    }
}

export class Layer {
    constructor(neuron_amount, layer_index) {
        this.layer_index = layer_index;
        this.neurons = [];

        for (let i = 0; i < neuron_amount; i++) {
            this.neurons.push(new Neuron(layer_index));
        }
    }

    set(n, v) {
        this.neurons[n] = v;
    }

    get(n) {
        return this.neurons[n];
    }
}

export default class NeuralNetwork {
    constructor(inputArr, num_layers, neurons_per_layer, learning_rate) {
        this.num_layers = num_layers;
        this.neurons_per_layer = neurons_per_layer;
        this.learning_rate = learning_rate;

        this.layers = [];

        for (let layer_index = 0; layer_index < num_layers; layer_index++) {
            this.layers.push(new Layer(neurons_per_layer[layer_index], layer_index));
        }

        // initialize input
        const inputLayer = this.layers[0];
        for (let i = 0; i < inputLayer.neuron_amount; i++) {
            inputLayer.set(i, inputArr[i]);
        }

        // update weights for each neuron
        for (let l = 1; l < num_layers; l++) {
            const curr_layer = this.layers[l];
            const prev_layer = this.layers[l-1];

            for (let curr_i = 0; curr_i < curr_layer.neuron_amount; curr_i++) {
                const curr_neuron = curr_layer.get(curr_i);

                curr_neuron.weights = []; // just for safety
                curr_neuron.bias = 0;

                for (let prev_i = 0; prev_i < prev_layer.neuron_amount; prev_i++) {
                    // map every prev neuron to this curr neuron in the weight array
                    curr_neuron.weights.push(2 * Math.random() - 1);
                }
            }
        }
    }

    // activate all neurons
    /** Returns output layer */
    evaluate() {
        // feedforward - information only propagates forward
        // start from the second one, cuz u activate each neuron from the layer before, and there is no layer behind the first one
        for (let i = 1; i < this.num_layers; i++) {
            const currLayer = this.layers[i];
            for (let k = 0; k < currLayer.neuron_amount; k++) {
                const neuron = currLayer.get(k);
                neuron.activate(this.layers); // activate each neuron
            }
        }
        
        return this.layers[this.num_layers - 1]; // return output layer
    }

    /** **THIS IS TODO CUZ IDK WHAT IM DOING RN** */
    backpropagate(expectedOutput) {
        // TODO: put this in terms of PPO later. right now i just want to understand back propagation

        const outputLayer = this.layers[this.layers.length - 1];

        // calculate gradient delta for output layer
        for (let i = 0; i < outputLayer.length; i++) {
            const neuron = outputLayer.get(i);
            const error = neuron.value - expectedOutput.get(i); // output error
            neuron.delta = error * sigmoid_derivative(neuron.value); // gradient delta math
        }

        // TODO: could add tracking for total error to monitor convergence

        // we've updated all the gradients in the output layer neurons. now we back propagate deltas to hidden layers
        for (let l = this.layers.length - 2; l > 0; l--) { // exclude input layer: thats why l > 0 and not l >= 0
            const layer = this.layers[l];
            const next_layer = this.layers[l + 1]; // we going back from the first hidden layer and computing the layers gradient in connection to the layer in front of it; thats how backpropagation works. each update requires the gradient from the layer above
            for (let i = 0; i < layer.length; i++) {// iterate thru each neuron in current layer
                const neuron = layer.get(i);
                let sum = 0;
                for (let i = 0; i < next_layer.length; i++) { // calculate all gradients relative to the next layer
                    const nextNeuron = next_layer.get(i);
                    sum += nextNeuron.delta * nextNeuron.weights[i];
                }
                neuron.delta = sum * sigmoid_derivative(neuron.value);
            }
        }

        // update weights and biases using deltas. we can go forward thru the network or backwards it doesnt matter since all values are static and independent now for the gradient math
        for (let l = 1; l < this.layers.length; l++) { // exclude input layer
            const layer = this.layers[l];
            const prev_layer = this.layers[l - 1];
            for (let i = 0; i < layer.neuron_amount; i++) {
                const neuron = layer.get(i);
                for (let j = 0; j < prev_layer.length; j++) {
                    const prev_neuron = prev_layer.get(j);
                    const gradient = neuron.delta * prev_neuron.value; // gradient for weight
                    neuron.gradients[j] = gradient;
                    neuron.weights[j] -= this.learning_rate * gradient; // update weight. - because gradient descent, but later for PPO it should be positive for gradient ascent
                }
                // update bias
                neuron.bias_gradient = neuron.delta; // gradient for bias
                neuron.bias -= this.learning_rate * neuron.bias_gradient; // update bias
            }
        }
    }
}