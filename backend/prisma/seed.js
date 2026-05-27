const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.nonConformance.deleteMany()
  await prisma.document.deleteMany()
  await prisma.verificationTask.deleteMany()
  await prisma.deliveryItem.deleteMany()
  await prisma.delivery.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.supplierFieldMapping.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.material.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding users...')
  const passwordAdmin = await bcrypt.hash('admin123', 10)
  const passwordManager = await bcrypt.hash('qcmanager123', 10)
  const passwordStaff = await bcrypt.hash('qcstaff123', 10)
  const passwordWarehouse = await bcrypt.hash('warehouse123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin QC',
      email: 'admin@matverify.com',
      password: passwordAdmin,
      role: 'ADMIN',
      department: 'Quality Assurance'
    }
  })

  const manager = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@matverify.com',
      password: passwordManager,
      role: 'QC_MANAGER',
      department: 'Quality Control'
    }
  })

  const staff = await prisma.user.create({
    data: {
      name: 'Siti Rahma',
      email: 'siti@matverify.com',
      password: passwordStaff,
      role: 'QC_STAFF',
      department: 'Quality Control'
    }
  })

  const warehouse = await prisma.user.create({
    data: {
      name: 'Joko Widodo',
      email: 'joko@matverify.com',
      password: passwordWarehouse,
      role: 'WAREHOUSE_STAFF',
      department: 'Logistics'
    }
  })

  console.log('Seeding suppliers...')
  const sup1 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-001',
      supplierName: 'BioPharma Chemical Ltd.',
      certNumber: 'CERT-BP-2026',
      email: 'info@biopharma.com',
      phone: '+628111222333',
      address: 'Kawasan Industri Jababeka Blok C-12, Cikarang',
      status: 'ACTIVE'
    }
  })

  const sup2 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-002',
      supplierName: 'Global Active Ingredients Inc.',
      certNumber: 'CERT-GAI-9981',
      email: 'sales@globalactive.com',
      phone: '+6567891234',
      address: '12 Science Park Drive, Singapore',
      status: 'ACTIVE'
    }
  })

  const sup3 = await prisma.supplier.create({
    data: {
      supplierCode: 'SUP-003',
      supplierName: 'Nusantara Herbal Supplier',
      certNumber: 'CERT-NHS-7762',
      email: 'contact@nusantaraherbal.co.id',
      phone: '+628123456789',
      address: 'Jl. Merdeka No. 45, Solo, Jawa Tengah',
      status: 'ACTIVE'
    }
  })

  console.log('Seeding supplier field mappings...')
  await prisma.supplierFieldMapping.createMany({
    data: [
      { supplierId: sup1.id, externalField: 'purity', internalField: 'assay' },
      { supplierId: sup1.id, externalField: 'moisture', internalField: 'loss_on_drying' },
      { supplierId: sup2.id, externalField: 'assay_percent', internalField: 'assay' },
      { supplierId: sup2.id, externalField: 'lod', internalField: 'loss_on_drying' }
    ]
  })

  console.log('Seeding materials...')
  const mat1 = await prisma.material.create({
    data: {
      materialCode: 'MAT-PCT',
      name: 'Paracetamol (Acetaminophen)',
      category: 'API',
      unit: 'kg',
      qualitySpecs: {
        assay: 'min 99.0%',
        loss_on_drying: 'max 0.5%',
        heavy_metals: 'max 20 ppm',
        melting_point: '168-172'
      }
    }
  })

  const mat2 = await prisma.material.create({
    data: {
      materialCode: 'MAT-IBP',
      name: 'Ibuprofen',
      category: 'API',
      unit: 'kg',
      qualitySpecs: {
        assay: '97.0-103.0%',
        loss_on_drying: 'max 0.5%',
        melting_point: '75-78'
      }
    }
  })

  const mat3 = await prisma.material.create({
    data: {
      materialCode: 'MAT-AMX',
      name: 'Amoxicillin Trihydrate',
      category: 'Antibiotic',
      unit: 'kg',
      qualitySpecs: {
        assay: '95.0-102.0%',
        loss_on_drying: '11.5-14.5%'
      }
    }
  })

  console.log('Seeding purchase orders...')
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0001',
      supplierId: sup1.id,
      createdById: manager.id,
      poDate: new Date('2026-05-10'),
      notes: 'Bahan baku untuk Batch Produksi Paracetamol Sirup Anak',
      status: 'OPEN'
    }
  })

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0002',
      supplierId: sup2.id,
      createdById: manager.id,
      poDate: new Date('2026-05-15'),
      notes: 'Ibuprofen kelas farmasi super murni',
      status: 'OPEN'
    }
  })

  console.log('Seeding deliveries and items...')
  const delivery1 = await prisma.delivery.create({
    data: {
      deliveryNo: 'DEL-2026-0010',
      poId: po1.id,
      receivedById: warehouse.id,
      arrivalDate: new Date('2026-05-25'),
      status: 'PENDING',
      notes: 'Tiba siang hari pukul 13.00, segel luar utuh.',
      items: {
        create: [
          {
            materialId: mat1.id,
            qtyOrdered: 1000,
            qtyReceived: 1000,
            batchNo: 'B-PCT-2605',
            expiryDate: new Date('2029-05-24')
          }
        ]
      }
    },
    include: { items: true }
  })

  const delivery2 = await prisma.delivery.create({
    data: {
      deliveryNo: 'DEL-2026-0011',
      poId: po2.id,
      receivedById: warehouse.id,
      arrivalDate: new Date('2026-05-26'),
      status: 'PENDING',
      notes: 'Pengiriman via kargo udara Singapura.',
      items: {
        create: [
          {
            materialId: mat2.id,
            qtyOrdered: 500,
            qtyReceived: 500,
            batchNo: 'B-IBP-9908',
            expiryDate: new Date('2029-11-30')
          }
        ]
      }
    },
    include: { items: true }
  })

  console.log('Seeding verification tasks...')
  // Create tasks for each delivery item
  const task1 = await prisma.verificationTask.create({
    data: {
      deliveryItemId: delivery1.items[0].id,
      assignedToId: staff.id,
      status: 'PENDING',
      priority: 'HIGH',
      notes: 'Segera lakukan verifikasi CoA untuk rilis produksi.'
    }
  })

  const task2 = await prisma.verificationTask.create({
    data: {
      deliveryItemId: delivery2.items[0].id,
      assignedToId: staff.id,
      status: 'PENDING',
      priority: 'MEDIUM',
      notes: 'Antrean reguler.'
    }
  })

  console.log('Seeding completed successfully!')
  console.log(`Log in credentials:
  - Admin: admin@matverify.com / admin123
  - QC Manager: budi@matverify.com / qcmanager123
  - QC Staff: siti@matverify.com / qcstaff123
  - Warehouse Staff: joko@matverify.com / warehouse123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
