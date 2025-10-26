import { lerp } from './utils.js';

export class AIController {
    constructor(sceneProperties) {
        this.targetProperties = sceneProperties; // The properties to smoothly animate towards
        this.currentProperties = { ...sceneProperties }; // The currently rendered properties
        this.isStarted = false;
    }

    start() {
        if (this.isStarted) return;
        this.isStarted = true;
        this.fetchNewProperties();
        setInterval(() => this.fetchNewProperties(), 20000); // Fetch new mood every 20 seconds
    }

    // This method will be called in the main animation loop to smoothly update properties
    update() {
         for (const key in this.targetProperties) {
            if (typeof this.targetProperties[key] === 'number') {
                this.currentProperties[key] = lerp(this.currentProperties[key], this.targetProperties[key], 0.02);
            } else {
                this.currentProperties[key] = this.targetProperties[key];
            }
        }
    }

    async fetchNewProperties() {
        console.log("AI is thinking of a new possibility...");
        try {
            const completion = await websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an AI that directs the visual mood of an abstract particle simulation called 'The Spirit of Possibility'. Your goal is to create a dynamic, evolving, and aesthetically pleasing experience.
Respond with a JSON object containing new parameters for the scene. Do not include any other text or markdown.
The JSON schema is:
{
  "mood_description": "<A short, evocative description of the new mood>",
  "background_alpha": <A float between 0.05 (long trails) and 0.5 (sharp)>,
  "hue_min": <An integer between 0 and 360 for the particle color range start>,
  "hue_max": <An integer between 0 and 360 for the particle color range end>,
  "spirit_intensity": <A float between 0.05 and 0.3 for the spirit's glow intensity>,
  "particle_connection_opacity": <A float between 0.2 and 1.0>
}

Here are some example moods to inspire you:
- "Electric Awakening": High contrast, bright colors (e.g., cyan/magenta), sharp trails.
- "Cosmic Slumber": Deep blues and purples, soft glows, long, dreamy trails.
- "Verdant Growth": Greens and yellows, gentle movement, medium trails.
- "Fiery Nebula": Reds, oranges, and pinks, intense glow, chaotic movement.

Based on the current time and a sense of progression, generate a new set of parameters.`},
                    {
                        role: "user",
                        content: "Evoke a new possibility for the scene."
                    }
                ],
                json: true,
            });

            const newProps = JSON.parse(completion.content);
            console.log("AI suggested new mood:", newProps.mood_description);

            // Validate and update target properties
            if (typeof newProps.background_alpha === 'number') this.targetProperties.background_alpha = newProps.background_alpha;
            if (typeof newProps.hue_min === 'number') this.targetProperties.hue_min = newProps.hue_min;
            if (typeof newProps.hue_max === 'number') this.targetProperties.hue_max = newProps.hue_max;
            if (typeof newProps.spirit_intensity === 'number') this.targetProperties.spirit_intensity = newProps.spirit_intensity;
            if (typeof newProps.particle_connection_opacity === 'number') this.targetProperties.particle_connection_opacity = newProps.particle_connection_opacity;

        } catch (error) {
            console.error("Error fetching new properties from AI:", error);
        }
    }
}