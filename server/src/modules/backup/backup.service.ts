import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessDocument } from '../documents/document.schema';
import { Product } from '../catalog/product.schema';
import { Party } from '../parties/party.schema';
import { Expense } from '../expenses/expense.schema';
import { Company } from '../company/company.schema';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectModel(BusinessDocument.name) private docModel: Model<BusinessDocument>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Party.name) private partyModel: Model<Party>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  async exportBackup(companyId: string) {
    const cid = new Types.ObjectId(companyId);

    const [company, documents, products, parties, expenses] = await Promise.all([
      this.companyModel.findById(cid).lean(),
      this.docModel.find({ companyId: cid }).lean(),
      this.productModel.find({ companyId: cid }).lean(),
      this.partyModel.find({ companyId: cid }).lean(),
      this.expenseModel.find({ companyId: cid }).lean(),
    ]);

    const backupData = {
      version: '1.0.3',
      app: 'BalajiOne Invoice',
      exportedAt: new Date().toISOString(),
      companyId,
      data: {
        company,
        documents,
        products,
        parties,
        expenses,
      },
      stats: {
        documentCount: documents.length,
        productCount: products.length,
        partyCount: parties.length,
        expenseCount: expenses.length,
      },
    };

    this.logger.log(`Exported backup for company ${companyId}: ${documents.length} docs, ${products.length} items.`);
    return backupData;
  }

  async restoreBackup(companyId: string, backupPayload: any) {
    if (!backupPayload || !backupPayload.data) {
      throw new BadRequestException('Invalid backup payload format.');
    }

    const { documents = [], products = [], parties = [], expenses = [] } = backupPayload.data;
    const cid = new Types.ObjectId(companyId);
    let restoredDocs = 0;
    let restoredItems = 0;
    let restoredParties = 0;

    for (const p of parties) {
      delete p._id;
      p.companyId = cid;
      await this.partyModel.updateOne({ companyId: cid, name: p.name }, { $set: p }, { upsert: true });
      restoredParties++;
    }

    for (const pr of products) {
      delete pr._id;
      pr.companyId = cid;
      await this.productModel.updateOne({ companyId: cid, name: pr.name }, { $set: pr }, { upsert: true });
      restoredItems++;
    }

    for (const d of documents) {
      delete d._id;
      d.companyId = cid;
      await this.docModel.updateOne({ companyId: cid, number: d.number, docType: d.docType }, { $set: d }, { upsert: true });
      restoredDocs++;
    }

    return {
      success: true,
      message: 'Backup restored successfully.',
      restored: {
        documents: restoredDocs,
        products: restoredItems,
        parties: restoredParties,
        expenses: expenses.length,
      },
    };
  }
}
