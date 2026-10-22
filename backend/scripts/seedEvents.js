const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment config
dotenv.config({ path: path.join(__dirname, '../.env') });

const Event = require('../models/Event');
const connectDB = require('../config/db');

const sampleEvents = [
  {
    title: 'TechNova 2026: State-Level 36-Hour Hackathon',
    description: 'TechNova is Maharashtra\'s premier inter-collegiate hackathon bringing together over 500 coders, designers, and innovators to solve real-world problems in AI, FinTech, Healthcare, and Sustainable Tech. Mentorship by industry veterans from Google, Microsoft, and leading tech startups.',
    category: 'Technical',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-15T09:00:00Z'),
    startTime: '09:00 AM',
    endTime: '09:00 PM (Next Day)',
    venue: 'Quadrangle Auditorium & Central Computing Lab',
    city: 'Mumbai',
    organizerCollege: 'Veermata Jijabai Technological Institute (VJTI), Matunga',
    registrationFee: 250,
    registrationDeadline: new Date('2026-11-10T23:59:59Z'),
    maxParticipants: 150,
    registeredCount: 0,
    eligibility: 'Open to all Engineering, BSc IT, BCA, and MCA students across Maharashtra. Teams of 2 to 4 members.',
    rules: [
      'Original code only; any plagiarism results in immediate disqualification.',
      'All team members must present valid college identity cards at physical registration.',
      'Projects must be committed to GitHub repositories initiated at the start time.',
      'Decision of the external jury panel is final.'
    ],
    status: 'upcoming'
  },
  {
    title: 'RoboKshiti 2026: National Autonomous Robotics Challenge',
    description: 'An exhilarating state championship featuring Line Following, RoboWars (15kg & 30kg), Maze Solver, and Drone Obstacle Racing. Compete on international standard arenas with cash prizes worth ₹1,50,000.',
    category: 'Technical',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-22T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '06:30 PM',
    venue: 'Boat Club Grounds & Mechanical Arena',
    city: 'Pune',
    organizerCollege: 'COEP Technological University, Shivajinagar, Pune',
    registrationFee: 300,
    registrationDeadline: new Date('2026-11-18T23:59:59Z'),
    maxParticipants: 80,
    registeredCount: 0,
    eligibility: 'Open to all undergraduate Polytechnic, BE, BTech, and Science students across Maharashtra.',
    rules: [
      'Bots must adhere strictly to specified dimensional and weight constraints.',
      'Safety cutoff switches are mandatory for combat bots.',
      'Only electric and battery-powered mechanisms permitted.'
    ],
    status: 'upcoming'
  },
  {
    title: 'Rangoutsav 2026: State Inter-Collegiate Cultural Fiesta',
    description: 'Maharashtra\'s most celebrated collegiate cultural extravaganza featuring Classical & Western Group Dance, Battle of the Bands, Solo Singing, and Fashion Runway celebrating Indian ethnic traditions.',
    category: 'Cultural',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-12-05T11:00:00Z'),
    startTime: '11:00 AM',
    endTime: '08:30 PM',
    venue: 'Mukesh Patel Auditorium, Juhu',
    city: 'Mumbai',
    organizerCollege: 'Mithibai College of Arts & Chauhan Institute of Science, Vile Parle',
    registrationFee: 150,
    registrationDeadline: new Date('2026-11-30T23:59:59Z'),
    maxParticipants: 200,
    registeredCount: 0,
    eligibility: 'Open to all registered college students from Maharashtra universities.',
    rules: [
      'Performance tracks must be submitted in MP3 format 24 hours prior to the event.',
      'Vulgarity in lyrical content or choreography will attract strict disqualification.',
      'Performance time limits must not exceed 8 minutes per troupe.'
    ],
    status: 'upcoming'
  },
  {
    title: 'MahaRun 2026: Inter-Collegiate 10K & 5K Athletics Championship',
    description: 'Promoting youth fitness and collegiate sportsmanship across the state. Features chip-timed 10K Marathon, 5K Sprint, and Relay challenges with professional medical response teams, hydration stations, and finisher medals.',
    category: 'Sports',
    bannerImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-29T06:00:00Z'),
    startTime: '06:00 AM',
    endTime: '11:00 AM',
    venue: 'University Sports Pavilion, Ganeshkhind',
    city: 'Pune',
    organizerCollege: 'Savitribai Phule Pune University (SPPU), Pune',
    registrationFee: 100,
    registrationDeadline: new Date('2026-11-25T23:59:59Z'),
    maxParticipants: 350,
    registeredCount: 0,
    eligibility: 'Undergraduate and postgraduate students enrolled in recognized colleges in Maharashtra.',
    rules: [
      'Chest bibs with RFID timing chips must be pinned to the front chest throughout the race.',
      'Medical self-declaration form must be submitted at the kit distribution desk.',
      'Proper athletic sports shoes and apparel required.'
    ],
    status: 'upcoming'
  },
  {
    title: 'Hands-on Generative AI & Cloud Architecture Masterclass',
    description: 'An intensive, hands-on workshop covering Large Language Models (LLMs), RAG (Retrieval-Augmented Generation), vector databases, and scalable cloud deployment with Docker and Kubernetes.',
    category: 'Workshops',
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-18T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '04:30 PM',
    venue: 'Seminar Hall 3 & Cloud Computing Labs, Bhavan’s Campus',
    city: 'Mumbai',
    organizerCollege: 'Sardar Patel Institute of Technology (SPIT), Andheri West',
    registrationFee: 0,
    registrationDeadline: new Date('2026-11-16T23:59:59Z'),
    maxParticipants: 100,
    registeredCount: 0,
    eligibility: 'Students with fundamental knowledge of Python programming.',
    rules: [
      'Participants must bring their personal laptops with Python 3.10+ and VS Code pre-installed.',
      'Cloud laboratory credits will be provided at the workshop venue.',
      'Attendance in all sessions is mandatory for the verified certificate of completion.'
    ],
    status: 'upcoming'
  },
  {
    title: 'State Level Research Colloquium 2026: Emerging Frontiers in IT',
    description: 'Annual research conference providing a platform for undergraduate and PG students to present peer-reviewed papers in Quantum Computing, Cyber Security, IoT, and Computer Vision.',
    category: 'Academic',
    bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-12-10T09:30:00Z'),
    startTime: '09:30 AM',
    endTime: '05:00 PM',
    venue: 'Dr. Babasaheb Ambedkar Conference Hall',
    city: 'Aurangabad',
    organizerCollege: 'Government College of Engineering (GECA), Chhatrapati Sambhajinagar',
    registrationFee: 200,
    registrationDeadline: new Date('2026-12-01T23:59:59Z'),
    maxParticipants: 120,
    registeredCount: 0,
    eligibility: 'Authors must be enrolled in recognized collegiate institutions.',
    rules: [
      'Papers must strictly adhere to the IEEE two-column paper format.',
      'Maximum 10-minute presentation followed by 5-minute Q&A with chairpersons.',
      'Plagiarism limit capped at 12% (excluding references).'
    ],
    status: 'upcoming'
  },
  {
    title: 'CyberSuraksha: State Ethical Hacking & CTF Championship',
    description: 'Capture-The-Flag (CTF) tournament designed to test skills in Web Exploitation, Reverse Engineering, Cryptography, Digital Forensics, and Binary Exploitation. Sponsored by top security consulting firms.',
    category: 'Technical',
    bannerImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-28T09:00:00Z'),
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    venue: 'PICT Auditorium & Cyber Range Laboratory',
    city: 'Pune',
    organizerCollege: 'Pune Institute of Computer Technology (PICT), Dhankawadi',
    registrationFee: 200,
    registrationDeadline: new Date('2026-11-24T23:59:59Z'),
    maxParticipants: 100,
    registeredCount: 0,
    eligibility: 'Undergraduate students passionate about ethical hacking and offensive/defensive cyber security.',
    rules: [
      'No denial of service (DoS/DDoS) attacks against the scoring infrastructure.',
      'Flag sharing between distinct teams will result in instant disqualification.',
      'Personal laptops required with Kali Linux or appropriate penetration testing distribution.'
    ],
    status: 'upcoming'
  },
  {
    title: 'Kala-Kriti: State Level Street Play & Theatre Festival',
    description: 'A vibrant theatrical contest showcasing poignant street plays (Nukkad Natak) addressing contemporary social issues, environmental preservation, mental health, and civic responsibilities.',
    category: 'Cultural',
    bannerImage: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-12-14T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '05:30 PM',
    venue: 'Open Air Amphitheatre, Ruia College Grounds',
    city: 'Mumbai',
    organizerCollege: 'Ramnarain Ruia Autonomous College, Matunga',
    registrationFee: 100,
    registrationDeadline: new Date('2026-12-08T23:59:59Z'),
    maxParticipants: 150,
    registeredCount: 0,
    eligibility: 'College teams consisting of 8 to 20 actors and musicians.',
    rules: [
      'Only acoustic instruments (Dholak, Dafli, Harmonium, Flute) are allowed; no electronic amplification.',
      'Script summary must be submitted during registration.',
      'Performance duration strictly 12 to 15 minutes.'
    ],
    status: 'upcoming'
  },
  {
    title: 'MahaCricket Trophy 2026: Inter-Collegiate T20 Tournament',
    description: 'The premier inter-collegiate cricket tournament featuring the top 16 collegiate teams across Western Maharashtra competing under BCCI turf guidelines with leather ball and third umpire review.',
    category: 'Sports',
    bannerImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-12-18T08:30:00Z'),
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    venue: 'Walchand College Cricket Stadium, Vishrambag',
    city: 'Sangli',
    registrationFee: 500,
    registrationDeadline: new Date('2026-12-12T23:59:59Z'),
    organizerCollege: 'Walchand College of Engineering, Sangli',
    maxParticipants: 80,
    registeredCount: 0,
    eligibility: 'Official college sports team roster with Physical Director authorization.',
    rules: [
      'BCCI T20 Playing conditions apply.',
      'All players must wear proper cricket whites.',
      'College identity verification by tournament match referee.'
    ],
    status: 'upcoming'
  },
  {
    title: 'IoT & Smart Cities Bootcamp: Sensors, ESP32 & MQTT',
    description: 'Two-day experiential workshop on building Smart City IoT nodes using ESP32 microcontrollers, environmental sensors, MQTT protocol, and Grafana cloud dashboards.',
    category: 'Workshops',
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    date: new Date('2026-11-25T09:30:00Z'),
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    venue: 'IoT Innovation Hub, Kothrud Campus',
    city: 'Pune',
    organizerCollege: 'MIT World Peace University (MIT-WPU), Kothrud, Pune',
    registrationFee: 200,
    registrationDeadline: new Date('2026-11-20T23:59:59Z'),
    maxParticipants: 90,
    registeredCount: 0,
    eligibility: 'Students from Electronics, CS, IT, and related engineering branches.',
    rules: [
      'Hardware developer kits provided during the lab sessions.',
      'Team projects will be evaluated on day 2 for best innovation prizes.'
    ],
    status: 'upcoming'
  }
];

const seedEvents = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing demonstration events...');
    await Event.deleteMany({});

    console.log('[Seed] Seeding realistic Maharashtra college events...');
    const createdEvents = await Event.insertMany(sampleEvents);

    console.log(`[Seed] Successfully seeded ${createdEvents.length} events across Maharashtra colleges!`);
    createdEvents.forEach((ev, idx) => {
      console.log(`  ${idx + 1}. [${ev.category}] ${ev.title} (${ev.city}) - Fee: ₹${ev.registrationFee}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding events: ${error.message}`);
    process.exit(1);
  }
};

seedEvents();
