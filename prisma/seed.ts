import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nebosync.com' },
    update: {},
    create: {
      email: 'admin@nebosync.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@nebosync.com' },
    update: {},
    create: {
      email: 'staff@nebosync.com',
      password: staffPassword,
      name: 'Staff Member',
      role: 'STAFF',
    },
  })
  console.log('✅ Staff user created:', staff.email)

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { roomNumber: '101' },
      update: {},
      create: { roomNumber: '101', roomType: 'Deluxe', floor: 1 },
    }),
    prisma.room.upsert({
      where: { roomNumber: '102' },
      update: {},
      create: { roomNumber: '102', roomType: 'Standard', floor: 1 },
    }),
    prisma.room.upsert({
      where: { roomNumber: '201' },
      update: {},
      create: { roomNumber: '201', roomType: 'Suite', floor: 2 },
    }),
    prisma.room.upsert({
      where: { roomNumber: '202' },
      update: {},
      create: { roomNumber: '202', roomType: 'Deluxe', floor: 2 },
    }),
  ])
  console.log(`✅ Created ${rooms.length} rooms`)

  // Create guest
  const guest = await prisma.guest.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      roomId: rooms[0].id,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  })
  console.log('✅ Guest created:', guest.name)

  // Update room occupation status
  await prisma.room.update({
    where: { id: rooms[0].id },
    data: { isOccupied: true },
  })

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Room Cleaning',
        description: 'Professional room cleaning service',
        price: 500,
        category: 'Housekeeping',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Laundry Service',
        description: 'Quick laundry and ironing service',
        price: 300,
        category: 'Housekeeping',
        imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Airport Pickup',
        description: 'Comfortable airport transfer service',
        price: 1500,
        category: 'Transport',
        imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Spa & Massage',
        description: 'Relaxing spa and massage session',
        price: 2000,
        category: 'Wellness',
        imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
      },
    }),
  ])
  console.log(`✅ Created ${services.length} services`)

  // Create food menu items
  const foodItems = await Promise.all([
    prisma.foodMenu.create({
      data: {
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken',
        price: 350,
        category: 'Main Course',
        isVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in rich tomato gravy',
        price: 300,
        category: 'Main Course',
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Biryani',
        description: 'Aromatic rice with spices and chicken',
        price: 400,
        category: 'Main Course',
        isVeg: false,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils in butter and cream',
        price: 250,
        category: 'Main Course',
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe with spiced potato filling',
        price: 150,
        category: 'Breakfast',
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Filter Coffee',
        description: 'South Indian style filter coffee',
        price: 80,
        category: 'Beverages',
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
      },
    }),
    prisma.foodMenu.create({
      data: {
        name: 'Gulab Jamun',
        description: 'Sweet milk solid dumplings in sugar syrup',
        price: 120,
        category: 'Desserts',
        isVeg: true,
        imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c2',
      },
    }),
  ])
  console.log(`✅ Created ${foodItems.length} food menu items`)

  // Create WiFi credentials
  const wifi = await prisma.wiFiCredential.create({
    data: {
      ssid: 'NeboSync_Guest',
      password: 'Welcome2024',
      description: 'Guest WiFi - High Speed Internet',
    },
  })
  console.log('✅ WiFi credentials created:', wifi.ssid)

  console.log('🎉 Database seeding completed!')
  console.log('\n📝 Login Credentials:')
  console.log('Admin: admin@nebosync.com / admin123')
  console.log('Staff: staff@nebosync.com / staff123')
  console.log('Guest: +919876543210 / Room 101')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
