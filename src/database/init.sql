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

-- Monsties (confirmed MHS3 roster, attack types/ride actions from MHS2 data + MHS3 wiki)
INSERT INTO monsties (name_de, name_en, element, attack_type, ride_action, habitat_de, habitat_en, description_de, description_en) VALUES
-- Flying Wyverns
('Rathalos', 'Rathalos', 'fire', 'power', 'fly', 'Uralter Wald', 'Ancient Forest', 'Der König der Lüfte. Ein feuriger Wyvern mit gewaltigen Klauen und tödlichem Feueratem.', 'The King of the Skies. A fiery wyvern with mighty talons and deadly fire breath.'),
('Rathian', 'Rathian', 'fire', 'power', 'fly', 'Uralter Wald', 'Ancient Forest', 'Die Königin des Landes. Verteidigt ihr Nest mit giftigen Schwanzangriffen und Feuerbällen.', 'The Queen of the Land. Defends her nest with venomous tail attacks and fireballs.'),
('Tigrex', 'Tigrex', 'none', 'speed', 'climb', 'Sandebenen', 'Sandy Plains', 'Ein extrem aggressiver Wyvern der alles angreift was sich bewegt. Bekannt für seine ohrenbetäubenden Brüller.', 'An extremely aggressive wyvern that attacks anything that moves. Known for its ear-splitting roars.'),
('Nargacuga', 'Nargacuga', 'none', 'speed', 'jump', 'Schattenwald', 'Shadow Forest', 'Ein flinker und tödlicher Wyvern, der aus den Schatten angreift. Extrem schnell und wendig.', 'A swift and deadly wyvern that attacks from the shadows. Extremely fast and agile.'),
('Barioth', 'Barioth', 'ice', 'speed', 'fly', 'Frostige Gipfel', 'Frozen Peaks', 'Ein Eiswyvern mit gewaltigen Saberzähnen. Beherrscht die verschneiten Gebiete mit Windangriffen.', 'An ice wyvern with massive saber teeth. Rules snowy regions with wind attacks.'),
('Seregios', 'Seregios', 'none', 'speed', 'fly', 'Sandebenen', 'Sandy Plains', 'Ein hochaggressiver Wyvern mit rasiermesserscharfen Schuppen, die er wie Geschosse abfeuert.', 'A highly aggressive wyvern with razor-sharp scales that it launches like projectiles.'),
('Legiana', 'Legiana', 'ice', 'speed', 'fly', 'Korallenhochebene', 'Coral Highlands', 'Ein eleganter Wyvern der die Korallenhochebenen bewohnt und eisige Winde erzeugt.', 'An elegant wyvern inhabiting the Coral Highlands, creating icy winds.'),
('Paolumu', 'Paolumu', 'none', 'technical', 'fly', 'Korallenhochebene', 'Coral Highlands', 'Ein pelziger Wyvern der sich aufblasen kann um durch die Luft zu gleiten und Windstöße zu erzeugen.', 'A furry wyvern that inflates itself to glide through the air and create gusts of wind.'),
('Khezu', 'Khezu', 'thunder', 'technical', 'climb', 'Sumpfhöhlen', 'Swamp Caves', 'Ein blinder Höhlenwyvern der seine Beute über Geruch und elektrische Impulse aufspürt.', 'A blind cave wyvern that tracks prey through scent and electrical impulses.'),
('Gravios', 'Gravios', 'fire', 'power', 'climb', 'Vulkanhöhlen', 'Volcanic Hollows', 'Ein massiver gepanzerter Wyvern der Hitzestrahlen und explosive Gase entfesselt.', 'A massive armored wyvern that unleashes heat beams and explosive gases.'),
('Espinas', 'Espinas', 'fire', 'power', 'fly', 'Uralter Wald', 'Ancient Forest', 'Ein normalerweise träger Wyvern mit giftigen Stacheln, der im Zorn extrem gefährlich wird.', 'A usually sluggish wyvern with venomous spines that becomes extremely dangerous when enraged.'),
-- Bird Wyverns
('Yian Kut-Ku', 'Yian Kut-Ku', 'fire', 'technical', 'jump', 'Uralter Wald', 'Ancient Forest', 'Ein vogelähnlicher Wyvern mit großen Ohren und einer Vorliebe für Feuerbälle.', 'A bird-like wyvern with large ears and a fondness for fireballs.'),
('Pukei-Pukei', 'Pukei-Pukei', 'none', 'technical', 'fly', 'Uralter Wald', 'Ancient Forest', 'Ein bunter vogelähnlicher Wyvern der Gift versprüht und Nüsse sammelt.', 'A colorful bird-like wyvern that sprays poison and collects nuts.'),
('Kulu-Ya-Ku', 'Kulu-Ya-Ku', 'none', 'technical', 'jump', 'Sandebenen', 'Sandy Plains', 'Ein intelligenter Wyvern der Steine und Eier als Werkzeuge und Waffen nutzt.', 'An intelligent wyvern that uses rocks and eggs as tools and weapons.'),
('Aknosom', 'Aknosom', 'fire', 'technical', 'fly', 'Sumpfgebiet', 'Flooded Forest', 'Ein kranichartiger Wyvern mit einem brennenden Kamm, der elegante Feuerattacken einsetzt.', 'A crane-like wyvern with a blazing crest that uses elegant fire attacks.'),
('Velocidrome', 'Velocidrome', 'none', 'speed', 'jump', 'Uralter Wald', 'Ancient Forest', 'Der Anführer eines Velociprey-Rudels. Schnell und wendig mit scharfen Klauen.', 'The leader of a Velociprey pack. Fast and agile with sharp claws.'),
-- Fanged Wyverns
('Zinogre', 'Zinogre', 'thunder', 'power', 'climb', 'Uralter Wald', 'Ancient Forest', 'Der Donnerwolf. Sammelt Blitzenergie mit Hilfe von Thunderbugs und entfesselt verheerende Angriffe.', 'The Thunder Wolf. Gathers electrical energy with Thunderbugs and unleashes devastating attacks.'),
('Tobi-Kadachi', 'Tobi-Kadachi', 'thunder', 'speed', 'climb', 'Uralter Wald', 'Ancient Forest', 'Ein wendiger flugfähiger Wyvern der statische Elektrizität in seinem Fell aufbaut.', 'An agile airborne wyvern that builds up static electricity in its fur.'),
('Odogaron', 'Odogaron', 'none', 'speed', 'jump', 'Korallenhochebene', 'Coral Highlands', 'Ein blutrünstiges Raubtier mit rasiermesserscharfen Klauen, extrem aggressiv.', 'A bloodthirsty predator with razor-sharp claws, extremely aggressive.'),
('Lunagaron', 'Lunagaron', 'ice', 'speed', 'climb', 'Frostige Gipfel', 'Frozen Peaks', 'Ein wolfsähnlicher Wyvern der sich mit Eis überzieht und in einen aufrechten Kampfmodus wechselt.', 'A wolf-like wyvern that coats itself in ice and shifts to an upright combat stance.'),
-- Brute Wyverns
('Anjanath', 'Anjanath', 'fire', 'power', 'jump', 'Uralter Wald', 'Ancient Forest', 'Ein aggressiver T-Rex-artiger Wyvern mit einem Nasenkamm der Feuer entfacht.', 'An aggressive T-Rex-like wyvern with a nasal crest that ignites fire.'),
('Glavenus', 'Glavenus', 'fire', 'power', 'jump', 'Vulkanhöhlen', 'Volcanic Hollows', 'Ein Wyvern mit einem schwertartigen Schwanz den er durch Reibung zum Glühen bringt.', 'A wyvern with a blade-like tail that it heats to a glow through friction.'),
('Brachydios', 'Brachydios', 'none', 'power', 'climb', 'Vulkanhöhlen', 'Volcanic Hollows', 'Ein explosiver Wyvern mit Fäusten, die mit hochexplosivem Schleim überzogen sind.', 'An explosive wyvern with fists coated in highly explosive slime.'),
('Barroth', 'Barroth', 'water', 'speed', 'jump', 'Sandebenen', 'Sandy Plains', 'Ein gepanzerter Wyvern der sich in Schlamm wälzt und mit seinem massiven Kopf zuschlägt.', 'An armored wyvern that rolls in mud and strikes with its massive head.'),
-- Leviathans
('Lagiacrus', 'Lagiacrus', 'thunder', 'power', 'swim', 'Küstenregion', 'Coastal Region', 'Der Herrscher der Meere, gefürchtet für seine verheerenden Blitzattacken unter Wasser.', 'Lord of the Seas, feared for its devastating thunder attacks underwater.'),
('Mizutsune', 'Mizutsune', 'water', 'technical', 'swim', 'Schattenwald', 'Shadow Forest', 'Ein eleganter Leviathan, der Blasen nutzt um seine Beute auszurutschen und zu betäuben.', 'An elegant leviathan that uses bubbles to make prey slip and stun them.'),
('Royal Ludroth', 'Royal Ludroth', 'water', 'power', 'swim', 'Küstenregion', 'Coastal Region', 'Ein schwammiger Leviathan der Wasser in seiner Mähne speichert und es zur Verteidigung nutzt.', 'A spongy leviathan that stores water in its mane and uses it for defense.'),
('Almudron', 'Almudron', 'water', 'technical', 'swim', 'Sandebenen', 'Sandy Plains', 'Ein schlangenartiger Leviathan der goldenen Schlamm kontrolliert und als Waffe einsetzt.', 'A serpentine leviathan that controls golden mud and uses it as a weapon.'),
('Somnacanth', 'Somnacanth', 'water', 'technical', 'swim', 'Sumpfgebiet', 'Flooded Forest', 'Ein sirenenhafter Leviathan der Schlafpulver verbreitet und mit betörenden Melodien angreift.', 'A siren-like leviathan that spreads sleep powder and attacks with alluring melodies.'),
-- Fanged Beasts
('Arzuros', 'Arzuros', 'none', 'power', 'climb', 'Uralter Wald', 'Ancient Forest', 'Ein bärenartiges Monster mit einer Vorliebe für Honig und kräftigen Prankenangriffen.', 'A bear-like monster with a fondness for honey and powerful paw strikes.'),
('Goss Harag', 'Goss Harag', 'ice', 'power', 'climb', 'Frostige Gipfel', 'Frozen Peaks', 'Ein Yokai-artiges Tierwesen das sich Eisklingen aus seinem eigenen Atem formt.', 'A yokai-like beast that forms ice blades from its own breath.'),
('Garangolm', 'Garangolm', 'none', 'power', 'climb', 'Zitadelle', 'Citadel', 'Ein gewaltiger Golem-artiger Primat der seine Fäuste mit Feuer und Wasser verstärkt.', 'A massive golem-like primate that empowers its fists with fire and water.'),
('Bishaten', 'Bishaten', 'none', 'technical', 'climb', 'Sumpfgebiet', 'Flooded Forest', 'Ein akrobatisches Tierwesen mit einem Greifschwanz das mit Früchten jongliert und sie als Waffen wirft.', 'An acrobatic beast with a prehensile tail that juggles fruit and hurls them as weapons.'),
-- Temnocerans
('Nerscylla', 'Nerscylla', 'none', 'technical', 'climb', 'Sumpfhöhlen', 'Swamp Caves', 'Eine riesige Spinne die sich in die Haut anderer Monster kleidet und Fallen aus Fäden webt.', 'A giant spider that wears the skin of other monsters and weaves traps from threads.'),
('Rakna-Kadaki', 'Rakna-Kadaki', 'fire', 'technical', 'climb', 'Lavahöhlen', 'Lava Caverns', 'Eine feurige Spinne die ihre Brut als Waffen einsetzt und explosive Fäden spinnt.', 'A fiery spider that deploys its brood as weapons and spins explosive threads.'),
-- Carapaceons
('Shogun Ceanataur', 'Shogun Ceanataur', 'water', 'speed', 'swim', 'Sumpfhöhlen', 'Swamp Caves', 'Eine riesige Krabbe die Monsterschädel als Panzer trägt und mit langen Sichelklauen angreift.', 'A giant crab that wears monster skulls as shells and attacks with long sickle claws.'),
-- Elder Dragons
('Velkhana', 'Velkhana', 'ice', 'technical', 'fly', 'Frostige Gipfel', 'Frozen Peaks', 'Ein majestätischer Älterer Drache der alles um sich herum in Eis verwandelt.', 'A majestic Elder Dragon that turns everything around it to ice.'),
('Malzeno', 'Malzeno', 'dragon', 'technical', 'fly', 'Zitadelle', 'Citadel', 'Ein vampirischer Älterer Drache der Lebensenergie absaugt und sich damit stärkt.', 'A vampiric Elder Dragon that drains life energy and empowers itself.'),
('Magnamalo', 'Magnamalo', 'none', 'power', 'jump', 'Schattenwald', 'Shadow Forest', 'Der Fürst der Finsternis. Nutzt Hellfiregas als tödliche Waffe im Kampf.', 'The Wight of Malice. Uses hellfire gas as a deadly weapon in combat.'),
-- Amphibians
('Tetranadon', 'Tetranadon', 'water', 'power', 'swim', 'Sumpfgebiet', 'Flooded Forest', 'Ein gefräßiges Amphibium das Steine und Kies verschluckt und als Geschosse ausspuckt.', 'A gluttonous amphibian that swallows rocks and gravel, spitting them as projectiles.'),
('Chatacabra', 'Chatacabra', 'none', 'power', 'jump', 'Sumpfgebiet', 'Flooded Forest', 'Ein krötenartiges Amphibium das Felsen mit seinem Speichel verhärtet und als Waffen nutzt.', 'A toad-like amphibian that hardens rocks with its saliva and uses them as weapons.'),
-- New MHS3 Monsters
('Rey Dau', 'Rey Dau', 'thunder', 'technical', 'fly', 'Sandebenen', 'Sandy Plains', 'Ein neu entdeckter Wyvern der mit seinen Flügeln Gewitter erzeugt und Blitze lenkt.', 'A newly discovered wyvern that creates thunderstorms with its wings and directs lightning.'),
('Arkveld', 'Arkveld', 'dragon', 'power', 'climb', 'Unbekannt', 'Unknown', 'Eine mysteriöse skelettartige Kreatur, die andere Monster kontrolliert und verschlingt.', 'A mysterious skeletal creature that controls and devours other monsters.');

-- Genes
INSERT INTO genes (name_de, name_en, gene_type, element, skill_name_de, skill_name_en, description_de, description_en) VALUES
('Feuerstrahl-Gen', 'Fire Beam Gene', 'power', 'fire', 'Feuerstrahl', 'Fire Beam', 'Verleiht dem Monstie einen mächtigen Feuerangriff.', 'Grants the Monstie a powerful fire attack.'),
('Blitzschlag-Gen', 'Thunder Strike Gene', 'technical', 'thunder', 'Blitzschlag', 'Thunder Strike', 'Ein technischer Blitzangriff der den Gegner lähmen kann.', 'A technical thunder attack that can paralyze the opponent.'),
('Schnellangriff-Gen', 'Quick Strike Gene', 'speed', 'none', 'Schnellangriff', 'Quick Strike', 'Ein schneller Angriff der zuerst zuschlägt.', 'A fast attack that strikes first.'),
('Wasserbombe-Gen', 'Water Bomb Gene', 'technical', 'water', 'Wasserbombe', 'Water Bomb', 'Ein flächendeckender Wasserangriff.', 'An area-of-effect water attack.'),
('Kraftladung-Gen', 'Power Charge Gene', 'power', 'none', 'Kraftladung', 'Power Charge', 'Erhöht die Angriffskraft für mehrere Runden.', 'Increases attack power for several turns.');

-- Monsters (Bestiary) - non-rideable monsters + all large monsters for reference
INSERT INTO monsters (name_de, name_en, species, weakness, habitat_de, habitat_en, description_de, description_en) VALUES
('Rathalos', 'Rathalos', 'flying_wyvern', 'dragon', 'Uralter Wald', 'Ancient Forest', 'Der König der Lüfte patrouilliert sein Territorium aus der Luft und stürzt sich auf Eindringlinge herab.', 'The King of the Skies patrols its territory from the air, swooping down on intruders.'),
('Rathian', 'Rathian', 'flying_wyvern', 'dragon', 'Uralter Wald', 'Ancient Forest', 'Die Königin des Landes beschützt ihr Nest aggressiv mit Gift und Feuer.', 'The Queen of the Land aggressively protects her nest with poison and fire.'),
('Tigrex', 'Tigrex', 'flying_wyvern', 'thunder', 'Sandebenen', 'Sandy Plains', 'Ein extrem aggressiver Wyvern der alles angreift was sich bewegt.', 'An extremely aggressive wyvern that attacks anything that moves.'),
('Nargacuga', 'Nargacuga', 'flying_wyvern', 'thunder', 'Schattenwald', 'Shadow Forest', 'Ein nachtaktiver Wyvern der aus den Schatten heraus blitzschnell zuschlägt.', 'A nocturnal wyvern that strikes lightning-fast from the shadows.'),
('Barioth', 'Barioth', 'flying_wyvern', 'fire', 'Frostige Gipfel', 'Frozen Peaks', 'Ein Saberzahn-Wyvern der Schneestürme entfesselt und auf Eis ohne Mühe gleitet.', 'A sabertooth wyvern that unleashes blizzards and glides on ice effortlessly.'),
('Khezu', 'Khezu', 'flying_wyvern', 'fire', 'Sumpfhöhlen', 'Swamp Caves', 'Ein blinder Höhlenwyvern der seine Beute über Geruch und elektrische Impulse aufspürt.', 'A blind cave wyvern that tracks prey through scent and electrical impulses.'),
('Gravios', 'Gravios', 'flying_wyvern', 'water', 'Vulkanhöhlen', 'Volcanic Hollows', 'Ein riesiger gepanzerter Wyvern der in Vulkangebieten lebt und Hitzestrahlen verschießt.', 'A huge armored wyvern living in volcanic areas that fires heat beams.'),
('Espinas', 'Espinas', 'flying_wyvern', 'ice', 'Uralter Wald', 'Ancient Forest', 'Meist schlafend und friedlich, aber im Zorn mit giftigen Stacheln extrem gefährlich.', 'Usually sleeping and peaceful, but extremely dangerous with venomous spines when enraged.'),
('Seregios', 'Seregios', 'flying_wyvern', 'thunder', 'Sandebenen', 'Sandy Plains', 'Ein hochaggressiver Wyvern mit Schuppen die er wie Geschosse abfeuern kann.', 'A highly aggressive wyvern with scales it can launch like projectiles.'),
('Legiana', 'Legiana', 'flying_wyvern', 'thunder', 'Korallenhochebene', 'Coral Highlands', 'Ein anmutiger Wyvern der mit seinen eisigen Flügeln Beute einfriert.', 'A graceful wyvern that freezes prey with its icy wings.'),
('Zinogre', 'Zinogre', 'fanged_wyvern', 'ice', 'Uralter Wald', 'Ancient Forest', 'Der Donnerwolf nutzt Thunderbugs um verheerende Blitzattacken zu entfesseln.', 'The Thunder Wolf uses Thunderbugs to unleash devastating electrical attacks.'),
('Tobi-Kadachi', 'Tobi-Kadachi', 'fanged_wyvern', 'water', 'Uralter Wald', 'Ancient Forest', 'Ein wendiger Baumbewohner der statische Elektrizität in seinem Fell aufbaut.', 'An agile tree-dweller that builds up static electricity in its fur.'),
('Odogaron', 'Odogaron', 'fanged_wyvern', 'ice', 'Korallenhochebene', 'Coral Highlands', 'Ein blutrünstiges Raubtier mit rasiermesserscharfen Klauen.', 'A bloodthirsty predator with razor-sharp claws.'),
('Lunagaron', 'Lunagaron', 'fanged_wyvern', 'fire', 'Frostige Gipfel', 'Frozen Peaks', 'Ein wolfsähnlicher Wyvern der sich mit Eis überzieht und aufrecht kämpft.', 'A wolf-like wyvern that coats itself in ice and fights upright.'),
('Anjanath', 'Anjanath', 'brute_wyvern', 'water', 'Uralter Wald', 'Ancient Forest', 'Ein aggressiver Wyvern mit einem Nasenkamm der Feuer entfacht.', 'An aggressive wyvern with a nasal crest that ignites fire.'),
('Glavenus', 'Glavenus', 'brute_wyvern', 'water', 'Vulkanhöhlen', 'Volcanic Hollows', 'Sein schwertartiger Schwanz wird durch Reibung zum Glühen gebracht.', 'Its blade-like tail is heated to a glow through friction.'),
('Brachydios', 'Brachydios', 'brute_wyvern', 'water', 'Vulkanhöhlen', 'Volcanic Hollows', 'Ein explosiver Wyvern mit Fäusten die mit Sprengschleim überzogen sind.', 'An explosive wyvern with fists coated in blast slime.'),
('Barroth', 'Barroth', 'brute_wyvern', 'fire', 'Sandebenen', 'Sandy Plains', 'Ein Schlamm liebender Wyvern der mit seinem massiven Kopf zuschlägt.', 'A mud-loving wyvern that strikes with its massive head.'),
('Lagiacrus', 'Lagiacrus', 'leviathan', 'fire', 'Küstenregion', 'Coastal Region', 'Der Herrscher der Meere kontrolliert Blitze sowohl an Land als auch unter Wasser.', 'The Lord of the Seas controls lightning both on land and underwater.'),
('Mizutsune', 'Mizutsune', 'leviathan', 'thunder', 'Schattenwald', 'Shadow Forest', 'Ein eleganter Leviathan der seine Beute mit Blasen ausrutschen lässt.', 'An elegant leviathan that makes prey slip with bubbles.'),
('Royal Ludroth', 'Royal Ludroth', 'leviathan', 'fire', 'Küstenregion', 'Coastal Region', 'Ein schwammiger Leviathan der Wasser in seiner Mähne speichert.', 'A spongy leviathan that stores water in its spongy mane.'),
('Almudron', 'Almudron', 'leviathan', 'thunder', 'Sandebenen', 'Sandy Plains', 'Kontrolliert goldenen Schlamm und formt ihn zu tödlichen Angriffen.', 'Controls golden mud and shapes it into deadly attacks.'),
('Magnamalo', 'Magnamalo', 'fanged_wyvern', 'water', 'Schattenwald', 'Shadow Forest', 'Der Fürst der Finsternis nutzt Hellfiregas als tödliche Waffe.', 'The Wight of Malice uses hellfire gas as a deadly weapon.'),
('Malzeno', 'Malzeno', 'elder_dragon', 'fire', 'Zitadelle', 'Citadel', 'Ein vampirischer Älterer Drache der Lebensenergie absaugt.', 'A vampiric Elder Dragon that drains life energy.'),
('Velkhana', 'Velkhana', 'elder_dragon', 'fire', 'Frostige Gipfel', 'Frozen Peaks', 'Ein majestätischer Älterer Drache der alles in Eis verwandelt.', 'A majestic Elder Dragon that turns everything to ice.'),
('Garangolm', 'Garangolm', 'fanged_beast', 'dragon', 'Zitadelle', 'Citadel', 'Ein gewaltiger Primat der seine Fäuste mit Feuer und Wasser verstärkt.', 'A massive primate that empowers its fists with fire and water.'),
('Rey Dau', 'Rey Dau', 'flying_wyvern', 'water', 'Sandebenen', 'Sandy Plains', 'Ein neu entdeckter Wyvern der Gewitter erzeugt und Blitze lenkt.', 'A newly discovered wyvern that creates thunderstorms and directs lightning.'),
('Arkveld', 'Arkveld', 'elder_dragon', 'fire', 'Unbekannt', 'Unknown', 'Eine mysteriöse skelettartige Kreatur die andere Monster kontrolliert.', 'A mysterious skeletal creature that controls other monsters.'),
('Deviljho', 'Deviljho', 'brute_wyvern', 'dragon', 'Verschiedene', 'Various', 'Ein ewig hungriger Tyrann der ganze Ökosysteme verschlingen kann.', 'An eternally hungry tyrant that can devour entire ecosystems.'),
('Diablos', 'Diablos', 'flying_wyvern', 'ice', 'Sandebenen', 'Sandy Plains', 'Der Tyrann der Wüste. Extrem territorial und stürzt sich aus dem Sand auf Eindringlinge.', 'The Desert Tyrant. Extremely territorial, bursting from the sand at intruders.');

-- Equipment
INSERT INTO equipment (name_de, name_en, type, rarity, stats, materials_de, materials_en, description_de, description_en) VALUES
('Rathalos-Schwert', 'Rathalos Blade', 'weapon', 5, '{"attack": 180, "element": "fire", "element_value": 30, "affinity": 10}', '["Rathalos-Schuppe x3", "Rathalos-Schwanz x1", "Flammsack x2"]', '["Rathalos Scale x3", "Rathalos Tail x1", "Flame Sac x2"]', 'Ein Schwert geschmiedet aus den Materialien des Königs der Lüfte.', 'A blade forged from the materials of the King of the Skies.'),
('Zinogre-Rüstung', 'Zinogre Armor', 'armor', 5, '{"defense": 120, "thunder_res": 25, "water_res": -15, "skills": ["Thunder Attack +2"]}', '["Zinogre-Fell x4", "Zinogre-Klaue x2", "Donnerkäfer x5"]', '["Zinogre Pelt x4", "Zinogre Claw x2", "Thunderbug x5"]', 'Rüstung durchzogen von der Blitzenergie des Donnerwolfs.', 'Armor infused with the electrical energy of the Thunder Wolf.'),
('Nargacuga-Dolche', 'Nargacuga Blades', 'weapon', 4, '{"attack": 150, "element": "none", "affinity": 35, "sharpness": "white"}', '["Nargacuga-Fell x3", "Nargacuga-Schwanzspitze x1"]', '["Nargacuga Pelt x3", "Nargacuga Tail Tip x1"]', 'Rasiermesserscharfe Klingen für blitzschnelle Angriffe.', 'Razor-sharp blades for lightning-fast attacks.'),
('Mizutsune-Rüstung', 'Mizutsune Armor', 'armor', 4, '{"defense": 100, "water_res": 20, "fire_res": -10, "skills": ["Bubble Dance"]}', '["Mizutsune-Schuppe x4", "Blasendrüse x3"]', '["Mizutsune Scale x4", "Bubble Gland x3"]', 'Elegante Rüstung die den Träger geschmeidiger macht.', 'Elegant armor that makes the wearer more nimble.'),
('Tigrex-Hammer', 'Tigrex Hammer', 'weapon', 5, '{"attack": 210, "element": "none", "affinity": -10, "stun": 30}', '["Tigrex-Fang x3", "Tigrex-Klaue x2", "Tigrex-Schädel x1"]', '["Tigrex Fang x3", "Tigrex Claw x2", "Tigrex Skull x1"]', 'Ein brutaler Hammer mit der rohen Kraft des Tigrex.', 'A brutal hammer with the raw power of Tigrex.');
