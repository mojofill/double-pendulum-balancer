export function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x)); // might need relu or something else -- sigmoid is getting outdated
}

export default class Neuron {
    weight = (Math.random() * 2 - 1);
    bias = (Math.random() * 2 - 1);
    value = 0;
    layerIndex;

    constructor(layerIndex) {
        this.layerIndex = layerIndex;
    }

    activate(layers) {
        if (this.layerIndex === 0) return this.value; // the input layer cant evaluate anything, just return initial value
        let sum = 0;
        const previousLayer = layers[this.layerIndex-1]
        for (let i = 0; i < previousLayer.neuronAmount; i++) {
            const neuron = previousLayer.get(i);
            sum += neuron.weight * neuron.value;
        }

        sum += this.bias;
        
        return sigmoid(sum);
    }

    // mutate() you would need this for genetic, but im tryna use PPO algorithm
}