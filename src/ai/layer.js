import Neuron from "./neuron";

export default class Layer {
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
}