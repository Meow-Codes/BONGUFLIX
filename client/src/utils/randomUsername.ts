const prefixes = [
    "Alpha", "Zen", "Ruby", "Pixel", "Captain",
    "Luna", "Quantum", "Emerald", "Serenity", "Sushi",
    "Mountain", "Phoenix", "Electric", "Songbird", "Tech",
    "Silver", "Midnight", "Tango", "Cosmic", "Jazz",
    "Velvet", "Neon", "Ghostly", "Ballet", "Delta",
    "Echo", "Solar", "Whispering", "Pirate", "Harmony",
    "Cyber", "Melody", "Quasar", "Crimson", "Enigma",
    "Stardust", "Techno", "Lunar", "Rogue", "Dream"
];

const suffixes = [
    "Wolf", "Master", "Red", "Pirate", "Adventure",
    "Lovegood", "Coder", "Enigma", "Seeker", "Samurai",
    "Mover", "Fire", "Echo", "Soul", "Titan",
    "Shadow", "Mystic", "Tornado", "Crafter", "Journey",
    "Vortex", "Nebula", "Gazer", "Blossom", "Dynamo",
    "Eagle", "Symphony", "Willow", "Pioneer", "Hawk",
    "Scribe", "Mistress", "Quest", "Comet", "Explorer",
    "Strider", "Trance", "Lullaby", "Rider", "Dancer"
];

function getRandomInt(min : any, max : any) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const RandomUsername = () => {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    let ending = "";

    const endings = ["2048", String(getRandomInt(2024, 2048)), "_", "_", "_", "_", "_"];

    ending = endings[Math.floor(Math.random() * endings.length)];

    return `${prefix}${suffix}${ending}`;
}

export default RandomUsername;