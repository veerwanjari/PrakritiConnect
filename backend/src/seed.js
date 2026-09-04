import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import Review from './models/Review.js';
import { generateQRCodeDataUrl } from './utils/qrcode.js';

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const volunteer = await User.create({
    name: 'Aarav Sharma',
    email: 'volunteer@example.com',
    password: 'password',
    role: 'volunteer',
    interests: ['Tree Plantation', 'Beach & River Cleanup'],
  });
  const organizer = await User.create({
    name: 'Meera Iyer',
    email: 'organizer@example.com',
    password: 'password',
    role: 'organizer',
  });
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
  });
  const users = [volunteer, organizer, admin];

  const now = new Date();
  const events = await Event.insertMany([
    {
      title: 'Neighbourhood Tree Plantation Drive',
      description: 'Join fellow volunteers to plant 200 native saplings along the riverside walking trail. Tools, saplings, and refreshments provided.',
      category: 'Tree Plantation',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: 'Riverside Trail, Sector 12',
      capacity: 100,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '',
      tags: ['beginner-friendly', 'outdoors', 'weekend'],
    },
    {
      title: 'Sunrise Beach Cleanup',
      description: 'A two-hour community cleanup to clear plastic waste from the shoreline before the monsoon tides carry it back out to sea.',
      category: 'Beach & River Cleanup',
      date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      location: 'Marina Beach, North End',
      capacity: 150,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '',
      tags: ['early-morning', 'family-friendly'],
    },
    {
      title: 'Waste Segregation & Composting Workshop',
      description: 'Hands-on session on segregating household waste and setting up a simple home compost bin using kitchen scraps.',
      category: 'Waste Segregation & Recycling',
      date: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      location: 'Community Hall, Green Park',
      capacity: 60,
      organizer: organizer._id,
      status: 'pending',
      posterUrl: '',
      tags: ['indoor', 'hands-on'],
    },
    {
      title: 'Save the Sparrows: Wildlife Awareness Rally',
      description: 'A public awareness walk highlighting the decline of urban bird species, with a pledge drive and nest-box distribution.',
      category: 'Wildlife Conservation',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: 'City Centre Plaza',
      capacity: 200,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '',
      tags: ['awareness', 'family-friendly'],
    },
    {
      title: 'Lake Restoration & Water Conservation Camp',
      description: 'Volunteers will help clear invasive weeds and desilt the inlet channel of the city lake to improve water retention before monsoon.',
      category: 'Water Conservation',
      date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      location: 'Sundar Lake',
      capacity: 80,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '',
      tags: ['physical-activity', 'weekend'],
    },
    {
      title: 'Community Kitchen Garden Setup',
      description: 'Build a shared organic vegetable garden with raised beds, compost, and a drip irrigation system for the local community centre.',
      category: 'Community Garden',
      date: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      location: 'Sunshine Community Centre',
      capacity: 40,
      organizer: organizer._id,
      status: 'approved',
      posterUrl: '',
      tags: ['gardening', 'kids-welcome'],
    },
  ]);

  const payload = JSON.stringify({ userId: volunteer._id.toString(), eventId: events[0]._id.toString(), at: Date.now() });
  const qr = await generateQRCodeDataUrl(payload);
  await Registration.create({ user: volunteer._id, event: events[0]._id, qrCodeDataUrl: qr, status: 'registered' });

  await Review.create({ user: volunteer._id, event: events[0]._id, rating: 5, comment: 'Beautifully organised — planted 12 saplings in one morning!' });
  await Event.findByIdAndUpdate(events[0]._id, { averageRating: 5 });

  await User.findByIdAndUpdate(volunteer._id, { $inc: { points: 25 } });

  console.log('Seeded users:', users.map((u) => ({ email: u.email, role: u.role })));
  console.log('Seeded events:', events.map((e) => ({ title: e.title, status: e.status })));
  console.log('One registration + review created for the demo volunteer.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
