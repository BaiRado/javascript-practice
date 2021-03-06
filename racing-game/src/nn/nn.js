import Car from '../game/car.js';
import { game } from '../../index.js';
import { population } from './trained.js';


// Gen number tracker
export let genNumber = 0,
    prevGenerationJSON = null,
    prevFittestJSON = [];

function updateGenNumber() {
    document.getElementById("genNumber").innerHTML = "Current generation: " + genNumber;
}

// Trained population
let USE_TRAINED_POP = useTrainedCheckbox.checked;
useTrainedCheckbox.onclick = function () {
    USE_TRAINED_POP = useTrainedCheckbox.checked;
    game.init();
    genNumber = 0;
    updateGenNumber();
}

export default class Neat {
    constructor() {
        this.neat;
        this.POP_SIZE = 150;
        this.MUTATION_RATE = 0.3;
        this.ELITISM = Math.round(0.3 * this.POP_SIZE);


        // Scores
        this.highestScore = 0;
        this.totalHighestScore = 0;
    }

    // NEAT init
    initNeat() {
        const Methods = neataptic.methods;

        this.neat = new neataptic.Neat(
            10,
            2,
            null,
            {
                mutation: [
                    Methods.mutation.ADD_NODE,
                    Methods.mutation.SUB_NODE,
                    Methods.mutation.ADD_CONN,
                    Methods.mutation.SUB_CONN,
                    Methods.mutation.MOD_WEIGHT,
                    Methods.mutation.MOD_BIAS,
                    Methods.mutation.MOD_ACTIVATION,
                    Methods.mutation.ADD_GATE,
                    Methods.mutation.SUB_GATE,
                    Methods.mutation.ADD_SELF_CONN,
                    Methods.mutation.SUB_SELF_CONN,
                    Methods.mutation.ADD_BACK_CONN,
                    Methods.mutation.SUB_BACK_CONN
                ],
                popsize: this.POP_SIZE,
                mutationRate: this.MUTATION_RATE,
                elitism: this.ELITISM
            }
        );

        if (USE_TRAINED_POP) {
            this.neat.population = this.getTrainedPopulation();
        }
    }

    //  Start the evaluation of the current generation
    startEvaluation(game) {
        let neat = this.neat;
        let cars = [];
        this.highestScore = 0;

        for (let genome in neat.population) {
            let score = neat.population[genome].score;
            if (score > this.highestScore) this.highestScore = score;
            if (score > this.totalHighestScore) this.totalHighestScore = score;

            genome = neat.population[genome];
            cars.push(new Car(game, genome));
        }
        console.log('| highest:', this.highestScore, '| total highest:', this.totalHighestScore);
        return cars;
    }

    // End the evaluation of the current generation
    endEvaluation(game) {
        let neat = this.neat;

        console.log("______________________________")
        console.log('Generation:', neat.generation);
        console.log('fittest:', neat.getFittest());
        console.log('| average:', neat.getAverage(), '| fittest:', neat.getFittest().score);

        genNumber++;
        updateGenNumber();

        if (prevFittestJSON.length === this.POP_SIZE) prevFittestJSON.shift();
        prevFittestJSON.push(neat.getFittest().toJSON());
        prevGenerationJSON = neat.export();

        neat.sort();
        let newPopulation = [];
        // Elitism
        for (let i = 0; i < neat.elitism; i++) {
            newPopulation.push(neat.population[i]);
        }

        // Breed the next individuals
        for (let i = 0; i < neat.popsize - neat.elitism; i++) {
            newPopulation.push(neat.getOffspring());
        }

        // Replace the old population with the new population
        neat.population = newPopulation;
        neat.mutate();

        neat.generation++;
        return this.startEvaluation(game);
    }

    getTrainedPopulation() {
        let newPop = [];
        for (let i = 0; i < this.POP_SIZE; i++) {
            let json = population[i % population.length];
            newPop[i] = neataptic.Network.fromJSON(json);
        }
        return newPop;
    }
}