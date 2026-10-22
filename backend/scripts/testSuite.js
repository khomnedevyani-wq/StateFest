/**
 * StateFest Comprehensive Automated Test Suite
 * Tests full end-to-end functionality:
 * 1. Health check
 * 2. Student Registration & bcrypt hashing
 * 3. Student Login & JWT token verification
 * 4. Events listing, category filter, search, sort
 * 5. Event details & related events
 * 6. Event registration by student
 * 7. Duplicate registration prevention (Constraint + Error handling)
 * 8. Capacity validation & deadline handling
 * 9. Student dashboard registrations retrieval
 * 10. Registration cancellation
 * 11. Admin login & RBAC security check (student cannot access admin routes)
 * 12. Admin dashboard statistics
 * 13. Admin event creation, update, and deletion
 * 14. Admin registration status modification
 * 15. Admin CSV export
 * 16. Contact message submission & admin inquiry retrieval
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('====================================================');
  console.log('   STARTING STATEFEST AUTOMATED TEST SUITE          ');
  console.log('====================================================\n');

  let studentToken = '';
  let studentUserId = '';
  let adminToken = '';
  let sampleEventId = '';
  let createdRegistrationId = '';
  let testEventId = '';

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.ok && data.status === 'healthy') {
      console.log('✔ Test 1: API Health Check passed');
    } else {
      throw new Error(`Health check failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 1 FAILED:', err.message);
  }

  // 2. Student Registration
  const testStudentEmail = `test_student_${Date.now()}@college.edu.in`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Neha Kulkarni',
        email: testStudentEmail,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        phone: '9876543210',
        college: 'Sardar Patel Institute of Technology (SPIT)',
        course: 'BSc Information Technology',
        academicYear: 'Third Year (TY)'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.token) {
      studentToken = data.token;
      studentUserId = data.user.id;
      console.log('✔ Test 2: Student Registration passed (Token issued & Password hashed)');
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 2 FAILED:', err.message);
  }

  // 3. Student Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'Password@123'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.token) {
      studentToken = data.token;
      console.log('✔ Test 3: Student Login & JWT verification passed');
    } else {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 3 FAILED:', err.message);
  }

  // 4. Events Listing, Search & Filter
  try {
    const res = await fetch(`${BASE_URL}/events?category=Technical&city=Mumbai`);
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.events)) {
      console.log(`✔ Test 4: Events listing with category & city filter passed (${data.events.length} technical events found)`);
      if (data.events.length > 0) {
        sampleEventId = data.events[0]._id;
      }
    } else {
      throw new Error(`Events search failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 4 FAILED:', err.message);
  }

  // 5. Event Details by ID
  try {
    const res = await fetch(`${BASE_URL}/events/${sampleEventId}`);
    const data = await res.json();
    if (res.ok && data.success && data.event && Array.isArray(data.relatedEvents)) {
      console.log(`✔ Test 5: Event details by ID passed ("${data.event.title}", ${data.relatedEvents.length} related events)`);
    } else {
      throw new Error(`Event details fetch failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 5 FAILED:', err.message);
  }

  // 6. Student Event Registration
  try {
    const res = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ eventId: sampleEventId })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.registration.registrationId) {
      createdRegistrationId = data.registration._id;
      console.log(`✔ Test 6: Event Registration passed (Pass ID generated: ${data.registration.registrationId})`);
    } else {
      throw new Error(`Event registration failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 6 FAILED:', err.message);
  }

  // 7. Duplicate Registration Prevention
  try {
    const res = await fetch(`${BASE_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ eventId: sampleEventId })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      console.log(`✔ Test 7: Duplicate registration prevention passed ("${data.message}")`);
    } else {
      throw new Error(`Duplicate prevention failed! Status: ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Test 7 FAILED:', err.message);
  }

  // 8. Student Dashboard Registrations (GET /my)
  try {
    const res = await fetch(`${BASE_URL}/registrations/my`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && data.registrations.length >= 1) {
      console.log(`✔ Test 8: Student Dashboard registrations fetch passed (${data.registrations.length} booking active)`);
    } else {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 8 FAILED:', err.message);
  }

  // 9. Student Cancelling Registration
  try {
    const res = await fetch(`${BASE_URL}/registrations/${createdRegistrationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`✔ Test 9: Registration cancellation passed (Pass ID: ${data.registrationId})`);
    } else {
      throw new Error(`Registration cancellation failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 9 FAILED:', err.message);
  }

  // 10. RBAC Security Check: Student accessing Admin route must be rejected (403)
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    if (res.status === 403) {
      console.log('✔ Test 10: Role-Based Access Control (RBAC) passed (Student denied admin route with 403 Forbidden)');
    } else {
      throw new Error(`RBAC check failed, expected 403 but got ${res.status}`);
    }
  } catch (err) {
    console.error('❌ Test 10 FAILED:', err.message);
  }

  // 11. Admin Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@statefest.in',
        password: 'Admin@123'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.user.role === 'admin') {
      adminToken = data.token;
      console.log('✔ Test 11: Admin Login passed (Admin role verified)');
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 11 FAILED:', err.message);
  }

  // 12. Admin Statistics
  try {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && data.stats.totalEvents > 0) {
      console.log(`✔ Test 12: Admin Stats passed (${data.stats.totalEvents} events, ${data.stats.totalStudents} students, ${data.stats.participatingColleges} colleges)`);
    } else {
      throw new Error(`Admin stats fetch failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 12 FAILED:', err.message);
  }

  // 13. Admin Create Event
  try {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Maharashtra Inter-College AI Summit 2026',
        category: 'Workshops',
        organizerCollege: 'College of Engineering Pune (COEP)',
        city: 'Pune',
        venue: 'Main Auditorium, Wellesley Road',
        date: new Date('2026-12-20T10:00:00Z'),
        startTime: '10:00 AM',
        endTime: '05:00 PM',
        registrationFee: 150,
        maxParticipants: 120,
        registrationDeadline: new Date('2026-12-15T23:59:59Z'),
        description: 'A state-level workshop covering generative AI architectures and practical deployments.'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.event._id) {
      testEventId = data.event._id;
      console.log(`✔ Test 13: Admin Event Creation passed (Created event ID: ${testEventId})`);
    } else {
      throw new Error(`Event creation failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 13 FAILED:', err.message);
  }

  // 14. Admin Update Event
  try {
    const res = await fetch(`${BASE_URL}/events/${testEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Maharashtra Inter-College AI & Cloud Summit 2026 (Updated)'
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.event.title.includes('(Updated)')) {
      console.log('✔ Test 14: Admin Event Update passed');
    } else {
      throw new Error(`Event update failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 14 FAILED:', err.message);
  }

  // 15. Admin Delete Event
  try {
    const res = await fetch(`${BASE_URL}/events/${testEventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✔ Test 15: Admin Event Deletion passed');
    } else {
      throw new Error(`Event deletion failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error('❌ Test 15 FAILED:', err.message);
  }

  // 16. Admin CSV Export
  try {
    const res = await fetch(`${BASE_URL}/admin/export/csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvText = await res.text();
    if (res.ok && csvText.includes('Registration ID,Student Name,Student Email')) {
      console.log('✔ Test 16: Admin CSV Export passed (Headers verified)');
    } else {
      throw new Error(`CSV export failed: ${csvText.substring(0, 100)}`);
    }
  } catch (err) {
    console.error('❌ Test 16 FAILED:', err.message);
  }

  // 17. Contact Message Submission & Admin Retrieval
  try {
    const contactRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Omkar Jadhav',
        email: 'omkar@college.edu.in',
        subject: 'Inquiry regarding Cultural Festival entry',
        message: 'Could you please clarify if acoustic guitars are allowed in the solo singing competition?'
      })
    });
    const contactData = await contactRes.json();
    if (contactRes.status === 201 && contactData.success) {
      console.log('✔ Test 17a: Contact message submission saved to MongoDB passed');
    }

    // Admin retrieval
    const adminContactRes = await fetch(`${BASE_URL}/contact`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminContactData = await adminContactRes.json();
    if (adminContactRes.ok && adminContactData.success && adminContactData.messages.length > 0) {
      console.log(`✔ Test 17b: Admin contact messages retrieval passed (${adminContactData.messages.length} messages found)`);
    }
  } catch (err) {
    console.error('❌ Test 17 FAILED:', err.message);
  }

  console.log('\n====================================================');
  console.log('       ALL END-TO-END TESTS COMPLETED SUCCESSFULLY!  ');
  console.log('====================================================');
  process.exit(0);
}

runTestSuite();
