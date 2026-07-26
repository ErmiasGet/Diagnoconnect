import { PrismaClient, OrgType, UserRole, Gender, BloodGroup, RoomType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'admin@diagnosconnect.com', organizationId: null },
  });
  const superAdmin = existingSuperAdmin
    ? existingSuperAdmin
    : await prisma.user.create({
        data: {
          email: 'admin@diagnosconnect.com',
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
          isEmailVerified: true,
        },
      });
  console.log('Super Admin created:', superAdmin.email);

  // Create Organization (Hospital)
  const hospital = await prisma.organization.upsert({
    where: { slug: 'city-general-hospital' },
    update: {},
    create: {
      name: 'City General Hospital',
      slug: 'city-general-hospital',
      type: 'HOSPITAL',
      phone: '+251911234567',
      email: 'info@citygeneral.hospital',
      website: 'https://citygeneral.hospital',
      address: {
        street: '123 Health Avenue',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
        zipCode: '1000',
      },
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      country: 'ET',
      timezone: 'Africa/Addis_Ababa',
      currency: 'ETB',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('Hospital created:', hospital.name);

  // Create Organization Admin
  const orgAdmin = await prisma.user.upsert({
    where: {
      organizationId_email: { organizationId: hospital.id, email: 'admin@citygeneral.hospital' },
    },
    update: {},
    create: {
      organizationId: hospital.id,
      email: 'admin@citygeneral.hospital',
      password: hashedPassword,
      firstName: 'Hospital',
      lastName: 'Admin',
      role: 'ORG_ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log('Org Admin created');

  // Create Departments
  const departments = [
    { name: 'General Medicine', code: 'GM', color: '#2563EB' },
    { name: 'Cardiology', code: 'CARD', color: '#DC2626' },
    { name: 'Orthopedics', code: 'ORTH', color: '#059669' },
    { name: 'Pediatrics', code: 'PED', color: '#7C3AED' },
    { name: 'Gynecology', code: 'GYN', color: '#EC4899' },
    { name: 'Neurology', code: 'NEURO', color: '#F59E0B' },
    { name: 'Dermatology', code: 'DERM', color: '#14B8A6' },
    { name: 'ENT', code: 'ENT', color: '#6366F1' },
    { name: 'Ophthalmology', code: 'OPH', color: '#8B5CF6' },
    { name: 'Radiology', code: 'RAD', color: '#0EA5E9' },
    { name: 'Laboratory', code: 'LAB', color: '#10B981' },
    { name: 'Pharmacy', code: 'PHARM', color: '#F97316' },
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { organizationId_code: { organizationId: hospital.id, code: dept.code } },
      update: {},
      create: {
        organizationId: hospital.id,
        name: dept.name,
        code: dept.code,
        color: dept.color,
        isActive: true,
      },
    });
    createdDepartments.push(created);
  }
  console.log(`${departments.length} departments created`);

  // Create Rooms
  const rooms = [
    { name: 'Consultation Room 1', number: 'CR-01', type: RoomType.CONSULTATION, floor: 1 },
    { name: 'Consultation Room 2', number: 'CR-02', type: RoomType.CONSULTATION, floor: 1 },
    { name: 'Consultation Room 3', number: 'CR-03', type: RoomType.CONSULTATION, floor: 2 },
    { name: 'Examination Room 1', number: 'ER-01', type: RoomType.EXAMINATION, floor: 1 },
    { name: 'Laboratory', number: 'LAB-01', type: RoomType.LABORATORY, floor: -1 },
    { name: 'Radiology Room', number: 'RAD-01', type: RoomType.RADIOLOGY, floor: -1 },
    { name: 'Reception', number: 'REC-01', type: RoomType.RECEPTION, floor: 0 },
    { name: 'Waiting Area', number: 'WA-01', type: RoomType.WAITING, floor: 0 },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { organizationId_number: { organizationId: hospital.id, number: room.number } },
      update: {},
      create: { organizationId: hospital.id, ...room, isActive: true },
    });
  }
  console.log(`${rooms.length} rooms created`);

  // Create Receptionist
  const existingReceptionist = await prisma.user.findFirst({
    where: { email: 'reception@citygeneral.hospital', organizationId: hospital.id },
  });
  const receptionist = existingReceptionist
    ? existingReceptionist
    : await prisma.user.create({
        data: {
          organizationId: hospital.id,
          email: 'reception@citygeneral.hospital',
          password: hashedPassword,
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'RECEPTIONIST',
          phone: '+251911234568',
          isActive: true,
        },
      });

  if (!existingReceptionist) {
    await prisma.receptionProfile.create({
      data: {
        userId: receptionist.id,
        organizationId: hospital.id,
        stationNumber: 1,
      },
    });
  }
  console.log('Receptionist created');

  // Create Doctors
  const doctorData = [
    { firstName: 'Dr. Abebe', lastName: 'Kebede', specialty: 'General Medicine', email: 'abebe@citygeneral.hospital', fee: 500 },
    { firstName: 'Dr. Fatima', lastName: 'Ahmed', specialty: 'Cardiology', email: 'fatima@citygeneral.hospital', fee: 800 },
    { firstName: 'Dr. Daniel', lastName: 'Tesfaye', specialty: 'Orthopedics', email: 'daniel@citygeneral.hospital', fee: 700 },
    { firstName: 'Dr. Hanna', lastName: 'Mulugeta', specialty: 'Pediatrics', email: 'hanna@citygeneral.hospital', fee: 600 },
    { firstName: 'Dr. Yonas', lastName: 'Birhanu', specialty: 'Neurology', email: 'yonas@citygeneral.hospital', fee: 900 },
  ];

  const createdDoctors = [];
  for (const doc of doctorData) {
    const existingUser = await prisma.user.findFirst({
      where: { email: doc.email, organizationId: hospital.id },
    });
    const user = existingUser
      ? existingUser
      : await prisma.user.create({
          data: {
            organizationId: hospital.id,
            email: doc.email,
            password: hashedPassword,
            firstName: doc.firstName,
            lastName: doc.lastName,
            role: 'DOCTOR',
            isActive: true,
          },
        });

    const existingProfile = await prisma.doctorProfile.findFirst({
      where: { userId: user.id },
    });
    const profile = existingProfile
      ? existingProfile
      : await prisma.doctorProfile.create({
          data: {
            userId: user.id,
            organizationId: hospital.id,
            specialty: doc.specialty,
            consultationFee: doc.fee,
            rating: 4.5,
            totalRatings: 50,
            isAcceptingPatients: true,
            isTelemedicineEnabled: true,
            maxPatientsPerDay: 30,
            slotDuration: 30,
            availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            startTime: '09:00',
            endTime: '17:00',
          },
        });

    createdDoctors.push({ user, profile });
  }
  console.log(`${doctorData.length} doctors created`);

  // Create Lab Technician
  const existingLabTech = await prisma.user.findFirst({
    where: { email: 'labtech@citygeneral.hospital', organizationId: hospital.id },
  });
  const labTech = existingLabTech
    ? existingLabTech
    : await prisma.user.create({
        data: {
          organizationId: hospital.id,
          email: 'labtech@citygeneral.hospital',
          password: hashedPassword,
          firstName: 'Meron',
          lastName: 'Alemayehu',
          role: 'LAB_TECHNICIAN',
          isActive: true,
        },
      });

  if (!existingLabTech) {
    await prisma.labTechnicianProfile.create({
      data: {
        userId: labTech.id,
        organizationId: hospital.id,
        canCollectSamples: true,
        canEnterResults: true,
        canApproveResults: false,
      },
    });
  }
  console.log('Lab Technician created');

  // Create Pharmacist
  const existingPharmacist = await prisma.user.findFirst({
    where: { email: 'pharmacy@citygeneral.hospital', organizationId: hospital.id },
  });
  const pharmacist = existingPharmacist
    ? existingPharmacist
    : await prisma.user.create({
        data: {
          organizationId: hospital.id,
          email: 'pharmacy@citygeneral.hospital',
          password: hashedPassword,
          firstName: 'Bereket',
          lastName: 'Tadesse',
          role: 'PHARMACIST',
          isActive: true,
        },
      });

  if (!existingPharmacist) {
    await prisma.pharmacistProfile.create({
      data: {
        userId: pharmacist.id,
        organizationId: hospital.id,
        canDispense: true,
        canManageInventory: true,
      },
    });
  }
  console.log('Pharmacist created');

  // Create Cashier
  const existingCashier = await prisma.user.findFirst({
    where: { email: 'cashier@citygeneral.hospital', organizationId: hospital.id },
  });
  const cashier = existingCashier
    ? existingCashier
    : await prisma.user.create({
        data: {
          organizationId: hospital.id,
          email: 'cashier@citygeneral.hospital',
          password: hashedPassword,
          firstName: 'Liya',
          lastName: 'Worku',
          role: 'CASHIER',
          isActive: true,
        },
      });

  if (!existingCashier) {
    await prisma.cashierProfile.create({
      data: {
        userId: cashier.id,
        organizationId: hospital.id,
        stationNumber: 1,
      },
    });
  }
  console.log('Cashier created');

  // Create Test Categories & Tests
  const testCategories = [
    { name: 'Hematology', code: 'HEM' },
    { name: 'Biochemistry', code: 'BIO' },
    { name: 'Microbiology', code: 'MIC' },
    { name: 'Urinalysis', code: 'URIN' },
    { name: 'Immunology', code: 'IMM' },
  ];

  const createdCategories = [];
  for (const cat of testCategories) {
    let created = await prisma.testCategory.findFirst({
      where: { organizationId: hospital.id, code: cat.code },
    });
    if (!created) {
      created = await prisma.testCategory.create({
        data: { organizationId: hospital.id, name: cat.name, code: cat.code, isActive: true },
      });
    }
    createdCategories.push(created);
  }

  const tests = [
    { name: 'Complete Blood Count', code: 'CBC', category: 'HEM', price: 200, sampleType: 'Blood' },
    { name: 'Blood Sugar (Fasting)', code: 'BSF', category: 'BIO', price: 100, sampleType: 'Blood' },
    { name: 'Lipid Profile', code: 'LIP', category: 'BIO', price: 350, sampleType: 'Blood' },
    { name: 'Liver Function Test', code: 'LFT', category: 'BIO', price: 400, sampleType: 'Blood' },
    { name: 'Kidney Function Test', code: 'KFT', category: 'BIO', price: 350, sampleType: 'Blood' },
    { name: 'Urine Analysis', code: 'UA', category: 'URIN', price: 80, sampleType: 'Urine' },
    { name: 'Thyroid Profile', code: 'TFT', category: 'BIO', price: 500, sampleType: 'Blood' },
    { name: 'Hemoglobin', code: 'HGB', category: 'HEM', price: 100, sampleType: 'Blood' },
    { name: 'ESR', code: 'ESR', category: 'HEM', price: 80, sampleType: 'Blood' },
    { name: 'Blood Grouping', code: 'BG', category: 'HEM', price: 100, sampleType: 'Blood' },
  ];

  for (const test of tests) {
    const cat = createdCategories.find(c => c.code === test.category);
    const existing = await prisma.test.findFirst({
      where: { organizationId: hospital.id, code: test.code },
    });
    if (!existing) {
      await prisma.test.create({
        data: {
          organizationId: hospital.id,
          categoryId: cat?.id,
          name: test.name,
          code: test.code,
          sampleType: test.sampleType,
          price: test.price,
          isActive: true,
          turnaroundTime: 4,
          turnaroundUnit: 'hours',
        },
      });
    }
  }
  console.log(`${tests.length} tests created`);

  // Create Medicines
  const medicines = [
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForm: 'Capsule', strength: '500mg', cost: 5, selling: 10, stock: 500 },
    { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', dosageForm: 'Tablet', strength: '500mg', cost: 1, selling: 3, stock: 1000 },
    { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Antidiabetic', dosageForm: 'Tablet', strength: '500mg', cost: 3, selling: 8, stock: 800 },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Antihypertensive', dosageForm: 'Tablet', strength: '5mg', cost: 4, selling: 12, stock: 600 },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'PPI', dosageForm: 'Capsule', strength: '20mg', cost: 3, selling: 10, stock: 400 },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Bronchodilator', dosageForm: 'Inhaler', strength: '100mcg', cost: 50, selling: 120, stock: 50 },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', dosageForm: 'Tablet', strength: '10mg', cost: 1, selling: 4, stock: 700 },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', dosageForm: 'Tablet', strength: '400mg', cost: 2, selling: 5, stock: 900 },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', cost: 8, selling: 20, stock: 300 },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', dosageForm: 'Tablet', strength: '500mg', cost: 6, selling: 15, stock: 350 },
  ];

  for (const med of medicines) {
    const existing = await prisma.medicine.findFirst({
      where: { organizationId: hospital.id, name: med.name },
    });
    if (!existing) {
      await prisma.medicine.create({
        data: {
          organizationId: hospital.id,
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          dosageForm: med.dosageForm,
          strength: med.strength,
          costPrice: med.cost,
          sellingPrice: med.selling,
          currentStock: med.stock,
          minimumStock: 50,
          reorderLevel: 100,
          isActive: true,
          requiresPrescription: med.category === 'Antibiotic',
        },
      });
    }
  }
  console.log(`${medicines.length} medicines created`);

  // Create Insurance Providers
  const insuranceProviders = [
    { name: 'Nyala Insurance', code: 'NYALA', reimbursementRate: 70 },
    { name: 'Awash Insurance', code: 'AWASH', reimbursementRate: 75 },
    { name: 'Berhan Insurance', code: 'BERHAN', reimbursementRate: 65 },
    { name: 'United Insurance', code: 'UNITED', reimbursementRate: 80 },
  ];

  for (const prov of insuranceProviders) {
    const existing = await prisma.insuranceProvider.findFirst({
      where: { organizationId: hospital.id, code: prov.code },
    });
    if (!existing) {
      await prisma.insuranceProvider.create({
        data: {
          organizationId: hospital.id,
          name: prov.name,
          code: prov.code,
          reimbursementRate: prov.reimbursementRate,
          isActive: true,
        },
      });
    }
  }
  console.log(`${insuranceProviders.length} insurance providers created`);

  // Create Subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: { organizationId: hospital.id },
  });
  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        organizationId: hospital.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        monthlyPrice: 50000,
        billingCycle: 'MONTHLY',
        maxUsers: 100,
        maxPatients: 100000,
        maxStorage: 51200,
        features: {
          emr: true,
          telemedicine: true,
          pharmacy: true,
          laboratory: true,
          radiology: true,
          billing: true,
          insurance: true,
          queue: true,
          reports: true,
          analytics: true,
        },
      },
    });
  }
  console.log('Subscription created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Super Admin: admin@diagnosconnect.com / Admin@123');
  console.log('Org Admin: admin@citygeneral.hospital / Admin@123');
  console.log('Receptionist: reception@citygeneral.hospital / Admin@123');
  console.log('Doctor: abebe@citygeneral.hospital / Admin@123');
  console.log('Lab Tech: labtech@citygeneral.hospital / Admin@123');
  console.log('Pharmacist: pharmacy@citygeneral.hospital / Admin@123');
  console.log('Cashier: cashier@citygeneral.hospital / Admin@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
