import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Super Administrador con control total del sistema'
    }
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: {
      name: 'EMPLOYEE',
      description: 'Personal con permisos de visualización y gestión acotada'
    }
  });

  // 2. Permissions
  const permissionsList = [
    { code: 'products:manage', description: 'Crear, editar y eliminar productos' },
    { code: 'categories:manage', description: 'Crear, editar y eliminar categorías' },
    { code: 'promotions:manage', description: 'Crear, editar y eliminar promociones' },
    { code: 'settings:manage', description: 'Configuraciones del sistema y usuarios' }
  ];

  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id
      }
    });
  }

  // 3. Admin User
  const defaultPassword = 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@accesoriosph.com',
      passwordHash,
      roleId: adminRole.id,
      isActive: true
    }
  });

  console.log(`👤 Usuario Administrador creado: admin / ${defaultPassword}`);

  // 4. Categorías
  const categoriesData = [
    {
      name: 'Auriculares',
      slug: 'auriculares',
      description: 'Auriculares inalámbricos TWS, cancelación de ruido y cableados'
    },
    {
      name: 'Cargadores & Fuentes',
      slug: 'cargadores-y-fuentes',
      description: 'Cargadores rápidos GaN, adaptadores de pared y cargadores inalámbricos'
    },
    {
      name: 'Cables',
      slug: 'cables',
      description: 'Cables reforzados USB-C a Lightning, USB-C a USB-C y trenzados'
    },
    {
      name: 'USB & Adaptadores',
      slug: 'usb-y-adaptadores',
      description: 'Memorias OTG, hubs multipuerto y adaptadores de audio'
    },
    {
      name: 'Fundas & Protectores',
      slug: 'fundas-y-protectores',
      description: 'Fundas de silicona líquida con MagSafe, vidrio templado 9H'
    }
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 5. Productos de muestra con estética premium
  const sampleProducts = [
    {
      name: 'Auriculares PH PureBass Pro Wireless',
      slug: 'auriculares-ph-purebass-pro-wireless',
      categoryId: categoryMap.get('auriculares')!,
      description: 'Audio de alta fidelidad, cancelación activa de ruido (ANC) híbrida, estuche con carga inalámbrica y autonomía de hasta 32 horas.',
      price: 49.99,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/auricular-pro.jpg',
          isCover: true,
          displayOrder: 0
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/auricular-pro-2.jpg',
          isCover: false,
          displayOrder: 1
        }
      ]
    },
    {
      name: 'Auriculares PH Studio ANC Over-Ear',
      slug: 'auriculares-ph-studio-anc-over-ear',
      categoryId: categoryMap.get('auriculares')!,
      description: 'Diseño minimalista en aluminio anodizado, almohadillas viscoelásticas transpirables y modo transparencia ultra realista.',
      price: 89.99,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/studio-overear.jpg',
          isCover: true,
          displayOrder: 0
        }
      ]
    },
    {
      name: 'Cargador Rápido 65W GaN Dual USB-C + USB-A',
      slug: 'cargador-rapido-65w-gan-dual',
      categoryId: categoryMap.get('cargadores-y-fuentes')!,
      description: 'Tecnología Nitruro de Galio (GaN) de tamaño ultra compacto. Carga rápida inteligente PD 3.0 para celulares, tablets y laptops.',
      price: 34.50,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/cargador-gan.jpg',
          isCover: true,
          displayOrder: 0
        }
      ]
    },
    {
      name: 'Cargador Inalámbrico Magnético Slim 15W',
      slug: 'cargador-inalambrico-magnetico-slim-15w',
      categoryId: categoryMap.get('cargadores-y-fuentes')!,
      description: 'Alineación magnética perfecta, acabado en aluminio satinado gris y protección térmica avanzada de grado aeroespacial.',
      price: 25.00,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/cargador-mag.jpg',
          isCover: true,
          displayOrder: 0
        }
      ]
    },
    {
      name: 'Cable Trenzado Kevlar USB-C a Lightning 1.8m',
      slug: 'cable-trenzado-kevlar-usbc-lightning',
      categoryId: categoryMap.get('cables')!,
      description: 'Certificado MFi, recubrimiento de fibra trenzada reforzada resistente a más de 30.000 dobleces y terminales de aleación de zinc.',
      price: 18.00,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/cable-kevlar.jpg',
          isCover: true,
          displayOrder: 0
        }
      ]
    },
    {
      name: 'Funda Silicona Líquida Soft-Touch con MagSafe',
      slug: 'funda-silicona-liquida-soft-touch-magsafe',
      categoryId: categoryMap.get('fundas-y-protectores')!,
      description: 'Tacto sedoso antiadherente, forro interior de microfibra suave que protege contra micro-rayas y anillo magnético integrado.',
      price: 22.00,
      isActive: true,
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
          storagePath: 'samples/funda-silicona.jpg',
          isCover: true,
          displayOrder: 0
        }
      ]
    }
  ];

  const productRecords = [];
  for (const prod of sampleProducts) {
    const { media, ...prodFields } = prod;
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...prodFields,
          media: {
            create: media
          }
        }
      });
      productRecords.push(created);
    } else {
      productRecords.push(existing);
    }
  }

  // 6. Promociones de prueba
  // a) Promoción de categoría: 15% en Auriculares válida por 30 días, excluyendo el modelo Studio Over-Ear
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const studioProduct = productRecords.find((p) => p.slug === 'auriculares-ph-studio-anc-over-ear');

  const aurisCatId = categoryMap.get('auriculares');
  if (aurisCatId) {
    const existingPromo = await prisma.promotion.findFirst({
      where: { name: 'Especial Lanzamiento Audio PH' }
    });

    if (!existingPromo) {
      await prisma.promotion.create({
        data: {
          name: 'Especial Lanzamiento Audio PH',
          type: 'category',
          discountPercentage: 15,
          categoryId: aurisCatId,
          startDate: now,
          endDate: nextMonth,
          isActive: true,
          exclusions: studioProduct
            ? {
                create: [{ productId: studioProduct.id }]
              }
            : undefined
        }
      });
      console.log('🏷️ Creada promoción de categoría: 15% OFF en Auriculares (con excepción)');
    }
  }

  // b) Promoción de producto: 20% en Cargador GaN
  const ganProduct = productRecords.find((p) => p.slug === 'cargador-rapido-65w-gan-dual');
  if (ganProduct) {
    const existingGanPromo = await prisma.promotion.findFirst({
      where: { name: 'Oferta Flash Cargador GaN 65W' }
    });

    if (!existingGanPromo) {
      await prisma.promotion.create({
        data: {
          name: 'Oferta Flash Cargador GaN 65W',
          type: 'product',
          discountPercentage: 20,
          productId: ganProduct.id,
          startDate: now,
          endDate: nextMonth,
          isActive: true
        }
      });
      console.log('⚡ Creada promoción de producto: 20% OFF en Cargador GaN 65W');
    }
  }

  console.log('✅ Base de datos inicializada y poblada con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
