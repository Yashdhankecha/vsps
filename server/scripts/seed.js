/**
 * VSPS Database Seed Script
 * Populates all collections with realistic demo data.
 *
 * Usage:  node scripts/seed.js
 *         npm run seed
 *
 * ⚠️  This will DROP existing data in every seeded collection.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── Models ────────────────────────────────────────────────────────────
const User = require('../models/User');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const EventCategory = require('../models/EventCategory');
const Form = require('../models/Form');
const GalleryItem = require('../models/GalleryItem');
const HomeContent = require('../models/HomeContent');
const { Resource, Article } = require('../models/Resource');
const Review = require('../models/Review');
const SamuhLagan = require('../models/SamuhLagan');
const StudentAward = require('../models/StudentAward');

// ── Helpers ───────────────────────────────────────────────────────────
const randomDate = (start, end) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const futureDate = (daysAhead = 90) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * daysAhead) + 7);
    return d;
};

const pastDate = (daysBack = 365) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysBack) - 1);
    return d;
};

// ── Seed Functions ────────────────────────────────────────────────────

async function seedUsers() {
    console.log('  → Seeding Users...');
    await User.deleteMany({});

    // We hash manually to avoid the pre-save hook running twice
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    const users = await User.insertMany([
        {
            username: 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@vsps.org',
            password: hash(process.env.ADMIN_PASSWORD || 'admin@123'),
            role: 'admin',
            phone: '9876543210',
            village: 'Ahmedabad',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'superadmin',
            email: 'superadmin@vsps.org',
            password: hash('Super@123'),
            role: 'superadmin',
            phone: '9876543211',
            village: 'Ahmedabad',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'usermanager',
            email: 'usermanager@vsps.org',
            password: hash('Manager@123'),
            role: 'usermanager',
            phone: '9876543212',
            village: 'Rajkot',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'contentmanager',
            email: 'contentmgr@vsps.org',
            password: hash('Content@123'),
            role: 'contentmanager',
            phone: '9876543213',
            village: 'Surat',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'bookingmanager',
            email: 'bookingmgr@vsps.org',
            password: hash('Booking@123'),
            role: 'bookingmanager',
            phone: '9876543214',
            village: 'Vadodara',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'formmanager',
            email: 'formmgr@vsps.org',
            password: hash('Form@123'),
            role: 'formmanager',
            phone: '9876543215',
            village: 'Bhavnagar',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'contactmanager',
            email: 'contactmgr@vsps.org',
            password: hash('Contact@123'),
            role: 'contactmanager',
            phone: '9876543216',
            village: 'Junagadh',
            isVerified: true,
            passwordHistory: [],
        },
        // Regular verified users
        {
            username: 'rajesh_patel',
            email: 'rajesh.patel@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898123456',
            village: 'Bavla',
            company: 'Patel Enterprises',
            address: '12, Shanti Nagar, Bavla, Gujarat',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'priya_shah',
            email: 'priya.shah@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898234567',
            village: 'Dholka',
            company: 'Shah Textiles',
            address: '45, Laxmi Society, Dholka, Gujarat',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'amit_vyas',
            email: 'amit.vyas@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898345678',
            village: 'Sanand',
            address: '78, Ganesh Colony, Sanand, Gujarat',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'meena_joshi',
            email: 'meena.joshi@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898456789',
            village: 'Viramgam',
            address: '23, Ram Nagar, Viramgam, Gujarat',
            isVerified: true,
            passwordHistory: [],
        },
        {
            username: 'suresh_modi',
            email: 'suresh.modi@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898567890',
            village: 'Mandal',
            address: '56, Krishna Park, Mandal, Gujarat',
            isVerified: true,
            passwordHistory: [],
        },
        // Unverified user
        {
            username: 'new_user',
            email: 'newuser@gmail.com',
            password: hash('User@123'),
            role: 'user',
            phone: '9898678901',
            village: 'Dhandhuka',
            isVerified: false,
            passwordHistory: [],
        },
    ]);

    console.log(`    ✓ ${users.length} users created`);
    return users;
}

async function seedBookings(users) {
    console.log('  → Seeding Bookings...');
    await Booking.deleteMany({});

    const eventTypes = ['Wedding', 'Engagement', 'Birthday Party', 'Corporate Event', 'Anniversary', 'Religious Ceremony', 'Community Gathering'];
    const docTypes = ['Aadhar Card', 'PAN Card', 'Event Invitation', 'Organization Letterhead', 'Other'];
    const services = ['Catering', 'Decoration', 'DJ & Music', 'Photography', 'Videography', 'Valet Parking', 'Flower Arrangement', 'Lighting'];
    const villages = ['Bavla', 'Dholka', 'Sanand', 'Viramgam', 'Mandal', 'Dhandhuka', 'Ranpur', 'Limbdi'];

    const bookings = [];
    const statuses = ['Pending', 'Approved', 'Booked', 'Rejected'];

    for (let i = 0; i < 15; i++) {
        const status = statuses[i % statuses.length];
        const selectedServices = services.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1);

        bookings.push({
            firstName: ['Rajesh', 'Priya', 'Amit', 'Meena', 'Suresh', 'Kavita', 'Jayesh', 'Rekha', 'Nilesh', 'Hetal', 'Bhavin', 'Komal', 'Dharmesh', 'Nisha', 'Kiran'][i],
            surname: ['Patel', 'Shah', 'Vyas', 'Joshi', 'Modi', 'Desai', 'Trivedi', 'Parmar', 'Solanki', 'Raval', 'Gandhi', 'Mehta', 'Bhatt', 'Sharma', 'Chauhan'][i],
            email: `booking${i + 1}@example.com`,
            phone: `98${String(i).padStart(2, '0')}${String(Math.floor(Math.random() * 900000) + 100000)}`,
            eventType: eventTypes[i % eventTypes.length],
            date: futureDate(120),
            villageName: villages[i % villages.length],
            guestCount: Math.floor(Math.random() * 400) + 50,
            additionalServices: selectedServices,
            additionalNotes: i % 3 === 0 ? 'Please arrange vegetarian food only.' : i % 3 === 1 ? 'Need parking for 50+ vehicles.' : '',
            status,
            isSamajMember: i % 2 === 0,
            rejectionReason: status === 'Rejected' ? 'Date conflict with another booking.' : undefined,
            eventDocument: 'https://res.cloudinary.com/demo/image/upload/v1/sample_document.pdf',
            documentType: docTypes[i % docTypes.length],
            documents: [
                { url: 'https://res.cloudinary.com/demo/image/upload/v1/doc1.pdf', type: docTypes[i % docTypes.length] }
            ]
        });
    }

    const created = await Booking.insertMany(bookings);
    console.log(`    ✓ ${created.length} bookings created`);
    return created;
}

async function seedContacts() {
    console.log('  → Seeding Contacts...');
    await Contact.deleteMany({});

    const contacts = await Contact.insertMany([
        {
            name: 'Harshad Patel',
            email: 'harshad.p@gmail.com',
            phone: '9876001234',
            message: 'I would like to know the pricing for wedding halls. Can you share the brochure?',
            status: 'pending',
        },
        {
            name: 'Krupa Shah',
            email: 'krupa.shah@gmail.com',
            phone: '9876005678',
            message: 'Is the Samuh Lagan ceremony scheduled for this year? How can I register?',
            status: 'replied',
            reply: 'Yes, the Samuh Lagan is scheduled for April 2026. Please visit our website to register when the form opens.',
            repliedAt: new Date(),
        },
        {
            name: 'Vikram Desai',
            email: 'vikram.d@yahoo.com',
            phone: '9876009012',
            message: 'Can we book the hall for a corporate seminar on a weekday?',
            status: 'pending',
        },
        {
            name: 'Sneha Trivedi',
            email: 'sneha.t@gmail.com',
            message: 'Do you provide catering services along with the venue?',
            status: 'replied',
            reply: 'Yes, we offer in-house catering as well as allow external caterers. Please contact our booking manager for details.',
            repliedAt: pastDate(10),
        },
        {
            name: 'Ramesh Bhatt',
            email: 'ramesh.bhatt@gmail.com',
            phone: '9876003456',
            message: 'I want to donate to the student award fund. Who should I contact?',
            status: 'pending',
        },
        {
            name: 'Jasmine Raval',
            email: 'jasmine.r@outlook.com',
            phone: '9876007890',
            message: 'Is there wheelchair accessibility at the venue?',
            status: 'replied',
            reply: 'Yes, our venue is fully wheelchair accessible with ramps and elevators.',
            repliedAt: pastDate(5),
        },
    ]);

    console.log(`    ✓ ${contacts.length} contacts created`);
    return contacts;
}

async function seedEventCategories() {
    console.log('  → Seeding Event Categories...');
    await EventCategory.deleteMany({});

    const categories = await EventCategory.insertMany([
        {
            id: 'wedding',
            title: 'Wedding Ceremonies',
            description: 'Grand wedding celebrations with traditional and modern setups. Our spacious halls and expert team ensure a memorable event.',
            icon: 'fa-rings-wedding',
            capacity: '200-800 guests',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
            membershipPricing: { samajMember: '₹50,000', nonSamajMember: '₹1,00,000' },
            features: ['Grand decorations', 'Bridal suite', 'Valet parking', 'In-house catering', 'DJ & sound system', 'Floral decoration'],
            packages: [
                { name: 'Silver', price: '₹50,000', includes: ['Hall booking', 'Basic decoration', 'Sound system'], isPopular: false },
                { name: 'Gold', price: '₹1,00,000', includes: ['Hall booking', 'Premium decoration', 'Sound + DJ', 'Bridal suite', 'Valet parking'], isPopular: true },
                { name: 'Platinum', price: '₹2,00,000', includes: ['Hall booking', 'Luxury decoration', 'Full entertainment', 'Bridal suite', 'Valet parking', 'Catering (500 pax)', 'Photography'], isPopular: false },
            ],
            isActive: true,
            order: 1,
        },
        {
            id: 'engagement',
            title: 'Engagement Ceremonies',
            description: 'Intimate and elegant engagement ceremonies with personalized arrangements and beautiful décor.',
            icon: 'fa-ring',
            capacity: '50-300 guests',
            image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800',
            membershipPricing: { samajMember: '₹25,000', nonSamajMember: '₹50,000' },
            features: ['Elegant setup', 'Stage decoration', 'Sound system', 'Photography corner'],
            packages: [
                { name: 'Basic', price: '₹25,000', includes: ['Hall booking', 'Stage decoration', 'Sound system'], isPopular: false },
                { name: 'Premium', price: '₹50,000', includes: ['Hall booking', 'Full decoration', 'Sound + DJ', 'Photography corner', 'Snacks for 100'], isPopular: true },
            ],
            isActive: true,
            order: 2,
        },
        {
            id: 'birthday',
            title: 'Birthday Celebrations',
            description: 'Fun-filled birthday parties for all ages with customizable themes, entertainment, and catering.',
            icon: 'fa-cake-candles',
            capacity: '30-200 guests',
            image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
            membershipPricing: { samajMember: '₹10,000', nonSamajMember: '₹20,000' },
            features: ['Themed decoration', 'DJ & games', 'Balloon setup', 'Kids play area'],
            packages: [
                { name: 'Kids Party', price: '₹10,000', includes: ['Hall booking', 'Balloon decoration', 'Games setup'], isPopular: false },
                { name: 'Grand Party', price: '₹25,000', includes: ['Hall booking', 'Theme decoration', 'DJ', 'Catering (50 pax)', 'Cake table'], isPopular: true },
            ],
            isActive: true,
            order: 3,
        },
        {
            id: 'corporate',
            title: 'Corporate Events',
            description: 'Professional corporate events including seminars, conferences, and team-building activities with modern amenities.',
            icon: 'fa-building',
            capacity: '50-500 guests',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            membershipPricing: { samajMember: '₹30,000', nonSamajMember: '₹60,000' },
            features: ['Projector & screen', 'Wi-Fi', 'Podium & mic', 'Breakout rooms', 'Refreshment area'],
            packages: [
                { name: 'Half Day', price: '₹15,000', includes: ['Hall booking (6 hrs)', 'Projector', 'Sound system', 'Tea/Coffee'], isPopular: false },
                { name: 'Full Day', price: '₹30,000', includes: ['Hall booking (12 hrs)', 'Projector', 'Sound system', 'Lunch + Tea/Coffee', 'Breakout room'], isPopular: true },
            ],
            isActive: true,
            order: 4,
        },
        {
            id: 'religious',
            title: 'Religious & Cultural Events',
            description: 'Sacred religious ceremonies and cultural programmes hosted with warmth and traditional values.',
            icon: 'fa-om',
            capacity: '100-1000 guests',
            image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=800',
            membershipPricing: { samajMember: '₹15,000', nonSamajMember: '₹35,000' },
            features: ['Puja setup', 'Seating arrangement', 'Prasad distribution area', 'Sound system', 'Parking'],
            packages: [
                { name: 'Standard', price: '₹15,000', includes: ['Hall booking', 'Basic seating', 'Sound system'], isPopular: false },
                { name: 'Complete', price: '₹35,000', includes: ['Hall booking', 'Puja setup', 'Seating', 'Sound system', 'Prasad area', 'Parking management'], isPopular: true },
            ],
            isActive: true,
            order: 5,
        },
    ]);

    console.log(`    ✓ ${categories.length} event categories created`);
    return categories;
}

async function seedForms() {
    console.log('  → Seeding Forms...');
    await Form.deleteMany({});

    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const twoMonthsLater = new Date(now);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

    const forms = await Form.insertMany([
        {
            formType: 'samuhLagan',
            active: true,
            startTime: now,
            endTime: oneMonthLater,
            eventDate: twoMonthsLater,
            lastUpdated: now,
        },
        {
            formType: 'studentAwards',
            active: true,
            startTime: now,
            endTime: oneMonthLater,
            eventDate: twoMonthsLater,
            lastUpdated: now,
        },
    ]);

    console.log(`    ✓ ${forms.length} forms created`);
    return forms;
}

async function seedGalleryItems() {
    console.log('  → Seeding Gallery Items...');
    await GalleryItem.deleteMany({});

    const categories = ['weddings', 'corporate', 'birthdays', 'social', 'graduation', 'private'];

    const items = [];
    const photoUrls = [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600',
        'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600',
        'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600',
        'https://images.unsplash.com/photo-1524824267900-2fa4dc3b2571?w=600',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600',
    ];

    for (let i = 0; i < 18; i++) {
        items.push({
            type: i < 15 ? 'photo' : 'video',
            url: i < 15 ? photoUrls[i] : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: photoUrls[i % photoUrls.length],
            category: categories[i % categories.length],
            createdAt: pastDate(180),
        });
    }

    const created = await GalleryItem.insertMany(items);
    console.log(`    ✓ ${created.length} gallery items created`);
    return created;
}

async function seedHomeContent() {
    console.log('  → Seeding Home Content...');
    await HomeContent.deleteMany({});

    const content = await HomeContent.create({
        title: 'Van Sol Parivar Samaj',
        description: 'Serving the community with pride since generations.',
        heroSlider: [
            {
                title: 'Welcome to Van Sol Parivar Samaj',
                description: 'A vibrant community dedicated to preserving our cultural heritage and fostering unity among members.',
                image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
                isActive: true,
                order: 1,
            },
            {
                title: 'Grand Samuh Lagan Ceremony',
                description: 'Join us for the community\'s biggest event — a celebration of togetherness and new beginnings.',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
                isActive: true,
                order: 2,
            },
            {
                title: 'Student Awards & Scholarships',
                description: 'Recognizing academic excellence and empowering the next generation of our community.',
                image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200',
                isActive: true,
                order: 3,
            },
        ],
        introduction: {
            heading: 'About Our Samaj',
            description: 'Van Sol Parivar Samaj is a registered community organization based in Ahmedabad, Gujarat. We are committed to the social, cultural, and educational upliftment of our community members. With over 5000+ families, we organize events, provide scholarships, and maintain community halls for various functions.',
            highlights: [
                { icon: 'fa-users', title: '5000+', subtitle: 'Families' },
                { icon: 'fa-calendar-check', title: '200+', subtitle: 'Events Hosted' },
                { icon: 'fa-graduation-cap', title: '500+', subtitle: 'Students Awarded' },
                { icon: 'fa-building', title: '3', subtitle: 'Community Halls' },
            ],
            download: {
                label: 'Download Community Brochure',
                fileName: 'VSPS_Brochure_2026.pdf',
                filePath: '/uploads/brochure.pdf',
            },
        },
        about: {
            heading: 'Why Choose Our Venue?',
            description: 'Our state-of-the-art community halls provide the perfect setting for weddings, corporate events, and cultural celebrations. Located in the heart of Ahmedabad with excellent connectivity and ample parking.',
            image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
            features: [
                { icon: 'fa-star', title: 'Premium Facilities', description: 'Modern amenities including AC halls, lift access, and luxury furnishing.' },
                { icon: 'fa-utensils', title: 'In-House Catering', description: 'Authentic Gujarati cuisine prepared by experienced chefs with fresh ingredients.' },
                { icon: 'fa-car', title: 'Ample Parking', description: 'Dedicated parking space for 200+ vehicles with valet service available.' },
                { icon: 'fa-handshake', title: 'Dedicated Support', description: 'Our experienced event coordinators ensure everything runs smoothly.' },
            ],
        },
        leadership: {
            heading: 'Our Leadership',
            description: 'Meet the dedicated team that guides our community forward with vision and commitment.',
            note: 'Elections are held every 3 years. Current term: 2024-2027.',
            members: [
                { name: 'Shri Kantibhai Patel', position: 'President', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', description: 'Leading the community for over 10 years with dedication.' },
                { name: 'Shri Jayeshbhai Shah', position: 'Vice President', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', description: 'Focused on youth development and education initiatives.' },
                { name: 'Shri Maheshbhai Vyas', position: 'Secretary', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', description: 'Managing organizational operations and member relations.' },
                { name: 'Shri Rameshbhai Desai', position: 'Treasurer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', description: 'Ensuring financial transparency and prudent management.' },
            ],
        },
    });

    console.log(`    ✓ Home content created`);
    return content;
}

async function seedResources() {
    console.log('  → Seeding Resources...');
    await Resource.deleteMany({});

    const resources = await Resource.insertMany([
        {
            title: 'Wedding Planning Checklist',
            description: 'A comprehensive month-by-month checklist to plan every detail of your wedding ceremony.',
            category: 'checklists',
            icon: 'fa-list-check',
            downloadLink: '/uploads/wedding-checklist.pdf',
            type: 'PDF',
            size: '1.2 MB',
            downloadCount: 245,
        },
        {
            title: 'Event Decoration Guide',
            description: 'Get inspired with trending decoration ideas for weddings, engagements, and birthday parties.',
            category: 'decoration',
            icon: 'fa-paintbrush',
            downloadLink: '/uploads/decoration-guide.pdf',
            type: 'PDF',
            size: '3.5 MB',
            downloadCount: 189,
        },
        {
            title: 'Budget Planning Template',
            description: 'An Excel template to track and manage your event budget effectively.',
            category: 'planning',
            icon: 'fa-calculator',
            downloadLink: '/uploads/budget-template.xlsx',
            type: 'XLSX',
            size: '0.8 MB',
            downloadCount: 312,
        },
        {
            title: 'Vendor Selection Guide',
            description: 'Tips and criteria for selecting the right vendors — caterers, decorators, photographers, and more.',
            category: 'guides',
            icon: 'fa-handshake',
            downloadLink: '/uploads/vendor-guide.pdf',
            type: 'PDF',
            size: '2.1 MB',
            downloadCount: 156,
        },
        {
            title: 'Guest List Manager',
            description: 'Organize your guest list with RSVP tracking, seating arrangements, and dietary preferences.',
            category: 'planning',
            icon: 'fa-users',
            downloadLink: '/uploads/guest-list.xlsx',
            type: 'XLSX',
            size: '0.5 MB',
            downloadCount: 98,
        },
        {
            title: 'Samuh Lagan Registration Guide',
            description: 'Step-by-step guide on how to register for the community Samuh Lagan ceremony.',
            category: 'guides',
            icon: 'fa-book',
            downloadLink: '/uploads/samuh-lagan-guide.pdf',
            type: 'PDF',
            size: '1.8 MB',
            downloadCount: 423,
        },
    ]);

    console.log(`    ✓ ${resources.length} resources created`);
    return resources;
}

async function seedArticles() {
    console.log('  → Seeding Articles...');
    await Article.deleteMany({});

    const articles = await Article.insertMany([
        {
            title: '10 Tips for a Perfect Gujarati Wedding',
            excerpt: 'Planning a traditional Gujarati wedding? Here are 10 expert tips to make your big day truly unforgettable.',
            content: `<h2>1. Start Early</h2><p>Begin planning at least 6 months in advance. Book your venue, caterer, and photographer early as the best ones fill up fast.</p><h2>2. Embrace Traditions</h2><p>Incorporate traditional elements like Garba, Mandap decoration, and Gujarati cuisine to honour your heritage.</p><h2>3. Choose the Right Venue</h2><p>Look for a venue that accommodates your guest count comfortably and offers good parking and AC facilities.</p><h2>4. Budget Wisely</h2><p>Set a realistic budget and stick to it. Use our free budget planning template to track expenses.</p><h2>5. Hire Experienced Vendors</h2><p>Choose vendors with proven track records. Ask for references and sample work.</p>`,
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
            readTime: '5 min',
            category: 'Wedding Tips',
            views: 1245,
            isFeatured: true,
            publishedAt: pastDate(30),
        },
        {
            title: 'The Significance of Samuh Lagan in Our Community',
            excerpt: 'Understanding the deep-rooted cultural importance of community mass weddings and how they strengthen our bonds.',
            content: `<h2>A Tradition of Unity</h2><p>Samuh Lagan, or community mass wedding, is one of the most cherished traditions of our samaj. It brings families together and promotes the values of unity, equality, and simplicity.</p><h2>Benefits for Families</h2><p>By organizing weddings collectively, families save significantly on costs while enjoying all the grandeur of a traditional ceremony.</p>`,
            image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
            readTime: '4 min',
            category: 'Community',
            views: 892,
            isFeatured: true,
            publishedAt: pastDate(60),
        },
        {
            title: 'Student Scholarship Programme: Empowering the Next Generation',
            excerpt: 'Learn about our scholarship programme that has supported over 500 students in pursuing their academic dreams.',
            content: `<h2>Our Mission</h2><p>Education is the cornerstone of community development. Our Student Awards programme recognizes meritorious students and provides them with financial support.</p><h2>Eligibility</h2><p>Students who have scored 85% or above in their board examinations, or achieved top 3 ranks, are eligible to apply.</p>`,
            image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
            readTime: '3 min',
            category: 'Education',
            views: 567,
            isFeatured: false,
            publishedAt: pastDate(90),
        },
        {
            title: 'How to Choose the Perfect Event Venue',
            excerpt: 'Key factors to consider when selecting a venue that matches your event requirements and budget.',
            content: `<h2>Location Matters</h2><p>Choose a centrally located venue accessible to most of your guests. Consider proximity to public transport and hotels.</p><h2>Capacity & Layout</h2><p>Ensure the venue can comfortably accommodate your guest count with proper seating, buffet area, and stage.</p><h2>Amenities</h2><p>Check for essential amenities like AC, parking, bridal room, kitchen, and backup power.</p>`,
            image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
            readTime: '4 min',
            category: 'Planning',
            views: 334,
            isFeatured: false,
            publishedAt: pastDate(45),
        },
    ]);

    console.log(`    ✓ ${articles.length} articles created`);
    return articles;
}

async function seedReviews() {
    console.log('  → Seeding Reviews...');
    await Review.deleteMany({});

    const reviews = await Review.insertMany([
        {
            name: 'Rajesh & Priyanka Patel',
            email: 'rajesh.wedding@gmail.com',
            eventType: 'wedding',
            eventDate: pastDate(60),
            rating: 5,
            title: 'Absolutely Magical Wedding Experience!',
            review: 'Our wedding at VSPS hall was nothing short of magical. The decoration was stunning, the food was delicious, and the staff was incredibly helpful. Every detail was taken care of. We couldn\'t have asked for a better venue!',
            isApproved: true,
        },
        {
            name: 'Amit Shah',
            email: 'amit.corp@gmail.com',
            eventType: 'corporate',
            eventDate: pastDate(30),
            rating: 4,
            title: 'Great Venue for Corporate Events',
            review: 'We hosted our annual company seminar here. The projector, sound system, and seating arrangement were perfect. The catering was excellent. Minor issue with AC in one breakout room, but overall a great experience.',
            isApproved: true,
        },
        {
            name: 'Kavita Desai',
            email: 'kavita.d@gmail.com',
            eventType: 'birthday',
            eventDate: pastDate(20),
            rating: 5,
            title: 'Best Birthday Party Ever!',
            review: 'My daughter\'s 5th birthday party was amazing! The kids had so much fun with the games and activities. The balloon decoration was beautiful and the cake was delicious. Thank you VSPS team!',
            isApproved: true,
        },
        {
            name: 'Jayesh & Hetal Vyas',
            email: 'jayesh.v@gmail.com',
            eventType: 'wedding',
            eventDate: pastDate(90),
            rating: 5,
            title: 'Dream Wedding Came True',
            review: 'From the first meeting to the last dance, everything was perfect. The samaj member discount made it affordable and the quality was premium. The mandap decoration was breathtaking. Highly recommend!',
            isApproved: true,
        },
        {
            name: 'Nilesh Trivedi',
            email: 'nilesh.t@gmail.com',
            eventType: 'social',
            eventDate: pastDate(45),
            rating: 4,
            title: 'Wonderful Anniversary Celebration',
            review: 'We celebrated our parents\' 50th anniversary here. The hall was spacious, food was authentic Gujarati thali, and the team helped us set up a beautiful photo gallery wall. Great memories!',
            isApproved: true,
        },
        {
            name: 'Sneha Mehta',
            email: 'sneha.m@gmail.com',
            eventType: 'other',
            eventDate: pastDate(15),
            rating: 3,
            title: 'Good but Room for Improvement',
            review: 'The venue is nice and spacious. However, the parking management could be better during peak hours. Food quality was good. Staff was polite but response time can improve.',
            isApproved: false, // Pending approval
        },
        {
            name: 'Bhavin Gandhi',
            email: 'bhavin.g@gmail.com',
            eventType: 'wedding',
            eventDate: pastDate(120),
            rating: 5,
            title: 'Exceptional Service and Value',
            review: 'Being a samaj member, we got an amazing deal. The savings compared to private venues are incredible, but the quality is at par or even better. The entire team goes above and beyond.',
            isApproved: true,
        },
    ]);

    console.log(`    ✓ ${reviews.length} reviews created`);
    return reviews;
}

async function seedSamuhLagan(users) {
    console.log('  → Seeding Samuh Lagan Registrations...');
    await SamuhLagan.deleteMany({});

    // Use regular user IDs
    const regularUsers = users.filter(u => u.role === 'user' && u.isVerified);

    const registrations = [];
    const statuses = ['pending', 'approved', 'confirmed', 'rejected'];

    const brideNames = ['Priya Patel', 'Kavita Shah', 'Meera Vyas', 'Rekha Joshi'];
    const groomNames = ['Rajesh Kumar', 'Amit Desai', 'Jayesh Trivedi', 'Nilesh Parmar'];

    for (let i = 0; i < Math.min(4, regularUsers.length); i++) {
        registrations.push({
            user: regularUsers[i]._id,
            bride: {
                name: brideNames[i],
                fatherName: `Shri ${['Kantibhai', 'Maheshbhai', 'Rameshbhai', 'Jayeshbhai'][i]} ${brideNames[i].split(' ')[1]}`,
                motherName: `Smt. ${['Savitaben', 'Kokilaben', 'Ranjanben', 'Shantaben'][i]}`,
                age: 22 + i,
                contactNumber: `98${70 + i}0${i}12345`,
                email: `bride${i + 1}@example.com`,
                address: `${10 + i * 5}, ${['Shanti Nagar', 'Laxmi Society', 'Ganesh Colony', 'Krishna Park'][i]}, ${['Bavla', 'Dholka', 'Sanand', 'Viramgam'][i]}, Gujarat`,
            },
            groom: {
                name: groomNames[i],
                fatherName: `Shri ${['Hasmukhbhai', 'Pravinbhai', 'Sureshbhai', 'Dineshbhai'][i]} ${groomNames[i].split(' ')[1]}`,
                motherName: `Smt. ${['Jayaben', 'Kanakben', 'Malatiben', 'Nirmalaben'][i]}`,
                age: 25 + i,
                contactNumber: `98${80 + i}0${i}67890`,
                email: `groom${i + 1}@example.com`,
                address: `${20 + i * 3}, ${['Ram Nagar', 'Shiv Colony', 'Ambika Society', 'Vrundavan Park'][i]}, ${['Mandal', 'Dhandhuka', 'Ranpur', 'Limbdi'][i]}, Gujarat`,
            },
            ceremonyDate: futureDate(60),
            status: statuses[i],
            paymentStatus: statuses[i] === 'confirmed' ? 'paid' : 'pending',
            rejectionReason: statuses[i] === 'rejected' ? 'Incomplete documentation. Please resubmit with all required documents.' : undefined,
        });
    }

    const created = await SamuhLagan.insertMany(registrations);
    console.log(`    ✓ ${created.length} samuh lagan registrations created`);
    return created;
}

async function seedStudentAwards(users) {
    console.log('  → Seeding Student Awards...');
    await StudentAward.deleteMany({});

    const regularUsers = users.filter(u => u.role === 'user' && u.isVerified);

    const awards = [];
    const statuses = ['pending', 'approved', 'rejected'];
    const boards = ['GSEB', 'CBSE', 'ICSE'];
    const standards = ['10th', '12th', 'B.Com 1st Year', 'B.Tech 2nd Year', 'MBA 1st Year'];

    const studentData = [
        { name: 'Arjun Patel', school: 'Kendriya Vidyalaya, Ahmedabad', percentage: '95.6', rank: 'first' },
        { name: 'Nisha Shah', school: 'DPS, Gandhinagar', percentage: '92.3', rank: 'second' },
        { name: 'Rohan Vyas', school: 'St. Xavier\'s School, Ahmedabad', percentage: '89.8', rank: 'third' },
        { name: 'Pooja Joshi', school: 'Gujarat Vidyapith, Ahmedabad', percentage: '91.2', rank: 'first' },
        { name: 'Karan Modi', school: 'NV Patel College, Viramgam', percentage: '87.5', rank: 'none' },
    ];

    for (let i = 0; i < Math.min(5, regularUsers.length); i++) {
        awards.push({
            user: regularUsers[i % regularUsers.length]._id,
            name: studentData[i].name,
            contactNumber: `97${30 + i}0${i}${String(Math.floor(Math.random() * 9000) + 1000)}`,
            email: `student${i + 1}@example.com`,
            address: `${i * 10 + 5}, Student Hostel, ${['Ahmedabad', 'Gandhinagar', 'Rajkot', 'Surat', 'Vadodara'][i]}, Gujarat`,
            schoolName: studentData[i].school,
            standard: standards[i],
            boardName: boards[i % boards.length],
            examYear: '2025',
            totalPercentage: studentData[i].percentage,
            rank: studentData[i].rank,
            marksheet: 'https://res.cloudinary.com/demo/image/upload/v1/sample_marksheet.pdf',
            status: statuses[i % statuses.length],
            rejectionReason: statuses[i % statuses.length] === 'rejected' ? 'Marksheet image is not clear. Please upload a scanned copy.' : '',
        });
    }

    const created = await StudentAward.insertMany(awards);
    console.log(`    ✓ ${created.length} student awards created`);
    return created;
}

// ── Main ──────────────────────────────────────────────────────────────

async function seed() {
    console.log('\n🌱 VSPS Database Seeder');
    console.log('━'.repeat(50));

    try {
        // Fix DNS for MongoDB Atlas SRV resolution
        const currentServers = dns.getServers();
        if (currentServers.length === 0 || (currentServers.length === 1 && currentServers[0] === '127.0.0.1')) {
            dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
        }

        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('  ✓ Connected to', mongoose.connection.host);

        console.log('\n📦 Seeding collections...\n');

        // Seed in order (some depend on Users)
        const users = await seedUsers();
        await seedBookings(users);
        await seedContacts();
        await seedEventCategories();
        await seedForms();
        await seedGalleryItems();
        await seedHomeContent();
        await seedResources();
        await seedArticles();
        await seedReviews();
        await seedSamuhLagan(users);
        await seedStudentAwards(users);

        console.log('\n' + '━'.repeat(50));
        console.log('✅ All collections seeded successfully!');
        console.log('\n📋 Demo Login Credentials:');
        console.log('  Admin     → admin@vsps.org / admin@123  (or from .env)');
        console.log('  User      → rajesh.patel@gmail.com / User@123');
        console.log('  All users → password: User@123');
        console.log('━'.repeat(50) + '\n');

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    }
}

seed();
