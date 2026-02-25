import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'glinterest.db');

// Delete existing DB and recreate
import { unlinkSync, existsSync } from 'fs';
if (existsSync(dbPath)) unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

const passwordHash = bcrypt.hashSync('password123', 10);

// ── Users ──────────────────────────────────────────────────────────
const insertUser = db.prepare(
  'INSERT INTO users (username, email, password_hash, display_name, avatar_url, bio) VALUES (?, ?, ?, ?, ?, ?)'
);

const users = [
  ['alice_chen', 'alice@example.com', passwordHash, 'Alice Chen', 'https://i.pravatar.cc/150?u=alice', 'Frontend developer & design enthusiast. I collect inspiration like some people collect stamps.'],
  ['bob_martinez', 'bob@example.com', passwordHash, 'Bob Martinez', 'https://i.pravatar.cc/150?u=bob', 'Backend engineer. API whisperer. Coffee-powered code machine.'],
  ['carol_park', 'carol@example.com', passwordHash, 'Carol Park', 'https://i.pravatar.cc/150?u=carol', 'UX designer with a passion for accessibility. Making the web beautiful for everyone.'],
  ['dave_wilson', 'dave@example.com', passwordHash, 'Dave Wilson', 'https://i.pravatar.cc/150?u=dave', 'QA engineer & weekend photographer. I break things so you don\'t have to.'],
  ['emily_ross', 'emily@example.com', passwordHash, 'Emily Ross', 'https://i.pravatar.cc/150?u=emily', 'Creative director. If it\'s aesthetic, I\'m saving it.'],
];

for (const u of users) insertUser.run(...u);
console.log(`Seeded ${users.length} users`);

// ── Boards ─────────────────────────────────────────────────────────
const insertBoard = db.prepare(
  'INSERT INTO boards (user_id, title, description, cover_image_url) VALUES (?, ?, ?, ?)'
);

const boards = [
  [1, 'Travel Inspiration', 'Dream destinations and wanderlust fuel', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'],
  [2, 'Recipe Ideas', 'Dishes I want to try cooking this year', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'],
  [1, 'Home Office Setup', 'Desk goals and workspace inspiration', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'],
  [4, 'Weekend Projects', 'DIY builds and crafts for the weekend', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400'],
  [4, 'Street Photography', 'Urban moments captured candidly', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400'],
  [3, 'Book Recommendations', 'Must-reads and cozy reading setups', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
  [3, 'Fitness Motivation', 'Workouts, outdoor runs, and healthy living', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'],
  [5, 'Vintage Finds', 'Retro treasures and antique discoveries', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'],
];

for (const b of boards) insertBoard.run(...b);
console.log(`Seeded ${boards.length} boards`);

// ── Pins ───────────────────────────────────────────────────────────
const insertPin = db.prepare(
  'INSERT INTO pins (user_id, board_id, title, description, image_url, source_url) VALUES (?, ?, ?, ?, ?, ?)'
);
const insertTag = db.prepare('INSERT OR IGNORE INTO pin_tags (pin_id, tag) VALUES (?, ?)');

const pins = [
  // Board 1: Travel Inspiration (user 1 - Alice)
  [1, 1, 'Santorini Sunset', 'The most magical sunset I\'ve ever seen — those blue domes against the orange sky', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600', '', ['travel', 'greece', 'sunset', 'architecture']],
  [1, 1, 'Kyoto Bamboo Grove', 'Walking through the bamboo forest in Arashiyama — pure serenity', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600', '', ['travel', 'japan', 'nature', 'zen']],
  [1, 1, 'Northern Lights in Iceland', 'Bucket list: check. The aurora was even more beautiful than photos can capture', 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=600', '', ['travel', 'iceland', 'aurora', 'nature']],
  [1, 1, 'Swiss Alps Train', 'The Glacier Express — every window is a postcard', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', '', ['travel', 'switzerland', 'mountains', 'train']],
  [1, 1, 'Amalfi Coast Drive', 'Winding roads, lemon groves, and that impossibly blue water', 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=600', '', ['travel', 'italy', 'coast', 'summer']],
  [1, 1, 'Tokyo at Night', 'Neon-lit streets of Shinjuku — the city that never sleeps', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', '', ['travel', 'japan', 'city', 'night']],
  [1, 1, 'Bali Rice Terraces', 'Tegallalang rice terraces at golden hour — sheer perfection', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600', '', ['travel', 'bali', 'nature', 'landscape']],
  [1, 1, 'Moroccan Riad', 'The interiors of this Marrakech riad are absolutely stunning', 'https://images.unsplash.com/photo-1548018560-c7196e4f5baa?w=600', '', ['travel', 'morocco', 'architecture', 'interior']],
  [1, 1, 'Maldives Overwater Villa', 'Crystal clear water and overwater bungalows — paradise found', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', '', ['travel', 'maldives', 'beach', 'luxury']],
  [1, 1, 'Patagonia Peaks', 'Torres del Paine at sunrise — worth every minute of the hike', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', '', ['travel', 'patagonia', 'mountains', 'hiking']],
  [1, 1, 'Prague Old Town', 'Fairy tale architecture everywhere you look', 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600', '', ['travel', 'prague', 'architecture', 'europe']],
  [1, 1, 'New Zealand Fjord', 'Milford Sound on a misty morning — otherworldly', 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600', '', ['travel', 'newzealand', 'nature', 'fjord']],

  // Board 2: Recipe Ideas (user 2 - Bob)
  [2, 2, 'Homemade Pasta', 'Fresh egg pasta from scratch — easier than you think', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600', '', ['food', 'pasta', 'italian', 'cooking']],
  [2, 2, 'Sourdough Bread', 'Finally nailed my sourdough starter after three weeks', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', '', ['food', 'bread', 'baking', 'sourdough']],
  [2, 2, 'Thai Green Curry', 'Made from scratch with fresh herbs — restaurant quality', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600', '', ['food', 'thai', 'curry', 'cooking']],
  [2, 2, 'Açaí Bowl', 'The perfect post-workout breakfast with all the toppings', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', '', ['food', 'healthy', 'breakfast', 'acai']],
  [2, 2, 'Neapolitan Pizza', 'Wood-fired in my backyard pizza oven — leopard spots and all', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', '', ['food', 'pizza', 'italian', 'baking']],
  [2, 2, 'Sushi Platter', 'Attempted a sushi spread — presentation is everything', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600', '', ['food', 'sushi', 'japanese', 'cooking']],
  [2, 2, 'French Croissants', 'Three-day lamination process but so worth it', 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600', '', ['food', 'pastry', 'french', 'baking']],
  [2, 2, 'Ramen Bowl', 'Tonkotsu ramen with 12-hour bone broth — liquid gold', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', '', ['food', 'ramen', 'japanese', 'soup']],
  [2, 2, 'Charcuterie Board', 'Date night charcuterie — went a little overboard', 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', '', ['food', 'entertaining', 'cheese', 'appetizer']],
  [2, 2, 'Matcha Latte Art', 'Finally got the pour right on my matcha lattes', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', '', ['food', 'matcha', 'coffee', 'latte']],

  // Board 3: Home Office Setup (user 1 - Alice)
  [1, 3, 'Minimalist Desk Setup', 'Clean lines, cable management, and a single monitor — less is more', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', '', ['office', 'desk', 'minimalist', 'workspace']],
  [1, 3, 'Standing Desk Corner', 'My new standing desk with the monitor arm — game changer for posture', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600', '', ['office', 'desk', 'ergonomic', 'tech']],
  [1, 3, 'Cozy Reading Nook Office', 'Added a reading corner to my home office — productivity and comfort', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', '', ['office', 'cozy', 'reading', 'interior']],
  [1, 3, 'Plant-Filled Workspace', 'My desk jungle — 12 plants and counting', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600', '', ['office', 'plants', 'desk', 'nature']],
  [1, 3, 'Dual Monitor Developer Setup', 'Ultrawide + vertical monitor for coding — the dream setup', 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600', '', ['office', 'coding', 'developer', 'tech']],
  [1, 3, 'Natural Light Office', 'Floor-to-ceiling windows make all the difference', 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600', '', ['office', 'light', 'interior', 'workspace']],
  [1, 3, 'Pegboard Organization', 'Pegboard above the desk for tools and supplies — so satisfying', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600', '', ['office', 'organization', 'diy', 'workspace']],
  [1, 3, 'Retro Tech Office', 'Vintage keyboard and CRT monitor for the aesthetic — still daily-driving modern hardware', 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=600', '', ['office', 'retro', 'vintage', 'tech']],

  // Board 4: Weekend Projects (user 4 - Dave)
  [4, 4, 'Wooden Shelf Build', 'Built floating shelves from reclaimed wood — first woodworking project', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600', '', ['diy', 'woodworking', 'shelves', 'home']],
  [4, 4, 'Raspberry Pi Dashboard', 'Weather + calendar + news on an old monitor — Pi-powered info board', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600', '', ['diy', 'tech', 'raspberrypi', 'coding']],
  [4, 4, 'Leather Journal Binding', 'Hand-bound leather journal — surprisingly meditative process', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600', '', ['diy', 'craft', 'leather', 'journal']],
  [4, 4, 'Concrete Planters', 'Poured my own concrete planters — industrial chic on a budget', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600', '', ['diy', 'garden', 'concrete', 'plants']],
  [4, 4, 'Custom Mechanical Keyboard', 'Gateron switches, PBT keycaps, and a walnut case — endgame (for now)', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600', '', ['diy', 'keyboard', 'tech', 'custom']],
  [4, 4, 'Terracotta Pot Painting', 'Hand-painted terracotta pots for the herb garden', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600', '', ['diy', 'garden', 'painting', 'craft']],
  [4, 4, 'Epoxy River Table', 'My first attempt at a river table — messy but worth it', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', '', ['diy', 'woodworking', 'epoxy', 'furniture']],
  [4, 4, 'Macramé Wall Hanging', 'Picked up macramé during quarantine — this one took 20 hours', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', '', ['diy', 'macrame', 'craft', 'decor']],

  // Board 5: Street Photography (user 4 - Dave)
  [4, 5, 'Rainy City Reflections', 'Puddle reflections on a rainy evening in downtown — love how neon bleeds', 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=600', '', ['photography', 'street', 'rain', 'city']],
  [4, 5, 'Morning Commute', 'Rush hour at the subway — everyone in their own world', 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600', '', ['photography', 'street', 'subway', 'people']],
  [4, 5, 'Chinatown Signs', 'Layers of neon signs in Chinatown — visual overload in the best way', 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600', '', ['photography', 'street', 'neon', 'urban']],
  [4, 5, 'Shadow Play', 'Hard shadows at midday — sometimes harsh light is your friend', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600', '', ['photography', 'street', 'shadows', 'bw']],
  [4, 5, 'Market Day', 'Farmer\'s market on Saturday morning — color and chaos', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', '', ['photography', 'street', 'market', 'color']],
  [4, 5, 'Fire Escape Geometry', 'Looking up at fire escapes — the geometry of NYC', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600', '', ['photography', 'street', 'architecture', 'nyc']],
  [4, 5, 'Late Night Diner', 'Edward Hopper vibes at 2am — the last customers of the night', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600', '', ['photography', 'street', 'night', 'diner']],
  [4, 5, 'Crosswalk Motion', 'Long exposure at the crosswalk — ghosts of pedestrians', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600', '', ['photography', 'street', 'longexposure', 'motion']],

  // Board 6: Book Recommendations (user 3 - Carol)
  [3, 6, 'Cozy Reading Stack', 'My autumn reading list — stacked and ready to go', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', '', ['books', 'reading', 'cozy', 'autumn']],
  [3, 6, 'Library Aesthetic', 'Found this stunning library in an old mansion — bookworm heaven', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600', '', ['books', 'library', 'architecture', 'aesthetic']],
  [3, 6, 'Reading by the Window', 'The perfect reading spot — natural light, coffee, and a good book', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600', '', ['books', 'reading', 'cozy', 'coffee']],
  [3, 6, 'Bookshelf Goals', 'Color-organized bookshelf — finally did the thing', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600', '', ['books', 'bookshelf', 'organization', 'decor']],
  [3, 6, 'Indie Bookstore Find', 'This little bookshop had the best curated selection', 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=600', '', ['books', 'bookstore', 'indie', 'shopping']],
  [3, 6, 'Journaling Spread', 'Reading journal with mini reviews — helps me remember what I loved', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600', '', ['books', 'journal', 'writing', 'creative']],

  // Board 7: Fitness Motivation (user 3 - Carol)
  [3, 7, 'Mountain Trail Run', 'Nothing beats a trail run at sunrise — this view was the reward', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', '', ['fitness', 'running', 'trail', 'outdoors']],
  [3, 7, 'Yoga at Sunrise', 'Beach yoga session — the sound of waves as your soundtrack', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', '', ['fitness', 'yoga', 'beach', 'wellness']],
  [3, 7, 'Home Gym Setup', 'Converted the garage into a gym — no more excuses', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', '', ['fitness', 'gym', 'homegym', 'workout']],
  [3, 7, 'Meal Prep Sunday', 'This week\'s meal prep — grilled chicken, quinoa, and roasted veggies', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', '', ['fitness', 'mealprep', 'healthy', 'food']],
  [3, 7, 'Rock Climbing Wall', 'First time at the climbing gym — hooked immediately', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600', '', ['fitness', 'climbing', 'gym', 'adventure']],
  [3, 7, 'Swimming Laps', 'Early morning laps at the outdoor pool — the water was perfect', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', '', ['fitness', 'swimming', 'pool', 'morning']],

  // Board 8: Vintage Finds (user 5 - Emily)
  [5, 8, 'Vintage Typewriter', 'Found this 1960s Olivetti at a flea market — still works perfectly', 'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=600', '', ['vintage', 'typewriter', 'retro', 'fleamarket']],
  [5, 8, 'Antique Camera Collection', 'My growing collection of film cameras — each one has a story', 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=600', '', ['vintage', 'camera', 'film', 'collection']],
  [5, 8, 'Mid-Century Chair', 'Scored this Eames-style chair for $40 at a garage sale', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600', '', ['vintage', 'furniture', 'midcentury', 'design']],
  [5, 8, 'Vinyl Record Wall', 'Finally mounted my favorite album covers on the wall', 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=600', '', ['vintage', 'vinyl', 'music', 'decor']],
  [5, 8, 'Retro Kitchen Appliances', 'SMEG toaster and matching kettle — the retro kitchen dream', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', '', ['vintage', 'kitchen', 'retro', 'appliances']],
  [5, 8, 'Old Map Collection', 'Framed antique maps — love seeing how people imagined the world', 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600', '', ['vintage', 'maps', 'antique', 'decor']],
];

const pinTransaction = db.transaction(() => {
  for (const [userId, boardId, title, description, imageUrl, sourceUrl, tags] of pins) {
    const result = insertPin.run(userId, boardId, title, description, imageUrl, sourceUrl);
    for (const tag of tags) {
      insertTag.run(result.lastInsertRowid, tag);
    }
  }
});
pinTransaction();
console.log(`Seeded ${pins.length} pins with tags`);

// ── Follows ────────────────────────────────────────────────────────
const insertFollow = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
const followPairs = [
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 1], [2, 3], [2, 4],
  [3, 1], [3, 2], [3, 5],
  [4, 1], [4, 2], [4, 3],
  [5, 1], [5, 3], [5, 4],
];
for (const [a, b] of followPairs) insertFollow.run(a, b);
console.log(`Seeded ${followPairs.length} follows`);

// ── Likes ──────────────────────────────────────────────────────────
const insertLike = db.prepare('INSERT INTO likes (user_id, pin_id) VALUES (?, ?)');
const totalPins = pins.length;
const likeSet = new Set();

// Generate ~120 random likes
for (let i = 0; i < 120; i++) {
  const userId = Math.floor(Math.random() * 5) + 1;
  const pinId = Math.floor(Math.random() * totalPins) + 1;
  const key = `${userId}-${pinId}`;
  if (!likeSet.has(key)) {
    likeSet.add(key);
    insertLike.run(userId, pinId);
  }
}
console.log(`Seeded ${likeSet.size} likes`);

// ── Saves ──────────────────────────────────────────────────────────
const insertSave = db.prepare('INSERT INTO saves (user_id, pin_id, board_id) VALUES (?, ?, ?)');
// Users save some pins from other boards to their own boards
const saves = [
  [2, 1, 2], [2, 3, 2],     // Bob saves Alice's travel pins
  [3, 13, 7], [3, 16, 7],    // Carol saves Bob's food pins
  [1, 30, 3],                 // Alice saves Dave's keyboard build
  [5, 39, 8], [5, 40, 8],    // Emily saves Carol's bookshelf
  [4, 23, 4],                 // Dave saves Alice's office setup
];
for (const [u, p, b] of saves) insertSave.run(u, p, b);
console.log(`Seeded ${saves.length} saves`);

// ── Comments ───────────────────────────────────────────────────────
const insertComment = db.prepare('INSERT INTO comments (user_id, pin_id, text) VALUES (?, ?, ?)');
const comments = [
  [2, 1, 'This is breathtaking! Santorini is definitely on my bucket list.'],
  [3, 1, 'The color palette here is incredible — those blues and oranges 😍'],
  [4, 1, 'Pro tip: go in late September for fewer crowds. Just as beautiful.'],
  [3, 5, 'The Amalfi Coast is magical. Did you drive or take the ferry?'],
  [1, 5, 'We drove! Terrifying but absolutely worth it for the views.'],
  [2, 13, 'Nothing beats fresh pasta. What flour did you use?'],
  [1, 14, 'I\'ve been trying to get my sourdough starter going for weeks. Any tips?'],
  [2, 14, 'Keep it at room temp and feed it every 12 hours — patience is key!'],
  [4, 23, 'This is so clean! What monitor arm is that?'],
  [1, 23, 'It\'s the Ergotron LX — best investment for my desk setup.'],
  [3, 30, 'That keyboard looks amazing! How long did the build take?'],
  [4, 30, 'About 3 hours for the build, but weeks of research picking parts 😅'],
  [5, 35, 'These shadows are so dramatic — love the contrast.'],
  [1, 39, 'Your bookshelf organization is goals! I need to do this.'],
  [3, 39, 'It took a whole weekend but so satisfying. Just sort by hue!'],
  [2, 45, 'That Olivetti is gorgeous. Does the ribbon still work?'],
  [5, 45, 'Had to order a new ribbon but now it prints perfectly!'],
  [1, 48, 'Vinyl on the wall is such a great idea. How did you mount them?'],
  [5, 48, 'Vinyl record frames from Amazon — they open so you can still play the records.'],
  [4, 18, 'Tonkotsu ramen from scratch? You\'re a legend.'],
];
for (const [u, p, t] of comments) insertComment.run(u, p, t);
console.log(`Seeded ${comments.length} comments`);

console.log('\nSeed complete! Database ready at:', dbPath);
