/**
 * utils/seedData.js
 * ---------------------------------------------
 * Populates darshan_booking_db with:
 *   - 10 major temples (Temple collection)
 *   - a handful of open DarshanSlot documents per temple
 *   - one demo admin account
 *   - three demo organizer accounts, each managing one temple
 *
 * Safe to re-run: Temple + DarshanSlot are cleared and reinserted every
 * time (they're pure demo/reference data), while the admin/organizer
 * accounts are upserted by email so re-running never creates duplicates
 * and never touches real devotee signups or bookings.
 *
 * Run with:  npm run seed
 * ---------------------------------------------
 */

require('dotenv').config();
const connectDB = require('../config/db');
const { User, Temple, DarshanSlot } = require('../models');

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

const TEMPLES = [
  {
    name: 'Tirumala Venkateswara Temple',
    deity: 'Lord Venkateswara (Vishnu)',
    description: 'Tirumala is a spiritual town in Tirupati district, Andhra Pradesh, home to one of the world\'s most visited and richest pilgrimage sites, dedicated to Lord Venkateswara.',
    location: { address: 'TTD Administrative Building, K.T. Road', city: 'Tirupati', state: 'Andhra Pradesh', pincode: '517504' },
    images: [{ url: 'images/tirumala.jpg', caption: 'Tirumala Venkateswara Temple' }],
    timings: { openTime: '02:30', closeTime: '23:30' },
    poojaTypes: [
      { name: 'Sarva Darshan', price: 0, duration: 15 },
      { name: 'Seeghra Darshanam', price: 300, duration: 10 },
    ],
    rating: 4.8,
  },
  {
    name: 'Shirdi Sai Baba Temple',
    deity: 'Sai Baba',
    description: 'The Sai Baba Samadhi Mandir in Shirdi, Maharashtra, is where Sai Baba\'s body has been laid to eternal rest since 1918. It draws millions of devotees every year.',
    location: { address: 'Mauli Nagar', city: 'Shirdi', state: 'Maharashtra', pincode: '423109' },
    images: [{ url: 'images/shirdi.jpg', caption: 'Shirdi Sai Baba Temple' }],
    timings: { openTime: '05:00', closeTime: '22:30' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'Kakad Aarti Darshan', price: 150, duration: 10 },
    ],
    rating: 4.7,
  },
  {
    name: 'Kashi Vishwanath Temple',
    deity: 'Lord Shiva',
    description: 'Kashi Vishwanath Temple in Varanasi, Uttar Pradesh, is one of the twelve Jyotirlinga shrines of Lord Shiva and among the holiest Hindu pilgrimage sites.',
    location: { address: 'Vishwanath Gali, Lahori Tola', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' },
    images: [{ url: 'images/kashi.jpg', caption: 'Kashi Vishwanath Temple' }],
    timings: { openTime: '03:00', closeTime: '23:00' },
    poojaTypes: [
      { name: 'Sugam Darshan', price: 300, duration: 10 },
      { name: 'Rudrabhishek', price: 500, duration: 20 },
    ],
    rating: 4.6,
  },
  {
    name: 'Srisailam Mallikarjuna Temple',
    deity: 'Lord Mallikarjuna & Goddess Bhramaramba',
    description: 'Located on the Nallamala hills of Andhra Pradesh, Srisailam is one of the twelve Jyotirlinga and eighteen Shakti Peetha sites, a rare confluence of both.',
    location: { address: 'Srisailam Devasthanam Road', city: 'Srisailam', state: 'Andhra Pradesh', pincode: '518101' },
    images: [{ url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mallikarjuna_Temple,_Sri_Sailam.jpg?width=800', caption: 'Srisailam Mallikarjuna Temple (Wikimedia Commons, CC BY-SA 4.0)' }],
    timings: { openTime: '04:30', closeTime: '21:30' },
    poojaTypes: [
      { name: 'Sarva Darshan', price: 0, duration: 15 },
      { name: 'Special Darshan', price: 250, duration: 10 },
    ],
    rating: 4.5,
  },
  {
    name: 'Jagannath Temple',
    deity: 'Lord Jagannath (Vishnu)',
    description: 'The Jagannath Temple in Puri, Odisha, is a major Vaishnava pilgrimage site famed for its annual Rath Yatra chariot festival.',
    location: { address: 'Grand Road', city: 'Puri', state: 'Odisha', pincode: '752001' },
    images: [{ url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jagannath_Temple,Puri.jpg?width=800', caption: 'Jagannath Temple, Puri (Wikimedia Commons, CC BY-SA)' }],
    timings: { openTime: '05:00', closeTime: '23:00' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'Special Darshan', price: 200, duration: 10 },
    ],
    rating: 4.6,
  },
  {
    name: 'Meenakshi Amman Temple',
    deity: 'Goddess Meenakshi & Lord Sundareswarar',
    description: 'A historic Hindu temple in Madurai, Tamil Nadu, celebrated for its towering, intricately carved gopurams and vibrant Dravidian architecture.',
    location: { address: 'Madurai Main', city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },
    images: [{ url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Madurai_Meenakshi_Amman_Kovil.jpg?width=800', caption: 'Meenakshi Amman Temple, Madurai (Wikimedia Commons, CC BY-SA)' }],
    timings: { openTime: '05:00', closeTime: '21:30' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'Special Darshan', price: 100, duration: 10 },
    ],
    rating: 4.7,
  },
  {
    name: 'Somnath Temple',
    deity: 'Lord Shiva (Somnath Jyotirlinga)',
    description: 'The first among the twelve Jyotirlinga shrines, Somnath Temple stands on the western coast of Gujarat, rebuilt several times through history.',
    location: { address: 'Somnath Temple Road', city: 'Prabhas Patan', state: 'Gujarat', pincode: '362268' },
    images: [{ url: 'images/somnath.jpg', caption: 'Somnath Temple' }],
    timings: { openTime: '06:00', closeTime: '21:30' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'Sukhad Darshan', price: 200, duration: 10 },
    ],
    rating: 4.5,
  },
  {
    name: 'Kedarnath Temple',
    deity: 'Lord Shiva',
    description: 'Perched in the Garhwal Himalayas of Uttarakhand, Kedarnath is one of the twelve Jyotirlingas and part of the sacred Char Dham pilgrimage.',
    location: { address: 'Kedarnath Temple Complex', city: 'Kedarnath', state: 'Uttarakhand', pincode: '246445' },
    images: [{ url: 'images/kedarnath.jpg', caption: 'Kedarnath Temple' }],
    timings: { openTime: '06:00', closeTime: '19:00' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'VIP Darshan', price: 400, duration: 10 },
    ],
    rating: 4.9,
  },
  {
    name: 'Badrinath Temple',
    deity: 'Lord Vishnu',
    description: 'Dedicated to Lord Vishnu, Badrinath Temple sits in the Chamoli district of Uttarakhand and is one of the four sacred Char Dham sites.',
    location: { address: 'Badrinath Temple Complex', city: 'Badrinath', state: 'Uttarakhand', pincode: '246422' },
    images: [{ url: 'images/badrinath.jpg', caption: 'Badrinath Temple' }],
    timings: { openTime: '04:30', closeTime: '21:00' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'VIP Darshan', price: 350, duration: 10 },
    ],
    rating: 4.8,
  },
  {
    name: 'Rameshwaram Ramanathaswamy Temple',
    deity: 'Lord Shiva (Ramanathaswamy)',
    description: 'Located on Rameshwaram island in Tamil Nadu, this temple is one of the twelve Jyotirlingas and a key site in the Char Dham pilgrimage, famed for its long pillared corridors.',
    location: { address: 'East Car Street', city: 'Rameshwaram', state: 'Tamil Nadu', pincode: '623526' },
    images: [{ url: 'images/rameshwaram.jpg', caption: 'Rameshwaram Ramanathaswamy Temple' }],
    timings: { openTime: '05:00', closeTime: '21:00' },
    poojaTypes: [
      { name: 'General Darshan', price: 0, duration: 15 },
      { name: 'Special Darshan', price: 250, duration: 10 },
    ],
    rating: 4.6,
  },
];

// Organizer demo accounts — the first three temples get a manager, mirroring
// the original demo's "Tirumala / Shirdi Sai / Kasi Vishwanath" organizers.
const ORGANIZERS = [
  { name: 'Tirumala Organizer', email: 'tirumala@darshanease.app', phone: '9000000001', templeIndex: 0 },
  { name: 'Shirdi Sai Organizer', email: 'shirdi@darshanease.app', phone: '9000000002', templeIndex: 1 },
  { name: 'Kashi Vishwanath Organizer', email: 'kashi@darshanease.app', phone: '9000000003', templeIndex: 2 },
];

const ADMIN = { name: 'DarshanEase Admin', email: 'admin@darshanease.app', phone: '9000000000', password: 'Admin@123' };
const ORGANIZER_PASSWORD = 'Organizer@123';

async function seed() {
  await connectDB();

  console.log('Clearing existing demo Temple + DarshanSlot data...');
  await DarshanSlot.deleteMany({});
  await Temple.deleteMany({});

  console.log('Inserting 10 temples...');
  const temples = await Temple.insertMany(TEMPLES);

  console.log('Creating darshan slots...');
  const slotDocs = [];
  const slotDates = [daysFromNow(1), daysFromNow(2)];
  temples.forEach((temple) => {
    temple.poojaTypes.forEach((pooja, idx) => {
      slotDates.forEach((date) => {
        slotDocs.push({
          temple: temple._id,
          date,
          startTime: idx === 0 ? '06:00' : '16:00',
          endTime: idx === 0 ? '12:00' : '20:00',
          poojaType: pooja.name,
          pricePerTicket: pooja.price,
          totalCapacity: 100,
          bookedCount: 0,
          status: 'open',
        });
      });
    });
  });
  await DarshanSlot.insertMany(slotDocs);
  console.log(`Created ${slotDocs.length} darshan slots.`);

  console.log('Upserting admin account...');
  let admin = await User.findOne({ email: ADMIN.email });
  if (!admin) {
    admin = new User({ ...ADMIN, role: 'admin' });
    await admin.save();
  }

  console.log('Upserting organizer accounts...');
  for (const org of ORGANIZERS) {
    const temple = temples[org.templeIndex];
    let user = await User.findOne({ email: org.email });
    if (!user) {
      user = new User({
        name: org.name, email: org.email, phone: org.phone,
        password: ORGANIZER_PASSWORD, role: 'freelancer', managedTemple: temple._id,
      });
      await user.save();
    } else {
      user.managedTemple = temple._id;
      await user.save();
    }
  }

  console.log('\n✅ Seed complete.');
  console.log('   Temples:', temples.length);
  console.log('   Darshan slots:', slotDocs.length);
  console.log('\nDemo accounts:');
  console.log(`   Admin      -> ${ADMIN.email} / ${ADMIN.password}`);
  ORGANIZERS.forEach((o) => console.log(`   Organizer  -> ${o.email} / ${ORGANIZER_PASSWORD} (manages ${TEMPLES[o.templeIndex].name})`));
  console.log('\nSign up as a devotee from the website to test the booking flow.');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
