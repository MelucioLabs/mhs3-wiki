-- ============================================
-- MHS3 Wiki - Database Schema & Seed Data
-- ============================================

-- Monsties
CREATE TABLE IF NOT EXISTS monsties (
  id SERIAL PRIMARY KEY,
  name_de VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  element VARCHAR(50),
  attack_type VARCHAR(50),
  ride_action VARCHAR(100),
  habitat_de VARCHAR(100),
  habitat_en VARCHAR(100),
  description_de TEXT,
  description_en TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Genes (Rite of Channeling)
CREATE TABLE IF NOT EXISTS genes (
  id SERIAL PRIMARY KEY,
  name_de VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  gene_type VARCHAR(50) NOT NULL,
  element VARCHAR(50),
  skill_name_de VARCHAR(100),
  skill_name_en VARCHAR(100),
  description_de TEXT,
  description_en TEXT
);

-- Monster Bestiary
CREATE TABLE IF NOT EXISTS monsters (
  id SERIAL PRIMARY KEY,
  name_de VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  species VARCHAR(100),
  weakness VARCHAR(50),
  habitat_de VARCHAR(100),
  habitat_en VARCHAR(100),
  description_de TEXT,
  description_en TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name_de VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  rarity INTEGER DEFAULT 1,
  stats JSONB DEFAULT '{}',
  materials_de JSONB DEFAULT '[]',
  materials_en JSONB DEFAULT '[]',
  description_de TEXT,
  description_en TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Full-Text Search indexes
CREATE INDEX IF NOT EXISTS idx_monsties_fts_de ON monsties USING GIN (to_tsvector('german', name_de || ' ' || COALESCE(description_de, '')));
CREATE INDEX IF NOT EXISTS idx_monsties_fts_en ON monsties USING GIN (to_tsvector('english', name_en || ' ' || COALESCE(description_en, '')));
CREATE INDEX IF NOT EXISTS idx_monsters_fts_de ON monsters USING GIN (to_tsvector('german', name_de || ' ' || COALESCE(description_de, '')));
CREATE INDEX IF NOT EXISTS idx_monsters_fts_en ON monsters USING GIN (to_tsvector('english', name_en || ' ' || COALESCE(description_en, '')));
CREATE INDEX IF NOT EXISTS idx_equipment_fts_de ON equipment USING GIN (to_tsvector('german', name_de || ' ' || COALESCE(description_de, '')));
CREATE INDEX IF NOT EXISTS idx_equipment_fts_en ON equipment USING GIN (to_tsvector('english', name_en || ' ' || COALESCE(description_en, '')));

-- ============================================
-- Seed Data
-- ============================================
-- element, attack_type, ride_action, species, weakness: English keys
-- Translated via locale files in the frontend
-- Attack Types: power / speed / technical (DE: Kraft / Geschwindigkeit / Technik)
-- Elements: fire / water / thunder / ice / dragon / none
-- Ride Actions: fly / swim / climb / dive / jump / stealth (comma-separated if multiple)

-- ============================================
-- MONSTIES (84 confirmed rideable monsters)
-- ============================================
INSERT INTO monsties (name_de, name_en, element, attack_type, ride_action, habitat_de, habitat_en, description_de, description_en) VALUES

-- === BIRD WYVERNS ===
('Velocidrome', 'Velocidrome', 'none', 'speed', 'jump', 'Azuria', 'Azuria', 'Der Anführer eines Velociprey-Rudels. Schnell und wendig mit scharfen Klauen.', 'The leader of a Velociprey pack. Fast and agile with sharp claws.'),
('Groß-Izuchi', 'Great Izuchi', 'none', 'speed', 'jump', 'Canalta-Waldland', 'Canalta Timberland', 'Der Anführer eines Izuchi-Trios. Greift mit seinem sichelförmigen Schwanz an.', 'The leader of an Izuchi trio. Attacks with its sickle-shaped tail.'),
('Kulu-Ya-Ku', 'Kulu-Ya-Ku', 'none', 'technical', 'jump', 'Tarkuan', 'Tarkuan', 'Ein intelligenter Wyvern der Steine und Eier als Werkzeuge und Waffen nutzt.', 'An intelligent wyvern that uses rocks and eggs as tools and weapons.'),
('Yian Kut-Ku', 'Yian Kut-Ku', 'fire', 'technical', 'fly', 'Azuria', 'Azuria', 'Ein vogelähnlicher Wyvern mit großen Ohren und einer Vorliebe für Feuerbälle.', 'A bird-like wyvern with large ears and a fondness for fireballs.'),
('Blauer Yian Kut-Ku', 'Blue Yian Kut-Ku', 'fire', 'technical', 'fly', 'Azuria', 'Azuria', 'Eine Unterart des Yian Kut-Ku mit bläulichem Gefieder und stärkeren Feuerattacken.', 'A subspecies of Yian Kut-Ku with bluish plumage and stronger fire attacks.'),
('Gypceros', 'Gypceros', 'none', 'power', 'fly', 'Azuria', 'Azuria', 'Ein hinterhältiger Wyvern der Blitzschläge aus seinem Kamm erzeugt und sich tot stellt.', 'A sneaky wyvern that generates flashes from its crest and plays dead.'),
('Lila Gypceros', 'Purple Gypceros', 'none', 'power', 'fly', 'Azuria', 'Azuria', 'Eine giftigere Variante des Gypceros mit violetter Färbung und stärkerem Gift.', 'A more venomous variant of Gypceros with purple coloring and stronger poison.'),
('Aknosom', 'Aknosom', 'fire', 'technical', 'fly', 'Azuria', 'Azuria', 'Ein kranichartiger Wyvern mit einem brennenden Kamm, der elegante Feuerattacken einsetzt.', 'A crane-like wyvern with a blazing crest that uses elegant fire attacks.'),
('Pukei-Pukei', 'Pukei-Pukei', 'none', 'technical', 'fly', 'Azuria', 'Azuria', 'Ein bunter vogelähnlicher Wyvern der Gift versprüht und Nüsse sammelt.', 'A colorful bird-like wyvern that sprays poison and collects nuts.'),
('Yian Garuga', 'Yian Garuga', 'none', 'power', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Ein aggressiver und gerissener Wyvern mit hartem Panzer und Giftangriffen.', 'An aggressive and cunning wyvern with hard armor and poison attacks.'),
('Narbiger Yian Garuga', 'Deadeye Yian Garuga', 'none', 'power', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Eine abweichende Form des Yian Garuga. Noch aggressiver und mit stärkerem Gift.', 'A deviant form of Yian Garuga. Even more aggressive with stronger poison.'),

-- === FANGED BEASTS ===
('Arzuros', 'Arzuros', 'none', 'power', 'jump', 'Azuria', 'Azuria', 'Ein bärenartiges Monster mit einer Vorliebe für Honig und kräftigen Prankenangriffen.', 'A bear-like monster with a fondness for honey and powerful paw strikes.'),
('Bishaten', 'Bishaten', 'none', 'technical', 'fly, climb', 'Canalta-Waldland', 'Canalta Timberland', 'Ein akrobatisches Tierwesen mit einem Greifschwanz das mit Früchten jongliert und sie als Waffen wirft.', 'An acrobatic beast with a prehensile tail that juggles fruit and hurls them as weapons.'),
('Blut-Bishaten', 'Blood Orange Bishaten', 'fire', 'technical', 'fly, climb', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Bishaten die mit explosiven Früchten angreift und Sprengschaden verursacht.', 'A subspecies of Bishaten that attacks with explosive fruits dealing blast damage.'),
('Blangonga', 'Blangonga', 'ice', 'power', 'climb', 'Serathis', 'Serathis', 'Ein aggressiver Primat der Eisbrocken schleudert und sein Rudel Blangonas anführt.', 'An aggressive primate that hurls ice chunks and leads its pack of Blangas.'),
('Garangolm', 'Garangolm', 'none', 'power', 'climb', 'Serathis', 'Serathis', 'Ein gewaltiger Golem-artiger Primat der seine Fäuste mit Feuer und Wasser verstärkt.', 'A massive golem-like primate that empowers its fists with fire and water.'),
('Ajarakan', 'Ajarakan', 'fire', 'technical', 'climb', 'Canalta-Waldland', 'Canalta Timberland', 'Ein neues Tierwesen in MHS3 das Feuer kontrolliert und an Felswänden klettert.', 'A new beast in MHS3 that controls fire and climbs rock walls.'),
('Goss Harag', 'Goss Harag', 'ice', 'power', 'jump', 'Serathis', 'Serathis', 'Ein Yokai-artiges Tierwesen das sich Eisklingen aus seinem eigenen Atem formt.', 'A yokai-like beast that forms ice blades from its own breath.'),
('Canyne', 'Canyne', 'none', 'speed', 'climb, dive', 'Azuria', 'Azuria', 'Ein treuer hundeartiger Begleiter der klettern und graben kann.', 'A loyal canine companion that can climb and dig.'),

-- === AMPHIBIANS ===
('Chatacabra', 'Chatacabra', 'none', 'power', 'jump', 'Azuria', 'Azuria', 'Ein krötenartiges Amphibium das Felsen mit seinem Speichel verhärtet und als Waffen nutzt.', 'A toad-like amphibian that hardens rocks with its saliva and uses them as weapons.'),
('Tetranadon', 'Tetranadon', 'water', 'power', 'jump', 'Canalta-Waldland', 'Canalta Timberland', 'Ein gefräßiges Amphibium das Steine und Kies verschluckt und als Geschosse ausspuckt.', 'A gluttonous amphibian that swallows rocks and gravel, spitting them as projectiles.'),

-- === CARAPACEONS ===
('Shogun Ceanataur', 'Shogun Ceanataur', 'water', 'speed', 'dive', 'Tarkuan', 'Tarkuan', 'Eine riesige Krabbe die Monsterschädel als Panzer trägt und mit langen Sichelklauen angreift.', 'A giant crab that wears monster skulls as shells and attacks with long sickle claws.'),

-- === TEMNOCERANS ===
('Nerscylla', 'Nerscylla', 'none', 'technical', 'climb', 'Canalta-Waldland', 'Canalta Timberland', 'Eine riesige Spinne die sich in die Haut anderer Monster kleidet und Fallen aus Fäden webt.', 'A giant spider that wears the skin of other monsters and weaves traps from threads.'),
('Getarnte Nerscylla', 'Shrouded Nerscylla', 'none', 'technical', 'climb', 'Serathis', 'Serathis', 'Eine Unterart der Nerscylla mit stärkerer Giftfähigkeit und dichteren Fäden.', 'A subspecies of Nerscylla with stronger poison capability and denser webs.'),
('Rakna-Kadaki', 'Rakna-Kadaki', 'fire', 'technical', 'jump', 'Tarkuan', 'Tarkuan', 'Eine feurige Spinne die ihre Brut als Waffen einsetzt und explosive Fäden spinnt.', 'A fiery spider that deploys its brood as weapons and spins explosive threads.'),

-- === BRUTE WYVERNS ===
('Barroth', 'Barroth', 'water', 'power', 'dive', 'Tarkuan', 'Tarkuan', 'Ein gepanzerter Wyvern der sich in Schlamm wälzt und mit seinem massiven Kopf zuschlägt.', 'An armored wyvern that rolls in mud and strikes with its massive head.'),
('Jade-Barroth', 'Jade Barroth', 'ice', 'power', 'dive', 'Serathis', 'Serathis', 'Eine Unterart des Barroth die in eisigen Regionen lebt und Schnee statt Schlamm nutzt.', 'A subspecies of Barroth living in icy regions, using snow instead of mud.'),
('Anjanath', 'Anjanath', 'fire', 'power', 'jump', 'Azuria', 'Azuria', 'Ein aggressiver T-Rex-artiger Wyvern mit einem Nasenkamm der Feuer entfacht.', 'An aggressive T-Rex-like wyvern with a nasal crest that ignites fire.'),
('Fulgur-Anjanath', 'Fulgur Anjanath', 'thunder', 'power', 'jump', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart des Anjanath die Blitzenergie statt Feuer nutzt.', 'A subspecies of Anjanath that uses thunder energy instead of fire.'),
('Glavenus', 'Glavenus', 'fire', 'speed', 'jump', 'Tarkuan', 'Tarkuan', 'Ein Wyvern mit einem schwertartigen Schwanz den er durch Reibung zum Glühen bringt.', 'A wyvern with a blade-like tail that it heats to a glow through friction.'),
('Zornklingen-Glavenus', 'Hellblade Glavenus', 'fire', 'speed', 'jump', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form des Glavenus mit noch heißerem Schwert und explosiven Angriffen.', 'A deviant form of Glavenus with an even hotter blade and explosive attacks.'),
('Brachydios', 'Brachydios', 'none', 'power', 'jump', 'Tarkuan', 'Tarkuan', 'Ein explosiver Wyvern mit Fäusten, die mit hochexplosivem Schleim überzogen sind.', 'An explosive wyvern with fists coated in highly explosive slime.'),
('Dämonjho', 'Deviljho', 'dragon', 'power', 'jump', 'Verschiedene', 'Various', 'Ein ewig hungriger Tyrann der ganze Ökosysteme verschlingen kann.', 'An eternally hungry tyrant that can devour entire ecosystems.'),

-- === PISCINE WYVERNS ===
('Plesioth', 'Plesioth', 'water', 'speed', 'swim', 'Azuria', 'Azuria', 'Ein riesiger Fisch-Wyvern der aus dem Wasser springt und mit Wasserstrahlen angreift.', 'A giant piscine wyvern that leaps from water and attacks with water jets.'),
('Grüner Plesioth', 'Green Plesioth', 'water', 'speed', 'swim', 'Azuria', 'Azuria', 'Eine Unterart des Plesioth mit grüner Färbung und stärkeren Schlafangriffen.', 'A subspecies of Plesioth with green coloring and stronger sleep attacks.'),

-- === LEVIATHANS ===
('Königs-Ludroth', 'Royal Ludroth', 'water', 'power', 'swim', 'Azuria', 'Azuria', 'Ein schwammiger Leviathan der Wasser in seiner Mähne speichert und es zur Verteidigung nutzt.', 'A spongy leviathan that stores water in its mane and uses it for defense.'),
('Lila Ludroth', 'Purple Ludroth', 'water', 'power', 'swim', 'Canalta-Waldland', 'Canalta Timberland', 'Eine giftigere Unterart des Royal Ludroth mit giftiger Mähne und Giftangriffen.', 'A more venomous subspecies of Royal Ludroth with a poisonous mane.'),
('Somnacanth', 'Somnacanth', 'water', 'technical', 'swim', 'Canalta-Waldland', 'Canalta Timberland', 'Ein sirenenhafter Leviathan der Schlafpulver verbreitet und mit betörenden Melodien angreift.', 'A siren-like leviathan that spreads sleep powder and attacks with alluring melodies.'),
('Auroracanth', 'Aurora Somnacanth', 'ice', 'technical', 'swim', 'Serathis', 'Serathis', 'Eine Unterart des Somnacanth die in eisigen Gewässern lebt und Eisattacken einsetzt.', 'A subspecies of Somnacanth living in icy waters that uses ice attacks.'),
('Lagiacrus', 'Lagiacrus', 'thunder', 'power', 'swim', 'Azuria', 'Azuria', 'Der Herrscher der Meere, gefürchtet für seine verheerenden Blitzattacken unter Wasser.', 'Lord of the Seas, feared for its devastating thunder attacks underwater.'),
('Elfenbein-Lagiacrus', 'Ivory Lagiacrus', 'thunder', 'speed', 'swim', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Lagiacrus die an Land lebt und Blitzangriffe über den Boden leitet.', 'A subspecies of Lagiacrus living on land that channels thunder attacks through the ground.'),
('Mizutsune', 'Mizutsune', 'water', 'technical', 'swim', 'Canalta-Waldland', 'Canalta Timberland', 'Ein eleganter Leviathan, der Blasen nutzt um seine Beute auszurutschen und zu betäuben.', 'An elegant leviathan that uses bubbles to make prey slip and stun them.'),
('Karmaseher-Mizutsune', 'Soulseer Mizutsune', 'water', 'speed', 'swim', 'Serathis', 'Serathis', 'Eine abweichende Form des Mizutsune mit übernatürlichen Fähigkeiten und hellfire-infundierten Blasen.', 'A deviant form of Mizutsune with supernatural abilities and hellfire-infused bubbles.'),
('Almudron', 'Almudron', 'water', 'technical', 'swim, dive', 'Canalta-Waldland', 'Canalta Timberland', 'Ein schlangenartiger Leviathan der goldenen Schlamm kontrolliert und als Waffe einsetzt.', 'A serpentine leviathan that controls golden mud and uses it as a weapon.'),

-- === FANGED WYVERNS ===
('Tobi-Kadachi', 'Tobi-Kadachi', 'thunder', 'speed', 'fly, climb', 'Azuria', 'Azuria', 'Ein wendiger flugfähiger Wyvern der statische Elektrizität in seinem Fell aufbaut.', 'An agile airborne wyvern that builds up static electricity in its fur.'),
('Odogaron', 'Odogaron', 'none', 'speed', 'climb', 'Tarkuan', 'Tarkuan', 'Ein blutrünstiges Raubtier mit rasiermesserscharfen Klauen, extrem aggressiv.', 'A bloodthirsty predator with razor-sharp claws, extremely aggressive.'),
('Vulkan-Odogaron', 'Ebony Odogaron', 'dragon', 'speed', 'climb', 'Serathis', 'Serathis', 'Eine Unterart des Odogaron mit Drachenenergie und noch aggressiverem Verhalten.', 'A subspecies of Odogaron infused with dragon energy and even more aggressive behavior.'),
('Zinogre', 'Zinogre', 'thunder', 'power', 'climb', 'Canalta-Waldland', 'Canalta Timberland', 'Der Donnerwolf. Sammelt Blitzenergie mit Hilfe von Thunderbugs und entfesselt verheerende Angriffe.', 'The Thunder Wolf. Gathers electrical energy with Thunderbugs and unleashes devastating attacks.'),
('Höllen-Zinogre', 'Stygian Zinogre', 'dragon', 'technical', 'climb', 'Serathis', 'Serathis', 'Eine Variante des Zinogre die Drachenenergie statt Blitzenergie nutzt, angetrieben von Drachenbugs.', 'A variant of Zinogre that uses dragon energy instead of thunder, powered by Dragonbugs.'),
('Donnerschlag-Zinogre', 'Thunderlord Zinogre', 'thunder', 'power', 'climb', 'Canalta-Waldland', 'Canalta Timberland', 'Eine abweichende Form des Zinogre mit noch mächtigeren Blitzattacken und goldenem Blitzpanzer.', 'A deviant form of Zinogre with even more powerful thunder attacks and golden lightning armor.'),
('Lunagaron', 'Lunagaron', 'ice', 'speed', 'climb', 'Serathis', 'Serathis', 'Ein wolfsähnlicher Wyvern der sich mit Eis überzieht und in einen aufrechten Kampfmodus wechselt.', 'A wolf-like wyvern that coats itself in ice and shifts to an upright combat stance.'),
('Magnamalo', 'Magnamalo', 'none', 'speed', 'climb', 'Canalta-Waldland', 'Canalta Timberland', 'Der Fürst der Finsternis. Nutzt Hellfiregas als tödliche Waffe im Kampf.', 'The Wight of Malice. Uses hellfire gas as a deadly weapon in combat.'),

-- === FLYING WYVERNS ===
('Paolumu', 'Paolumu', 'none', 'technical', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Ein pelziger Wyvern der sich aufblasen kann um durch die Luft zu gleiten und Windstöße zu erzeugen.', 'A furry wyvern that inflates itself to glide through the air and create gusts of wind.'),
('Khezu', 'Khezu', 'thunder', 'technical', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Ein blinder Höhlenwyvern der seine Beute über Geruch und elektrische Impulse aufspürt.', 'A blind cave wyvern that tracks prey through scent and electrical impulses.'),
('Roter Khezu', 'Red Khezu', 'thunder', 'technical', 'fly', 'Tarkuan', 'Tarkuan', 'Eine rötliche Unterart des Khezu mit stärkeren elektrischen Angriffen und höherer Aggressivität.', 'A reddish subspecies of Khezu with stronger electrical attacks and higher aggression.'),
('Rathian', 'Rathian', 'fire', 'speed', 'fly', 'Azuria', 'Azuria', 'Die Königin des Landes. Verteidigt ihr Nest mit giftigen Schwanzangriffen und Feuerbällen.', 'The Queen of the Land. Defends her nest with venomous tail attacks and fireballs.'),
('Rosa Rathian', 'Pink Rathian', 'fire', 'speed', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart der Rathian mit stärkeren Giftangriffen und hartnäckigerem Kampfverhalten.', 'A subspecies of Rathian with stronger poison attacks and more persistent combat behavior.'),
('Giftstachel-Rathian', 'Dreadqueen Rathian', 'fire', 'speed', 'fly', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form der Rathian mit tödlichem Gift das sich schnell im Körper ausbreitet.', 'A deviant form of Rathian with deadly poison that spreads rapidly through the body.'),
('Legiana', 'Legiana', 'ice', 'speed', 'fly', 'Serathis', 'Serathis', 'Ein eleganter Wyvern der die Korallenhochebenen bewohnt und eisige Winde erzeugt.', 'An elegant wyvern inhabiting the Coral Highlands, creating icy winds.'),
('Barioth', 'Barioth', 'ice', 'technical', 'fly, climb', 'Serathis', 'Serathis', 'Ein Eiswyvern mit gewaltigen Saberzähnen. Beherrscht die verschneiten Gebiete mit Windangriffen.', 'An ice wyvern with massive saber teeth. Rules snowy regions with wind attacks.'),
('Sand-Barioth', 'Sand Barioth', 'none', 'technical', 'fly, climb', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Barioth die in Wüstengebieten lebt und Sandstürme erzeugt.', 'A subspecies of Barioth living in desert areas that creates sandstorms.'),
('Nargacuga', 'Nargacuga', 'none', 'speed', 'climb, stealth', 'Canalta-Waldland', 'Canalta Timberland', 'Ein flinker und tödlicher Wyvern, der aus den Schatten angreift. Extrem schnell und wendig.', 'A swift and deadly wyvern that attacks from the shadows. Extremely fast and agile.'),
('Grüner Nargacuga', 'Green Nargacuga', 'none', 'speed', 'climb, stealth', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart des Nargacuga mit grünem Fell und noch heimtückischeren Angriffen.', 'A subspecies of Nargacuga with green fur and even more treacherous attacks.'),
('Silberwind-Nargacuga', 'Silverwind Nargacuga', 'none', 'speed', 'climb, stealth', 'Serathis', 'Serathis', 'Eine abweichende Form des Nargacuga mit silbernem Fell und messerscharfen Windklingen.', 'A deviant form of Nargacuga with silver fur and razor-sharp wind blades.'),
('Astalos', 'Astalos', 'thunder', 'technical', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Ein aggressiver Wyvern der Elektrizität in seinen Flügeln, Schwanz und Kamm speichert.', 'An aggressive wyvern that stores electricity in its wings, tail, and crest.'),
('Blitzschlag-Astalos', 'Boltreaver Astalos', 'thunder', 'technical', 'fly', 'Serathis', 'Serathis', 'Eine abweichende Form des Astalos mit noch mächtigeren Blitzattacken und grünem Blitzschimmer.', 'A deviant form of Astalos with even more powerful thunder attacks and green lightning shimmer.'),
('Rathalos', 'Rathalos', 'fire', 'power', 'fly', 'Azuria', 'Azuria', 'Der König der Lüfte. Ein feuriger Wyvern mit gewaltigen Klauen und tödlichem Feueratem.', 'The King of the Skies. A fiery wyvern with mighty talons and deadly fire breath.'),
('Azurner Rathalos', 'Azure Rathalos', 'fire', 'power', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart des Rathalos mit blauer Panzerung die mehr Zeit in der Luft verbringt.', 'A subspecies of Rathalos with blue armor that spends more time in the air.'),
('Dunkelfeuer-Rathalos', 'Dreadking Rathalos', 'fire', 'power', 'fly', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form des Rathalos mit enormer Feuerkraft und königlicher Dominanz.', 'A deviant form of Rathalos with enormous firepower and regal dominance.'),
('Tigrex', 'Tigrex', 'none', 'speed', 'climb', 'Tarkuan', 'Tarkuan', 'Ein extrem aggressiver Wyvern der alles angreift was sich bewegt. Bekannt für seine ohrenbetäubenden Brüller.', 'An extremely aggressive wyvern that attacks anything that moves. Known for its ear-splitting roars.'),
('Brachial-Tigrex', 'Brute Tigrex', 'none', 'power', 'climb', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Tigrex mit noch lauteren Brüllern die Schockwellen erzeugen.', 'A subspecies of Tigrex with even louder roars that generate shockwaves.'),
('Düsterklauen-Tigrex', 'Grimclaw Tigrex', 'none', 'power', 'climb', 'Serathis', 'Serathis', 'Eine abweichende Form des Tigrex mit massiveren Klauen und zerstörerischer Kraft.', 'A deviant form of Tigrex with more massive claws and destructive power.'),
('Gravios', 'Gravios', 'fire', 'power', 'fly, dive', 'Tarkuan', 'Tarkuan', 'Ein massiver gepanzerter Wyvern der Hitzestrahlen und explosive Gase entfesselt.', 'A massive armored wyvern that unleashes heat beams and explosive gases.'),
('Schwarzer Gravios', 'Black Gravios', 'fire', 'power', 'fly, dive', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Gravios mit schwarzem Panzer und stärkeren Hitzestrahlen.', 'A subspecies of Gravios with black armor and stronger heat beams.'),
('Diablos', 'Diablos', 'none', 'power', 'dive', 'Tarkuan', 'Tarkuan', 'Der Tyrann der Wüste. Extrem territorial und stürzt sich aus dem Sand auf Eindringlinge.', 'The Desert Tyrant. Extremely territorial, bursting from the sand at intruders.'),
('Schwarze Diablos', 'Black Diablos', 'none', 'power', 'dive', 'Tarkuan', 'Tarkuan', 'Ein weiblicher Diablos in der Brunftzeit. Noch aggressiver als die normale Variante.', 'A female Diablos in heat. Even more aggressive than the normal variant.'),
('Blutbad-Diablos', 'Bloodbath Diablos', 'none', 'power', 'dive', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form des Diablos mit explosiven Angriffen und enormer Zerstörungskraft.', 'A deviant form of Diablos with explosive attacks and enormous destructive power.'),
('Seregios', 'Seregios', 'none', 'technical', 'fly', 'Tarkuan', 'Tarkuan', 'Ein hochaggressiver Wyvern mit rasiermesserscharfen Schuppen, die er wie Geschosse abfeuert.', 'A highly aggressive wyvern with razor-sharp scales that it launches like projectiles.'),
('Espinas', 'Espinas', 'fire', 'power', 'fly', 'Canalta-Waldland', 'Canalta Timberland', 'Ein normalerweise träger Wyvern mit giftigen Stacheln, der im Zorn extrem gefährlich wird.', 'A usually sluggish wyvern with venomous spines that becomes extremely dangerous when enraged.'),
('Rey Dau', 'Rey Dau', 'thunder', 'technical', 'fly', 'Tarkuan', 'Tarkuan', 'Ein neu entdeckter Wyvern der mit seinen Flügeln Gewitter erzeugt und Blitze lenkt.', 'A newly discovered wyvern that creates thunderstorms with its wings and directs lightning.'),

-- === ELDER DRAGONS ===
('Arkveld', 'Arkveld', 'dragon', 'technical', 'fly', 'Serathis', 'Serathis', 'Eine mysteriöse skelettartige Kreatur, die andere Monster kontrolliert und verschlingt.', 'A mysterious skeletal creature that controls and devours other monsters.'),
('Namielle', 'Namielle', 'water', 'technical', 'fly', 'Serathis', 'Serathis', 'Ein Älterer Drache der Wasser und Elektrizität kombiniert und seine Umgebung in ein biolumineszentes Meer verwandelt.', 'An Elder Dragon combining water and electricity, turning its surroundings into a bioluminescent sea.'),
('Velkhana', 'Velkhana', 'ice', 'technical', 'fly', 'Serathis', 'Serathis', 'Ein majestätischer Älterer Drache der alles um sich herum in Eis verwandelt.', 'A majestic Elder Dragon that turns everything around it to ice.'),
('Malzeno', 'Malzeno', 'dragon', 'speed', 'fly', 'Serathis', 'Serathis', 'Ein vampirischer Älterer Drache der Lebensenergie absaugt und sich damit stärkt.', 'A vampiric Elder Dragon that drains life energy and empowers itself.'),

-- === STORY / NAMED MONSTIES ===
('Ratha V', 'Ratha V', 'fire', 'power', 'fly', 'Verschiedene', 'Various', 'Die fünfte Inkarnation von Ratha, ein legendärer Rathalos mit besonderer Bindung zum Protagonisten.', 'The fifth incarnation of Ratha, a legendary Rathalos with a special bond to the protagonist.'),
('Plessie', 'Plessie', 'water', 'speed', 'swim', 'Azuria', 'Azuria', 'Ein freundlicher Grüner Plesioth und treuer Begleiter seit dem ersten Abenteuer.', 'A friendly Green Plesioth and loyal companion since the first adventure.'),
('Gravy', 'Gravy', 'fire', 'power', 'fly, dive', 'Tarkuan', 'Tarkuan', 'Ein benannter Gravios-Begleiter mit starkem Panzer und Hitzestrahlen.', 'A named Gravios companion with strong armor and heat beams.'),
('Dee', 'Dee', 'fire', 'speed', 'jump', 'Tarkuan', 'Tarkuan', 'Ein benannter Glavenus-Begleiter mit glühendem Schwert-Schwanz.', 'A named Glavenus companion with a glowing blade tail.'),
('Sereg', 'Sereg', 'none', 'technical', 'fly', 'Tarkuan', 'Tarkuan', 'Ein benannter Seregios-Begleiter mit rasiermesserscharfen Schuppen.', 'A named Seregios companion with razor-sharp scales.'),
('Gnocchi', 'Gnocchi', 'ice', 'power', 'jump', 'Serathis', 'Serathis', 'Ein benannter Goss Harag-Begleiter der sich Eisklingen formt.', 'A named Goss Harag companion that forms ice blades.'),
('Angie', 'Angie', 'fire', 'power', 'jump', 'Azuria', 'Azuria', 'Eleanors treuer Anjanath-Begleiter mit feurigem Temperament.', 'Eleanor''s loyal Anjanath companion with a fiery temperament.'),
('Chirpy', 'Chirpy', 'none', 'technical', 'fly', 'Verschiedene', 'Various', 'Ein benannter Seregios-Begleiter in einer besonderen Farbvariante.', 'A named Seregios companion in a special color variant.'),
('Kagachi', 'Kagachi', 'thunder', 'speed', 'fly, climb', 'Azuria', 'Azuria', 'Theas treuer Tobi-Kadachi-Begleiter, wendig und blitzschnell.', 'Thea''s loyal Tobi-Kadachi companion, agile and lightning-fast.'),
('Fawn', 'Fawn', 'ice', 'speed', 'fly', 'Serathis', 'Serathis', 'Simons treue Legiana-Begleiterin mit eleganten Eiswinden.', 'Simon''s loyal Legiana companion with elegant icy winds.'),
('Lenox', 'Legia', 'ice', 'speed', 'fly', 'Serathis', 'Serathis', 'Ein benannter Legiana-Begleiter mit majestätischen Eisflügeln.', 'A named Legiana companion with majestic icy wings.'),
('Golma', 'Golma', 'none', 'power', 'climb', 'Serathis', 'Serathis', 'Ein benannter Garangolm-Begleiter der seine Fäuste mit den Elementen verstärkt.', 'A named Garangolm companion that empowers its fists with elements.'),
('Großpoogie', 'Great Poogie', 'none', 'speed', 'jump', 'Verschiedene', 'Various', 'Ein übergroßes Poogie, das als Reittier dient. Überraschend schnell!', 'An oversized Poogie that serves as a mount. Surprisingly fast!');


-- ============================================
-- GENES (expanded from 5 to 25)
-- ============================================
INSERT INTO genes (name_de, name_en, gene_type, element, skill_name_de, skill_name_en, description_de, description_en) VALUES
-- Fire Genes
('Feuerstrahl-Gen', 'Fire Beam Gene', 'power', 'fire', 'Feuerstrahl', 'Fire Beam', 'Verleiht dem Monstie einen mächtigen Feuerangriff.', 'Grants the Monstie a powerful fire attack.'),
('Flammenklinge-Gen', 'Flame Blade Gene', 'speed', 'fire', 'Flammenklinge', 'Flame Blade', 'Ein schneller Feuerangriff der den Gegner verbrennen kann.', 'A fast fire attack that can inflict burn on the opponent.'),
('Feuerstrudel-Gen', 'Fire Vortex Gene', 'technical', 'fire', 'Feuerstrudel', 'Fire Vortex', 'Ein technischer Flächenangriff der Feuer um das Monstie wirbelt.', 'A technical area attack that swirls fire around the Monstie.'),
('Feueratem-Gen', 'Fire Breath Gene', 'power', 'fire', 'Feueratem', 'Fire Breath', 'Ein mächtiger Feueratem-Angriff der alle Gegner vor dem Monstie trifft.', 'A mighty fire breath attack that hits all enemies in front of the Monstie.'),
-- Water Genes
('Wasserbombe-Gen', 'Water Bomb Gene', 'technical', 'water', 'Wasserbombe', 'Water Bomb', 'Ein flächendeckender Wasserangriff.', 'An area-of-effect water attack.'),
('Aquastrahl-Gen', 'Aqua Beam Gene', 'power', 'water', 'Aquastrahl', 'Aqua Beam', 'Ein konzentrierter Wasserstrahl der enormen Schaden verursacht.', 'A concentrated water beam dealing enormous damage.'),
('Blasenwand-Gen', 'Bubble Wall Gene', 'technical', 'water', 'Blasenwand', 'Bubble Wall', 'Erzeugt eine schützende Blasenwand die Schaden absorbiert.', 'Creates a protective bubble wall that absorbs damage.'),
-- Thunder Genes
('Blitzschlag-Gen', 'Thunder Strike Gene', 'technical', 'thunder', 'Blitzschlag', 'Thunder Strike', 'Ein technischer Blitzangriff der den Gegner lähmen kann.', 'A technical thunder attack that can paralyze the opponent.'),
('Donnerklinge-Gen', 'Thunder Blade Gene', 'speed', 'thunder', 'Donnerklinge', 'Thunder Blade', 'Ein blitzschneller Angriff mit elektrischer Energie.', 'A lightning-fast attack with electrical energy.'),
('Blitzgewitter-Gen', 'Thunderstorm Gene', 'power', 'thunder', 'Blitzgewitter', 'Thunderstorm', 'Ruft ein verheerendes Gewitter herbei das alle Gegner trifft.', 'Summons a devastating thunderstorm that hits all enemies.'),
-- Ice Genes
('Eislanze-Gen', 'Ice Lance Gene', 'speed', 'ice', 'Eislanze', 'Ice Lance', 'Ein schneller Eisangriff der den Gegner einfrieren kann.', 'A fast ice attack that can freeze the opponent.'),
('Frosthauch-Gen', 'Frost Breath Gene', 'power', 'ice', 'Frosthauch', 'Frost Breath', 'Ein mächtiger Eisstoß der Gegner in Eis hüllt.', 'A powerful ice blast that encases enemies in ice.'),
('Eisspiegel-Gen', 'Ice Mirror Gene', 'technical', 'ice', 'Eisspiegel', 'Ice Mirror', 'Erzeugt Eisspiegel die feindliche Angriffe reflektieren.', 'Creates ice mirrors that reflect enemy attacks.'),
-- Dragon Genes
('Drachenpuls-Gen', 'Dragon Pulse Gene', 'power', 'dragon', 'Drachenpuls', 'Dragon Pulse', 'Ein mächtiger Drachenangriff der pure Drachenenergie entfesselt.', 'A mighty dragon attack that unleashes pure dragon energy.'),
('Drachenklinge-Gen', 'Dragon Blade Gene', 'speed', 'dragon', 'Drachenklinge', 'Dragon Blade', 'Ein schneller Angriff mit Drachenenergie der elementare Resistenzen senkt.', 'A fast attack with dragon energy that lowers elemental resistances.'),
('Drachenaura-Gen', 'Dragon Aura Gene', 'technical', 'dragon', 'Drachenaura', 'Dragon Aura', 'Umhüllt das Monstie mit Drachenenergie und stärkt alle Angriffe.', 'Envelops the Monstie in dragon energy, boosting all attacks.'),
-- Non-Elemental Genes
('Schnellangriff-Gen', 'Quick Strike Gene', 'speed', 'none', 'Schnellangriff', 'Quick Strike', 'Ein schneller Angriff der zuerst zuschlägt.', 'A fast attack that strikes first.'),
('Kraftladung-Gen', 'Power Charge Gene', 'power', 'none', 'Kraftladung', 'Power Charge', 'Erhöht die Angriffskraft für mehrere Runden.', 'Increases attack power for several turns.'),
('Giftstachel-Gen', 'Poison Sting Gene', 'technical', 'none', 'Giftstachel', 'Poison Sting', 'Ein technischer Angriff der den Gegner vergiften kann.', 'A technical attack that can poison the opponent.'),
('Panzerbrecher-Gen', 'Armor Break Gene', 'power', 'none', 'Panzerbrecher', 'Armor Break', 'Ein durchdringender Angriff der die Verteidigung des Gegners senkt.', 'A piercing attack that lowers the opponent''s defense.'),
('Ausweichmanöver-Gen', 'Evasion Gene', 'speed', 'none', 'Ausweichmanöver', 'Evasion', 'Erhöht die Ausweichrate des Monsties für mehrere Runden.', 'Increases the Monstie''s evasion rate for several turns.'),
-- Healing/Support Genes
('Heilaura-Gen', 'Healing Aura Gene', 'technical', 'none', 'Heilaura', 'Healing Aura', 'Heilt das Monstie und seinen Reiter über mehrere Runden.', 'Heals the Monstie and its rider over several turns.'),
('Lebenskraft-Gen', 'Vitality Gene', 'power', 'none', 'Lebenskraft', 'Vitality', 'Erhöht die maximalen Lebenspunkte des Monsties dauerhaft.', 'Permanently increases the Monstie''s maximum health points.'),
('Bindungsstärke-Gen', 'Kinship Gene', 'technical', 'none', 'Bindungsstärke', 'Kinship Boost', 'Erhöht die Kinship-Anzeige schneller durch Angriffe.', 'Increases the Kinship gauge faster through attacks.'),
('Kritischer Stoß-Gen', 'Critical Strike Gene', 'speed', 'none', 'Kritischer Stoß', 'Critical Strike', 'Erhöht die Chance auf kritische Treffer erheblich.', 'Significantly increases the chance of critical hits.');


-- ============================================
-- BESTIARY (all monsters including non-rideable)
-- ============================================
INSERT INTO monsters (name_de, name_en, species, weakness, habitat_de, habitat_en, description_de, description_en) VALUES
-- === HERBIVORES ===
('Aptonoth', 'Aptonoth', 'herbivore', 'fire', 'Azuria', 'Azuria', 'Ein friedlicher Pflanzenfresser der in Herden lebt und eine wichtige Nahrungsquelle für Raubtiere ist.', 'A peaceful herbivore living in herds, serving as an important food source for predators.'),
('Slagtoth', 'Slagtoth', 'herbivore', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein dickfelliger Pflanzenfresser der in verschiedenen Gebieten vorkommt.', 'A thick-skinned herbivore found in various regions.'),
('Kelbi', 'Kelbi', 'herbivore', 'none', 'Azuria', 'Azuria', 'Ein kleines hirschartiges Wesen dessen Hörner für Heilmittel geschätzt werden.', 'A small deer-like creature whose horns are valued for healing items.'),
('Moofah', 'Moofah', 'herbivore', 'none', 'Azuria', 'Azuria', 'Ein flauschiges schafartiges Wesen mit weicher Wolle.', 'A fluffy sheep-like creature with soft wool.'),

-- === NEOPTERONS ===
('Bnahabra', 'Bnahabra', 'neopteron', 'fire', 'Verschiedene', 'Various', 'Ein insektenartiges Wesen das in Schwärmen angreift und Gift versprüht.', 'An insect-like creature that attacks in swarms and sprays poison.'),
('Großer Donnerkäfer', 'Great Thunderbug', 'neopteron', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Ein großer Donnerkäfer der elektrische Attacken einsetzen kann.', 'A large thunderbug capable of using electrical attacks.'),
('Großer Dracokäfer', 'Great Dracobug', 'neopteron', 'thunder', 'Serathis', 'Serathis', 'Ein großer Käfer durchzogen von Drachenenergie.', 'A large bug infused with dragon energy.'),

-- === LYNIANS ===
('Fass-Felyne', 'Barrel Felyne', 'lynian', 'none', 'Verschiedene', 'Various', 'Ein Felyne das sich in einem Fass versteckt und Bomben wirft.', 'A Felyne hiding in a barrel and throwing bombs.'),
('Großer Fass-Felyne', 'Great Barrel Felyne', 'lynian', 'none', 'Verschiedene', 'Various', 'Ein mächtiger Fass-Felyne der größere und stärkere Bomben einsetzt.', 'A powerful Barrel Felyne that uses bigger and stronger bombs.'),

-- === SNAKE WYVERNS ===
('Remobra', 'Remobra', 'snake_wyvern', 'dragon', 'Tarkuan', 'Tarkuan', 'Ein kleiner fliegender Schlangenwyvern der Gift und Drachenenergie einsetzt.', 'A small flying snake wyvern that uses poison and dragon energy.'),

-- === BIRD WYVERNS ===
('Gargwa', 'Gargwa', 'bird_wyvern', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Ein vogelähnliches Monster das in Panik Eier legt und davonrennt.', 'A bird-like monster that lays eggs in panic and runs away.'),
('Velociprey', 'Velociprey', 'bird_wyvern', 'fire', 'Azuria', 'Azuria', 'Schnelle Rudelräuber mit scharfen Klauen die in Gruppen angreifen.', 'Fast pack predators with sharp claws that attack in groups.'),
('Velocidrome', 'Velocidrome', 'bird_wyvern', 'fire', 'Azuria', 'Azuria', 'Der Anführer der Velociprey. Größer, schneller und gefährlicher als sein Rudel.', 'The leader of the Velociprey. Bigger, faster, and more dangerous than its pack.'),
('Izuchi', 'Izuchi', 'bird_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein kleiner Wyvern mit sichelförmigem Schwanz der im Trio jagt.', 'A small wyvern with a sickle-shaped tail that hunts in trios.'),
('Groß-Izuchi', 'Great Izuchi', 'bird_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Der Anführer eines Izuchi-Trios mit mächtigem Schwanzangriff.', 'The leader of an Izuchi trio with a powerful tail attack.'),
('Kulu-Ya-Ku', 'Kulu-Ya-Ku', 'bird_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Ein intelligenter Wyvern der Steine als Werkzeuge und Waffen nutzt.', 'An intelligent wyvern that uses rocks as tools and weapons.'),
('Yian Kut-Ku', 'Yian Kut-Ku', 'bird_wyvern', 'thunder', 'Azuria', 'Azuria', 'Ein vogelähnlicher Wyvern mit großen Ohren und Feuerbällen.', 'A bird-like wyvern with large ears and fireballs.'),
('Blauer Yian Kut-Ku', 'Blue Yian Kut-Ku', 'bird_wyvern', 'thunder', 'Azuria', 'Azuria', 'Eine Unterart mit bläulichem Gefieder und stärkeren Feuerattacken.', 'A subspecies with bluish plumage and stronger fire attacks.'),
('Gypceros', 'Gypceros', 'bird_wyvern', 'ice', 'Azuria', 'Azuria', 'Ein hinterhältiger Wyvern der sich tot stellt und Blitzschläge aus seinem Kamm erzeugt.', 'A sneaky wyvern that plays dead and generates flashes from its crest.'),
('Lila Gypceros', 'Purple Gypceros', 'bird_wyvern', 'ice', 'Azuria', 'Azuria', 'Eine giftigere Variante des Gypceros mit violetter Färbung.', 'A more venomous variant of Gypceros with purple coloring.'),
('Aknosom', 'Aknosom', 'bird_wyvern', 'water', 'Azuria', 'Azuria', 'Ein kranichartiger Wyvern mit einem brennenden Kamm.', 'A crane-like wyvern with a blazing crest.'),
('Pukei-Pukei', 'Pukei-Pukei', 'bird_wyvern', 'thunder', 'Azuria', 'Azuria', 'Ein bunter vogelähnlicher Wyvern der Gift versprüht.', 'A colorful bird-like wyvern that sprays poison.'),
('Yian Garuga', 'Yian Garuga', 'bird_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein aggressiver und gerissener Wyvern mit Giftangriffen.', 'An aggressive and cunning wyvern with poison attacks.'),
('Narbiger Yian Garuga', 'Deadeye Yian Garuga', 'bird_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Eine abweichende Form des Yian Garuga, noch aggressiver.', 'A deviant form of Yian Garuga, even more aggressive.'),

-- === FANGED BEASTS ===
('Arzuros', 'Arzuros', 'fanged_beast', 'fire', 'Azuria', 'Azuria', 'Ein bärenartiges Monster mit einer Vorliebe für Honig.', 'A bear-like monster with a fondness for honey.'),
('Bishaten', 'Bishaten', 'fanged_beast', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein akrobatisches Tierwesen mit Greifschwanz das mit Früchten jongliert.', 'An acrobatic beast with a prehensile tail that juggles fruit.'),
('Blut-Bishaten', 'Blood Orange Bishaten', 'fanged_beast', 'ice', 'Tarkuan', 'Tarkuan', 'Eine Unterart des Bishaten die mit explosiven Früchten angreift.', 'A subspecies of Bishaten that attacks with explosive fruits.'),
('Blangonga', 'Blangonga', 'fanged_beast', 'fire', 'Serathis', 'Serathis', 'Ein aggressiver Eisprimat der Eisbrocken schleudert.', 'An aggressive ice primate that hurls ice chunks.'),
('Garangolm', 'Garangolm', 'fanged_beast', 'dragon', 'Serathis', 'Serathis', 'Ein gewaltiger Primat der seine Fäuste mit Feuer und Wasser verstärkt.', 'A massive primate that empowers its fists with fire and water.'),
('Ajarakan', 'Ajarakan', 'fanged_beast', 'water', 'Canalta-Waldland', 'Canalta Timberland', 'Ein neues Tierwesen das Feuer kontrolliert und klettert.', 'A new beast that controls fire and climbs.'),
('Goss Harag', 'Goss Harag', 'fanged_beast', 'fire', 'Serathis', 'Serathis', 'Ein Yokai-artiges Tierwesen das sich Eisklingen formt.', 'A yokai-like beast that forms ice blades.'),
('Canyne', 'Canyne', 'fanged_beast', 'none', 'Azuria', 'Azuria', 'Ein treuer hundeartiger Begleiter.', 'A loyal canine companion.'),

-- === AMPHIBIANS ===
('Chatacabra', 'Chatacabra', 'amphibian', 'fire', 'Azuria', 'Azuria', 'Ein krötenartiges Amphibium das Felsen mit seinem Speichel verhärtet.', 'A toad-like amphibian that hardens rocks with its saliva.'),
('Tetranadon', 'Tetranadon', 'amphibian', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Ein gefräßiges Amphibium das Steine verschluckt und als Geschosse ausspuckt.', 'A gluttonous amphibian that swallows rocks and spits them as projectiles.'),

-- === CARAPACEONS ===
('Shogun Ceanataur', 'Shogun Ceanataur', 'carapaceon', 'fire', 'Tarkuan', 'Tarkuan', 'Eine riesige Krabbe die Monsterschädel als Panzer trägt.', 'A giant crab that wears monster skulls as shells.'),

-- === TEMNOCERANS ===
('Nerscylla', 'Nerscylla', 'temnoceran', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Eine riesige Spinne die sich in die Haut anderer Monster kleidet.', 'A giant spider that wears the skin of other monsters.'),
('Getarnte Nerscylla', 'Shrouded Nerscylla', 'temnoceran', 'fire', 'Serathis', 'Serathis', 'Eine Unterart der Nerscylla mit stärkerer Giftfähigkeit.', 'A subspecies of Nerscylla with stronger poison capability.'),
('Rakna-Kadaki', 'Rakna-Kadaki', 'temnoceran', 'water', 'Tarkuan', 'Tarkuan', 'Eine feurige Spinne die ihre Brut als Waffen einsetzt.', 'A fiery spider that deploys its brood as weapons.'),

-- === BRUTE WYVERNS ===
('Barroth', 'Barroth', 'brute_wyvern', 'fire', 'Tarkuan', 'Tarkuan', 'Ein Schlamm liebender Wyvern der mit seinem massiven Kopf zuschlägt.', 'A mud-loving wyvern that strikes with its massive head.'),
('Jade-Barroth', 'Jade Barroth', 'brute_wyvern', 'fire', 'Serathis', 'Serathis', 'Eine Unterart des Barroth die in eisigen Regionen lebt.', 'A subspecies of Barroth living in icy regions.'),
('Anjanath', 'Anjanath', 'brute_wyvern', 'water', 'Azuria', 'Azuria', 'Ein aggressiver T-Rex-artiger Wyvern mit Feueratem.', 'An aggressive T-Rex-like wyvern with fire breath.'),
('Fulgur-Anjanath', 'Fulgur Anjanath', 'brute_wyvern', 'water', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart des Anjanath die Blitzenergie nutzt.', 'A subspecies of Anjanath that uses thunder energy.'),
('Glavenus', 'Glavenus', 'brute_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Ein Wyvern mit einem schwertartigen Schwanz der zum Glühen gebracht wird.', 'A wyvern with a blade-like tail that is heated to a glow.'),
('Zornklingen-Glavenus', 'Hellblade Glavenus', 'brute_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form des Glavenus mit noch heißerem Schwert.', 'A deviant form of Glavenus with an even hotter blade.'),
('Brachydios', 'Brachydios', 'brute_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Ein explosiver Wyvern mit Fäusten die mit Sprengschleim überzogen sind.', 'An explosive wyvern with fists coated in blast slime.'),
('Dämonjho', 'Deviljho', 'brute_wyvern', 'dragon', 'Verschiedene', 'Various', 'Ein ewig hungriger Tyrann der ganze Ökosysteme verschlingen kann.', 'An eternally hungry tyrant that can devour entire ecosystems.'),

-- === PISCINE WYVERNS ===
('Plesioth', 'Plesioth', 'piscine_wyvern', 'thunder', 'Azuria', 'Azuria', 'Ein riesiger Fisch-Wyvern der aus dem Wasser springt.', 'A giant piscine wyvern that leaps from water.'),
('Grüner Plesioth', 'Green Plesioth', 'piscine_wyvern', 'thunder', 'Azuria', 'Azuria', 'Eine Unterart des Plesioth mit Schlafangriffen.', 'A subspecies of Plesioth with sleep attacks.'),

-- === LEVIATHANS ===
('Ludroth', 'Ludroth', 'leviathan', 'fire', 'Azuria', 'Azuria', 'Ein kleiner Leviathan der in Gruppen um den Royal Ludroth lebt.', 'A small leviathan living in groups around the Royal Ludroth.'),
('Königs-Ludroth', 'Royal Ludroth', 'leviathan', 'fire', 'Azuria', 'Azuria', 'Ein schwammiger Leviathan der Wasser in seiner Mähne speichert.', 'A spongy leviathan that stores water in its mane.'),
('Lila Ludroth', 'Purple Ludroth', 'leviathan', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Eine giftige Unterart des Royal Ludroth.', 'A venomous subspecies of Royal Ludroth.'),
('Somnacanth', 'Somnacanth', 'leviathan', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein sirenenhafter Leviathan der Schlafpulver verbreitet.', 'A siren-like leviathan that spreads sleep powder.'),
('Auroracanth', 'Aurora Somnacanth', 'leviathan', 'thunder', 'Serathis', 'Serathis', 'Eine Unterart des Somnacanth mit Eisattacken.', 'A subspecies of Somnacanth with ice attacks.'),
('Lagiacrus', 'Lagiacrus', 'leviathan', 'fire', 'Azuria', 'Azuria', 'Der Herrscher der Meere mit verheerenden Blitzattacken.', 'Lord of the Seas with devastating thunder attacks.'),
('Elfenbein-Lagiacrus', 'Ivory Lagiacrus', 'leviathan', 'fire', 'Tarkuan', 'Tarkuan', 'Eine Unterart die an Land lebt und Blitze über den Boden leitet.', 'A subspecies living on land that channels thunder through the ground.'),
('Mizutsune', 'Mizutsune', 'leviathan', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein eleganter Leviathan der Blasen zur Jagd einsetzt.', 'An elegant leviathan that uses bubbles for hunting.'),
('Karmaseher-Mizutsune', 'Soulseer Mizutsune', 'leviathan', 'thunder', 'Serathis', 'Serathis', 'Eine abweichende Form des Mizutsune mit übernatürlichen Fähigkeiten.', 'A deviant form of Mizutsune with supernatural abilities.'),
('Almudron', 'Almudron', 'leviathan', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein schlangenartiger Leviathan der goldenen Schlamm kontrolliert.', 'A serpentine leviathan that controls golden mud.'),

-- === FANGED WYVERNS ===
('Tobi-Kadachi', 'Tobi-Kadachi', 'fanged_wyvern', 'water', 'Azuria', 'Azuria', 'Ein wendiger Wyvern der statische Elektrizität aufbaut.', 'An agile wyvern that builds up static electricity.'),
('Odogaron', 'Odogaron', 'fanged_wyvern', 'ice', 'Tarkuan', 'Tarkuan', 'Ein blutrünstiges Raubtier mit rasiermesserscharfen Klauen.', 'A bloodthirsty predator with razor-sharp claws.'),
('Vulkan-Odogaron', 'Ebony Odogaron', 'fanged_wyvern', 'ice', 'Serathis', 'Serathis', 'Eine Unterart mit Drachenenergie und höherer Aggressivität.', 'A subspecies with dragon energy and higher aggression.'),
('Zinogre', 'Zinogre', 'fanged_wyvern', 'ice', 'Canalta-Waldland', 'Canalta Timberland', 'Der Donnerwolf nutzt Thunderbugs für verheerende Blitzattacken.', 'The Thunder Wolf uses Thunderbugs for devastating electrical attacks.'),
('Höllen-Zinogre', 'Stygian Zinogre', 'fanged_wyvern', 'ice', 'Serathis', 'Serathis', 'Eine Variante die Drachenenergie statt Blitzenergie nutzt.', 'A variant using dragon energy instead of thunder.'),
('Donnerschlag-Zinogre', 'Thunderlord Zinogre', 'fanged_wyvern', 'ice', 'Canalta-Waldland', 'Canalta Timberland', 'Eine abweichende Form mit noch mächtigeren Blitzattacken.', 'A deviant form with even more powerful thunder attacks.'),
('Lunagaron', 'Lunagaron', 'fanged_wyvern', 'fire', 'Serathis', 'Serathis', 'Ein wolfsähnlicher Wyvern der sich mit Eis überzieht.', 'A wolf-like wyvern that coats itself in ice.'),
('Magnamalo', 'Magnamalo', 'fanged_wyvern', 'water', 'Canalta-Waldland', 'Canalta Timberland', 'Der Fürst der Finsternis nutzt Hellfiregas als Waffe.', 'The Wight of Malice uses hellfire gas as a weapon.'),

-- === FLYING WYVERNS ===
('Paolumu', 'Paolumu', 'flying_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein pelziger Wyvern der sich aufblasen kann.', 'A furry wyvern that inflates itself.'),
('Khezu', 'Khezu', 'flying_wyvern', 'fire', 'Canalta-Waldland', 'Canalta Timberland', 'Ein blinder Höhlenwyvern der elektrische Impulse nutzt.', 'A blind cave wyvern that uses electrical impulses.'),
('Roter Khezu', 'Red Khezu', 'flying_wyvern', 'fire', 'Tarkuan', 'Tarkuan', 'Eine rötliche Unterart mit stärkeren elektrischen Angriffen.', 'A reddish subspecies with stronger electrical attacks.'),
('Rathian', 'Rathian', 'flying_wyvern', 'dragon', 'Azuria', 'Azuria', 'Die Königin des Landes verteidigt ihr Nest mit Gift und Feuer.', 'The Queen of the Land defends her nest with poison and fire.'),
('Rosa Rathian', 'Pink Rathian', 'flying_wyvern', 'dragon', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart mit stärkeren Giftangriffen.', 'A subspecies with stronger poison attacks.'),
('Giftstachel-Rathian', 'Dreadqueen Rathian', 'flying_wyvern', 'dragon', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form mit tödlichem Schnellgift.', 'A deviant form with deadly rapid poison.'),
('Legiana', 'Legiana', 'flying_wyvern', 'thunder', 'Serathis', 'Serathis', 'Ein eleganter Wyvern der mit eisigen Flügeln Beute einfriert.', 'A graceful wyvern that freezes prey with its icy wings.'),
('Barioth', 'Barioth', 'flying_wyvern', 'fire', 'Serathis', 'Serathis', 'Ein Saberzahn-Wyvern der Schneestürme entfesselt.', 'A sabertooth wyvern that unleashes blizzards.'),
('Sand-Barioth', 'Sand Barioth', 'flying_wyvern', 'ice', 'Tarkuan', 'Tarkuan', 'Eine Unterart die in Wüstengebieten Sandstürme erzeugt.', 'A subspecies that creates sandstorms in desert areas.'),
('Nargacuga', 'Nargacuga', 'flying_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Ein nachtaktiver Wyvern der blitzschnell aus den Schatten zuschlägt.', 'A nocturnal wyvern that strikes lightning-fast from the shadows.'),
('Grüner Nargacuga', 'Green Nargacuga', 'flying_wyvern', 'thunder', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart mit noch heimtückischeren Angriffen.', 'A subspecies with even more treacherous attacks.'),
('Silberwind-Nargacuga', 'Silverwind Nargacuga', 'flying_wyvern', 'thunder', 'Serathis', 'Serathis', 'Eine abweichende Form mit silbernem Fell und Windklingen.', 'A deviant form with silver fur and wind blades.'),
('Astalos', 'Astalos', 'flying_wyvern', 'water', 'Canalta-Waldland', 'Canalta Timberland', 'Ein aggressiver Wyvern der Elektrizität speichert.', 'An aggressive wyvern that stores electricity.'),
('Blitzschlag-Astalos', 'Boltreaver Astalos', 'flying_wyvern', 'water', 'Serathis', 'Serathis', 'Eine abweichende Form mit mächtigeren Blitzattacken.', 'A deviant form with more powerful thunder attacks.'),
('Rathalos', 'Rathalos', 'flying_wyvern', 'dragon', 'Azuria', 'Azuria', 'Der König der Lüfte patrouilliert sein Territorium aus der Luft.', 'The King of the Skies patrols its territory from the air.'),
('Azurner Rathalos', 'Azure Rathalos', 'flying_wyvern', 'dragon', 'Canalta-Waldland', 'Canalta Timberland', 'Eine Unterart die mehr Zeit in der Luft verbringt.', 'A subspecies that spends more time in the air.'),
('Dunkelfeuer-Rathalos', 'Dreadking Rathalos', 'flying_wyvern', 'dragon', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form mit enormer Feuerkraft.', 'A deviant form with enormous firepower.'),
('Tigrex', 'Tigrex', 'flying_wyvern', 'thunder', 'Tarkuan', 'Tarkuan', 'Ein extrem aggressiver Wyvern der alles angreift was sich bewegt.', 'An extremely aggressive wyvern that attacks anything that moves.'),
('Brachial-Tigrex', 'Brute Tigrex', 'flying_wyvern', 'thunder', 'Tarkuan', 'Tarkuan', 'Eine Unterart mit ohrenbetäubenden Brüllern.', 'A subspecies with deafening roars.'),
('Düsterklauen-Tigrex', 'Grimclaw Tigrex', 'flying_wyvern', 'thunder', 'Serathis', 'Serathis', 'Eine abweichende Form mit massiveren Klauen.', 'A deviant form with more massive claws.'),
('Gravios', 'Gravios', 'flying_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Ein massiver gepanzerter Wyvern mit Hitzestrahlen.', 'A massive armored wyvern with heat beams.'),
('Schwarzer Gravios', 'Black Gravios', 'flying_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Eine Unterart mit schwarzem Panzer und stärkeren Hitzestrahlen.', 'A subspecies with black armor and stronger heat beams.'),
('Diablos', 'Diablos', 'flying_wyvern', 'ice', 'Tarkuan', 'Tarkuan', 'Der Tyrann der Wüste, extrem territorial.', 'The Desert Tyrant, extremely territorial.'),
('Schwarze Diablos', 'Black Diablos', 'flying_wyvern', 'ice', 'Tarkuan', 'Tarkuan', 'Ein weiblicher Diablos in der Brunftzeit, noch aggressiver.', 'A female Diablos in heat, even more aggressive.'),
('Blutbad-Diablos', 'Bloodbath Diablos', 'flying_wyvern', 'ice', 'Tarkuan', 'Tarkuan', 'Eine abweichende Form mit explosiven Angriffen.', 'A deviant form with explosive attacks.'),
('Seregios', 'Seregios', 'flying_wyvern', 'thunder', 'Tarkuan', 'Tarkuan', 'Ein hochaggressiver Wyvern mit rasiermesserscharfen Schuppen.', 'A highly aggressive wyvern with razor-sharp scales.'),
('Espinas', 'Espinas', 'flying_wyvern', 'ice', 'Canalta-Waldland', 'Canalta Timberland', 'Meist schlafend, aber im Zorn mit giftigen Stacheln extrem gefährlich.', 'Usually sleeping, but extremely dangerous with venomous spines when enraged.'),
('Rey Dau', 'Rey Dau', 'flying_wyvern', 'water', 'Tarkuan', 'Tarkuan', 'Ein Wyvern der Gewitter erzeugt und Blitze lenkt.', 'A wyvern that creates thunderstorms and directs lightning.'),

-- === ELDER DRAGONS ===
('Arkveld', 'Arkveld', 'elder_dragon', 'none', 'Serathis', 'Serathis', 'Eine mysteriöse skelettartige Kreatur die andere Monster kontrolliert.', 'A mysterious skeletal creature that controls other monsters.'),
('Namielle', 'Namielle', 'elder_dragon', 'thunder', 'Serathis', 'Serathis', 'Ein Älterer Drache der Wasser und Elektrizität kombiniert.', 'An Elder Dragon combining water and electricity.'),
('Velkhana', 'Velkhana', 'elder_dragon', 'fire', 'Serathis', 'Serathis', 'Ein majestätischer Älterer Drache der alles in Eis verwandelt.', 'A majestic Elder Dragon that turns everything to ice.'),
('Malzeno', 'Malzeno', 'elder_dragon', 'fire', 'Serathis', 'Serathis', 'Ein vampirischer Älterer Drache der Lebensenergie absaugt.', 'A vampiric Elder Dragon that drains life energy.');


-- ============================================
-- EQUIPMENT (expanded)
-- ============================================
INSERT INTO equipment (name_de, name_en, type, rarity, stats, materials_de, materials_en, description_de, description_en) VALUES
('Rathalos-Schwert', 'Rathalos Blade', 'weapon', 5, '{"attack": 180, "element": "fire", "element_value": 30, "affinity": 10}', '["Rathalos-Schuppe x3", "Rathalos-Schwanz x1", "Flammsack x2"]', '["Rathalos Scale x3", "Rathalos Tail x1", "Flame Sac x2"]', 'Ein Schwert geschmiedet aus den Materialien des Königs der Lüfte.', 'A blade forged from the materials of the King of the Skies.'),
('Zinogre-Rüstung', 'Zinogre Armor', 'armor', 5, '{"defense": 120, "thunder_res": 25, "water_res": -15, "skills": ["Thunder Attack +2"]}', '["Zinogre-Fell x4", "Zinogre-Klaue x2", "Donnerkäfer x5"]', '["Zinogre Pelt x4", "Zinogre Claw x2", "Thunderbug x5"]', 'Rüstung durchzogen von der Blitzenergie des Donnerwolfs.', 'Armor infused with the electrical energy of the Thunder Wolf.'),
('Nargacuga-Dolche', 'Nargacuga Blades', 'weapon', 4, '{"attack": 150, "element": "none", "affinity": 35, "sharpness": "white"}', '["Nargacuga-Fell x3", "Nargacuga-Schwanzspitze x1"]', '["Nargacuga Pelt x3", "Nargacuga Tail Tip x1"]', 'Rasiermesserscharfe Klingen für blitzschnelle Angriffe.', 'Razor-sharp blades for lightning-fast attacks.'),
('Mizutsune-Rüstung', 'Mizutsune Armor', 'armor', 4, '{"defense": 100, "water_res": 20, "fire_res": -10, "skills": ["Bubble Dance"]}', '["Mizutsune-Schuppe x4", "Blasendrüse x3"]', '["Mizutsune Scale x4", "Bubble Gland x3"]', 'Elegante Rüstung die den Träger geschmeidiger macht.', 'Elegant armor that makes the wearer more nimble.'),
('Tigrex-Hammer', 'Tigrex Hammer', 'weapon', 5, '{"attack": 210, "element": "none", "affinity": -10, "stun": 30}', '["Tigrex-Fang x3", "Tigrex-Klaue x2", "Tigrex-Schädel x1"]', '["Tigrex Fang x3", "Tigrex Claw x2", "Tigrex Skull x1"]', 'Ein brutaler Hammer mit der rohen Kraft des Tigrex.', 'A brutal hammer with the raw power of Tigrex.'),
('Velkhana-Lanze', 'Velkhana Lance', 'weapon', 6, '{"attack": 190, "element": "ice", "element_value": 40, "affinity": 15}', '["Velkhana-Kristall x3", "Velkhana-Schwanz x1", "Ewiges Eis x5"]', '["Velkhana Crystal x3", "Velkhana Tail x1", "Eternal Ice x5"]', 'Eine Lanze aus ewigem Eis die alles durchdringt.', 'A lance of eternal ice that pierces through anything.'),
('Malzeno-Rüstung', 'Malzeno Armor', 'armor', 6, '{"defense": 140, "dragon_res": 25, "fire_res": -10, "skills": ["Blood Rite", "Dragon Attack +2"]}', '["Malzeno-Schuppe x5", "Malzeno-Flügel x2", "Blutrubin x1"]', '["Malzeno Scale x5", "Malzeno Wing x2", "Blood Ruby x1"]', 'Vampirische Rüstung die Lebensenergie absorbiert.', 'Vampiric armor that absorbs life energy.'),
('Magnamalo-Schwert', 'Magnamalo Blade', 'weapon', 5, '{"attack": 200, "element": "none", "affinity": 5, "blast": 25}', '["Magnamalo-Panzer x3", "Magnamalo-Klaue x2", "Höllenfeuergas x3"]', '["Magnamalo Shell x3", "Magnamalo Claw x2", "Hellfire Gas x3"]', 'Ein Schwert durchzogen von der dunklen Energie des Magnamalo.', 'A blade infused with the dark energy of Magnamalo.'),
('Lagiacrus-Rüstung', 'Lagiacrus Armor', 'armor', 5, '{"defense": 115, "thunder_res": 20, "water_res": 15, "skills": ["Thunder Attack +1", "Marathon Runner"]}', '["Lagiacrus-Schuppe x4", "Lagiacrus-Horn x1", "Blitzdrüse x3"]', '["Lagiacrus Scale x4", "Lagiacrus Horn x1", "Thunder Gland x3"]', 'Rüstung des Meeresherrschers mit Blitzresistenz.', 'Armor of the Lord of the Seas with thunder resistance.'),
('Espinas-Lanze', 'Espinas Lance', 'weapon', 5, '{"attack": 185, "element": "fire", "element_value": 25, "poison": 20, "affinity": 5}', '["Espinas-Stachel x3", "Espinas-Panzer x2", "Giftdrüse x3"]', '["Espinas Spike x3", "Espinas Shell x2", "Poison Gland x3"]', 'Eine giftige Lanze mit den Stacheln des Espinas.', 'A poisonous lance made from Espinas spikes.');
