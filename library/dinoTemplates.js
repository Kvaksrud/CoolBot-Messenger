// json_merger
const json_merger = require('json_merger');

/*
 * Template for dino injections
 */
// Old Herbies
const AnkyAdult = {
	"CharacterClass": "Anky",
	"DNA": "",
	"Location_Isle_V3": "X=-347180.500 Y=477319.313 Z=-24978.604",
	"Rotation_Isle_V3": "P=0.000000 Y=-78.896469 R=0.000000",
	"Growth": "1.0",
	"Hunger": "544",
	"Thirst": "60",
	"Stamina": "120",
	"Health": "5443",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Anky;",
}
const AustroAdult = {
	"CharacterClass": "Austro",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "65",
	"Thirst": "45",
	"Stamina": "180",
	"Health": "250",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Austro;",
}
const CamaraAdult = { // Rar liten langhals
	"CharacterClass": "Camara",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "7600",
	"Thirst": "100",
	"Stamina": "350",
	"Health": "12000",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Camara;",
}
const PuertaAdult = { // Stor jævla langhals
    "CharacterClass": "Puerta",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "14968",
	"Thirst": "100",
	"Stamina": "100",
	"Health": "49895",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Puerta;",
}
const ShantAdult = {
    "CharacterClass": "Shant",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "1179",
	"Thirst": "60",
	"Stamina": "140",
	"Health": "11793",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Shant;",
}
const StegoAdult = {
	"CharacterClass": "Stego",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "344",
	"Thirst": "100",
	"Stamina": "180",
	"Health": "4883",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Stego;",
}
const TheriAdult = {
	"CharacterClass": "Theri",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "453",
	"Thirst": "50",
	"Stamina": "130",
	"Health": "4536",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": true,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Theri;",
}

// Old Carnies
const AcroAdult = {
	"CharacterClass": "Acro",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "1197",
	"Thirst": "80",
	"Stamina": "110",
	"Health": "4790",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Acro;",
}
const AlbertAdult = {
	"CharacterClass": "Albert",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "900",
	"Thirst": "60",
	"Stamina": "160",
	"Health": "3000",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Albert;",
}
const BaryAdult = {
	"CharacterClass": "Bary",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "326",
	"Thirst": "60",
	"Stamina": "135",
	"Health": "1450",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Bary;",
}
const HerreraAdult = {
	"CharacterClass": "Herrera",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "60",
	"Thirst": "60",
	"Stamina": "130",
	"Health": "500",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "Herrera;",
}
const SpinoAdult = {
    "CharacterClass": "Spino",
    "DNA": "",
    "Growth": "1.0",
    "Hunger": "2721",
    "Thirst": "100",
    "Stamina": "120",
    "Health": "9071",
    "BleedingRate": "0",
    "Oxygen": "40",
    "bGender": true,
    "bIsResting": true,
    "bBrokenLegs": false,
    "ProgressionPoints": "0",
    "ProgressionTier": "1",
    "UnlockedCharacters": "Spino;",
}

// New Herbies
const DiabloAdult = {
	"CharacterClass": "DiabloAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "155",
	"Thirst": "50",
	"Stamina": "100",
	"Health": "3250",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "DiabloAdultS;",
}
const DryoAdult = {
	"CharacterClass": "DryoAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "80",
	"Thirst": "30",
	"Stamina": "250",
	"Health": "500",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "DryoAdultS;",
}
const GalliAdult = {
	"CharacterClass": "GalliAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "220",
	"Thirst": "30",
	"Stamina": "400",
	"Health": "800",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "GalliAdultS;",
}
const MaiaAdult = {
	"CharacterClass": "MaiaAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "275",
	"Thirst": "60",
	"Stamina": "180",
	"Health": "2868",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "MaiaAdultS;",
}
const PachyAdult = {
	"CharacterClass": "PachyAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "110",
	"Thirst": "60",
	"Stamina": "175",
	"Health": "1300",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": true,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "PachyAdultS;",
}
const ParaAdult = {
	"CharacterClass": "ParaAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "840",
	"Thirst": "60",
	"Stamina": "250",
	"Health": "3600",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "ParaAdultS;",
}
const TrikeAdult = {
    "CharacterClass": "TrikeAdultS",
    "DNA": "",
    "Growth": "1.0",
    "Hunger": "1500",
    "Thirst": "100",
    "Stamina": "200",
    "Health": "8200",
    "BleedingRate": "0",
    "Oxygen": "40",
    "bGender": false,
    "bIsResting": false,
    "bBrokenLegs": false,
    "ProgressionPoints": "0",
    "ProgressionTier": "1",
    "UnlockedCharacters": "TrikeSubS;TrikeAdultS;"
}

// New Carnies
const AlloAdult = {
	"CharacterClass": "AlloAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "816",
	"Thirst": "60",
	"Stamina": "200",
	"Health": "2800",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "AlloAdultS;",
}
const CarnoAdult = {
	"CharacterClass": "CarnoAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "800",
	"Thirst": "60",
	"Stamina": "440",
	"Health": "2170",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "CarnoAdultS;",
}
const CeratoAdult = {
	"CharacterClass": "CeratoAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "600",
	"Thirst": "60",
	"Stamina": "150",
	"Health": "2250",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "CeratoAdultS;",
}
const DiloAdult = {
	"CharacterClass": "DiloAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "350",
	"Thirst": "80",
	"Stamina": "150",
	"Health": "1050",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "DiloAdultS;",
}
const GigaAdult = {
	"CharacterClass": "GigaAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "2285",
	"Thirst": "100",
	"Stamina": "100",
	"Health": "6000",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "GigaAdultS;",
	}
const SuchoAdult = {
	"CharacterClass": "SuchoAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "500",
	"Thirst": "60",
	"Stamina": "200",
	"Health": "3600",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "SuchoAdultS;",
}
const RexAdult = {
	"CharacterClass": "RexAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "2150",
	"Thirst": "90",
	"Stamina": "100",
	"Health": "6500",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "RexAdultS;",
}
const UtahAdult = {
	"CharacterClass": "UtahAdultS",
	"DNA": "",
	"Growth": "1.0",
	"Hunger": "300",
	"Thirst": "60",
	"Stamina": "300",
	"Health": "1200",
	"BleedingRate": "0",
	"Oxygen": "40",
	"bGender": false,
	"bIsResting": false,
	"bBrokenLegs": false,
	"ProgressionPoints": "0",
	"ProgressionTier": "1",
	"UnlockedCharacters": "UtahAdultS;",
}

// Array of dino's available for injection
const InjectionNames = [
    // Old herbies
    'anky', 'austro', 'camara', 'puerta', 'shant', 'stego', 'theri',
    // Old carnies
    'acro', 'albert', 'bary', 'herrera', 'spino',
    // New herbies
    'diablo', 'dryo', 'galli', 'maia', 'pachy', 'para', 'trike',
    // New carnies
    'allo', 'carno', 'cerato', 'dilo', 'giga', 'sucho', 'rex', 'utah'
]

/*
 * Generate function
 */
function generate (dino,gender,player){
    // Select dino template
    switch (dino){
        // Old herbies
        case 'anky':
            dinoTemplate = AnkyAdult;
            break;
        case 'austro':
            dinoTemplate = AustroAdult;
            break;
        case 'camara':
            dinoTemplate = CamaraAdult;
            break;
        case 'puerta':
            dinoTemplate = PuertaAdult;
            break;
        case 'shant':
            dinoTemplate = ShantAdult;
            break;
        case 'stego':
            dinoTemplate = StegoAdult;
            break;
        case 'theri':
            dinoTemplate = TheriAdult;
            break;
        
        // Old Carnies
        case 'acro':
            dinoTemplate = AcroAdult;
            break;
        case 'albert':
            dinoTemplate = AlbertAdult;
            break;
        case 'bary':
            dinoTemplate = BaryAdult;
            break;
        case 'herrera':
            dinoTemplate = HerreraAdult;
            break;
        case 'spino':
            dinoTemplate = SpinoAdult;
            break;
        
        // New herbies
        case 'diablo':
            dinoTemplate = DiabloAdult;
            break;
        case 'dryo':
            dinoTemplate = DryoAdult;
            break;
        case 'galli':
            dinoTemplate = GalliAdult;
            break;
        case 'maia':
            dinoTemplate = MaiaAdult;
            break;
        case 'pachy':
            dinoTemplate = PachyAdult;
            break;
        case 'para':
            dinoTemplate = ParaAdult;
            break;
        case 'trike':
            dinoTemplate = TrikeAdult;
            break;

        // New carnies
        case 'allo':
            dinoTemplate = AlloAdult;
            break;
        case 'carno':
            dinoTemplate = CarnoAdult;
            break;
        case 'cerato':
            dinoTemplate = CeratoAdult;
            break;
        case 'dilo':
            dinoTemplate = DiloAdult;
            break;
        case 'giga':
            dinoTemplate = GigaAdult;
            break;
        case 'sucho':
            dinoTemplate = SuchoAdult;
            break;
        case 'rex':
            dinoTemplate = RexAdult;
            break;
        case 'utah':
            dinoTemplate = UtahAdult;
            break;

        // Default reply is empty
        default:
            return;
    }
    
    // throw if invalid dino template
    if(!Object.keys(dinoTemplate).length === true) return; // Invalid dino template

    // Set female if specified
    if(gender === 'f'){
        dinoTemplate.bGender = true;
    }

    // Inject template on player
    const injectedDino = json_merger.merge(player,dinoTemplate); // Template overwrites player object properties

    // Return finished product
    return injectedDino;
}

// Export functions / variables
module.exports = {
    InjectionNames,
    generate
}