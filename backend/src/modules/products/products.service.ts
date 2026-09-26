import { ProductsRepository } from './products.repository.js';
import { PromotionsService } from '../promotions/promotions.service.js';
import { CategoriesRepository } from '../categories/categories.repository.js';
import { storageService, IStorageService } from '../../shared/storage/index.js';
import { NotFoundError, BadRequestError } from '../../errors/app-error.js';

export class ProductsService {
  private repo: ProductsRepository;
  private promotionsService: PromotionsService;
  private categoriesRepo: CategoriesRepository;
  private storage: IStorageService;

  constructor(
    repo = new ProductsRepository(),
    promotionsService = new PromotionsService(),
    categoriesRepo = new CategoriesRepository(),
    storage = storageService
  ) {
    this.repo = repo;
    this.promotionsService = promotionsService;
    this.categoriesRepo = categoriesRepo;
    this.storage = storage;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async getAllProducts(options: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const { products, total } = await this.repo.findAll({
      categoryId: options.categoryId,
      search: options.search,
      isActive: options.isActive,
      skip,
      take: limit
    });

    // Fetch all active promotions currently in effect
    const activePromotions = await this.promotionsService.getActivePromotions();

    // Map each product with its calculated pricing
    const enrichedProducts = products.map((product) => {
      const pricing = this.promotionsService.calculatePrice(
        { ...product, price: Number(product.price) },
        activePromotions
      );
      return {
        ...product,
        price: Number(product.price),
        pricing
      };
    });

    return {
      products: enrichedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    const activePromotions = await this.promotionsService.getActivePromotions();
    const pricing = this.promotionsService.calculatePrice(
      { ...product, price: Number(product.price) },
      activePromotions
    );

    return {
      ...product,
      price: Number(product.price),
      pricing
    };
  }

  async createProduct(data: {
    name: string;
    categoryId: string;
    description?: string;
    price: number;
    isActive?: boolean;
  }) {
    const category = await this.categoriesRepo.findById(data.categoryId);
    if (!category) {
      throw new BadRequestError(`Category with ID ${data.categoryId} does not exist`);
    }

    const baseSlug = this.slugify(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await this.repo.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.repo.create({
      ...data,
      slug
    });
  }

  async updateProduct(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      description?: string;
      price?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    if (data.categoryId) {
      const category = await this.categoriesRepo.findById(data.categoryId);
      if (!category) {
        throw new BadRequestError(`Category with ID ${data.categoryId} does not exist`);
      }
    }

    let slug: string | undefined;
    if (data.name && data.name !== existing.name) {
      const baseSlug = this.slugify(data.name);
      slug = baseSlug;
      let counter = 1;
      let found = await this.repo.findBySlug(slug);
      while (found && found.id !== id) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        found = await this.repo.findBySlug(slug);
      }
    }

    return this.repo.update(id, {
      ...data,
      ...(slug ? { slug } : {})
    });
  }

  async deleteProduct(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Clean up media files
    for (const media of existing.media) {
      await this.storage.deleteFile(media.storagePath);
    }

    return this.repo.delete(id);
  }

  // Media handling
  async uploadProductMedia(
    productId: string,
    files: Express.Multer.File[],
    isCover = false
  ) {
    const product = await this.repo.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    const savedMedia = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.mimetype.startsWith('video/');
      const type = isVideo ? 'video' : 'image';

      const stored = await this.storage.saveFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        `products/${productId}`
      );

      const hasCover = product.media.some((m) => m.isCover);
      const shouldBeCover = isCover && i === 0 || (!hasCover && i === 0 && !isVideo);

      const mediaRecord = await this.repo.addMedia({
        productId,
        type,
        url: stored.url,
        storagePath: stored.storagePath,
        displayOrder: product.media.length + i,
        isCover: shouldBeCover
      });

      savedMedia.push(mediaRecord);
    }

    return savedMedia;
  }

  async deleteMedia(productId: string, mediaId: string) {
    const media = await this.repo.getMediaById(mediaId);
    if (!media || media.productId !== productId) {
      throw new NotFoundError(`Media with ID ${mediaId} not found for this product`);
    }

    await this.storage.deleteFile(media.storagePath);
    await this.repo.deleteMedia(mediaId);

    // If deleted media was cover, set first remaining image as cover
    if (media.isCover) {
      const remaining = await this.repo.findById(productId);
      const nextCover = remaining?.media.find((m) => m.type === 'image');
      if (nextCover) {
        await this.repo.setCoverMedia(productId, nextCover.id);
      }
    }

    return true;
  }

  async setCoverMedia(productId: string, mediaId: string) {
    const media = await this.repo.getMediaById(mediaId);
    if (!media || media.productId !== productId) {
      throw new NotFoundError(`Media with ID ${mediaId} not found`);
    }
    if (media.type === 'video') {
      throw new BadRequestError('A video cannot be selected as the cover thumbnail');
    }
    return this.repo.setCoverMedia(productId, mediaId);
  }
}
