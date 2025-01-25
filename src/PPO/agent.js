import NeuralNetwork from "./neural_network";

export default class Agent {
    constructor(actor_n_layers, actor_neurons_per_layer, critic_n_layers, critic_neurons_per_layer) {
        this.actor = new NeuralNetwork(actor_n_layers, actor_neurons_per_layer);
        this.critic = new NeuralNetwork(critic_n_layers, critic_neurons_per_layer);
    }
}