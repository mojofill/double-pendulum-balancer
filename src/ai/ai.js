import Layer from "./layer";

export default class AI {
    layerAmount = 4; // do i really need that many. whatever i'll see
    layers = [];
    neuronsInLayer = [
        // input layer - decide on how many later
        4, 3, 1
    ]

    constructor() {
        for (let i = 0; i < this.layerAmount; i++) {
            this.layers.push(new Layer(this.neuronsInLayer[i], i));
        }
    }
}