
import Dexie, { Table } from 'dexie';
import { BeanVariety, POStatus, GradeStatus, StockType, Supplier, PurchaseOrder, GreenBeanGrade, RoastProfile, ExternalRoastLog, CuppingSession, Blend, StockItem, WarehouseLog, SalesRecord, AlertSetting, PaymentStatus, Packaging, Expense, ExpenseCategory, User, UserRole, Todo, Priority, TaskStatus, Comment } from '../types';

// --- INITIAL DATA (for seeding the database once) ---

const getDateString = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

const initialUsers: User[] = [
    { id: 'US0724-0001', username: 'admin', password: 'password123', role: UserRole.ADMIN },
    { id: 'US0724-0002', username: 'roaster', password: 'password123', role: UserRole.ROASTER },
    { id: 'US0724-0003', username: 'sales', password: 'password123', role: UserRole.SALES },
    { id: 'US0724-0004', username: 'qc', password: 'password123', role: UserRole.QC },
];

const initialSuppliers: Supplier[] = [
    { id: 'SP0724-0001', name: 'Highland Coffee', contactPerson: 'John Doe', phone: '123-456-7890', email: 'john@highland.com', origin: 'Aceh Gayo, Indonesia', specialties: [BeanVariety.ARABICA] },
    { id: 'SP0724-0002', name: 'Coastal Beans Co.', contactPerson: 'Jane Smith', phone: '098-765-4321', email: 'jane@coastal.com', origin: 'Lampung, Indonesia', specialties: [BeanVariety.ROBUSTA, BeanVariety.LIBERICA] },
];

const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'PO0724-0001', supplierId: 'SP0724-0001', orderDate: '2024-07-01', expectedDeliveryDate: '2024-07-15', items: [{ variety: BeanVariety.ARABICA, quantityKg: 250, pricePerKg: 225000 }], status: POStatus.COMPLETED },
    { id: 'PO0724-0002', supplierId: 'SP0724-0002', orderDate: '2024-07-05', expectedDeliveryDate: '2024-07-20', items: [{ variety: BeanVariety.ROBUSTA, quantityKg: 500, pricePerKg: 150000 }], status: POStatus.COMPLETED },
    { id: 'PO0724-0003', supplierId: 'SP0724-0001', orderDate: '2024-07-10', expectedDeliveryDate: '2024-07-25', items: [{ variety: BeanVariety.LIBERICA, quantityKg: 100, pricePerKg: 180000 }], status: POStatus.PENDING },
];

const initialStock: StockItem[] = [
    { id: 'ST0724-0001', type: StockType.GREEN_BEAN, variety: BeanVariety.ARABICA, quantityKg: 150, location: 'A1', lastUpdated: getDateString(5) },
    { id: 'ST0724-0002', type: StockType.GREEN_BEAN, variety: BeanVariety.ROBUSTA, quantityKg: 450, location: 'A2', lastUpdated: getDateString(10) },
    { id: 'ST0724-0003', type: StockType.GREEN_BEAN, variety: BeanVariety.LIBERICA, quantityKg: 80, location: 'B1', lastUpdated: getDateString(8) },
    { id: 'ST0724-0004', type: StockType.ROASTED_BEAN, variety: BeanVariety.ARABICA, quantityKg: 45, location: 'R1', lastUpdated: getDateString(3) },
    { id: 'ST0724-0005', type: StockType.ROASTED_BEAN, variety: BeanVariety.ROBUSTA, quantityKg: 7, location: 'R1', lastUpdated: getDateString(2) },
];

const initialSales: SalesRecord[] = [
    { id: 'SL0724-0001', invoiceNumber: 'INV-001', saleDate: getDateString(2), items: [{ stockId: 'ST0724-0004', variety: BeanVariety.ARABICA, quantityKg: 5, pricePerKg: 450000 }], customerName: 'Local Cafe', totalAmount: 2250000, paymentStatus: PaymentStatus.PAID, shippingAddress: '123 Coffee St', notes: '' },
    { id: 'SL0724-0002', invoiceNumber: 'INV-002', saleDate: getDateString(3), items: [{ stockId: 'ST0724-0005', variety: BeanVariety.ROBUSTA, quantityKg: 8, pricePerKg: 330000 }], customerName: 'Online Order', totalAmount: 2640000, paymentStatus: PaymentStatus.PAID, shippingAddress: '456 Web Ave', notes: 'Express shipping' },
    { id: 'SL0724-0003', invoiceNumber: 'INV-003', saleDate: getDateString(1), items: [{ stockId: 'ST0724-0004', variety: BeanVariety.ARABICA, quantityKg: 10, pricePerKg: 450000 }], customerName: 'Local Cafe', totalAmount: 4500000, paymentStatus: PaymentStatus.PAID, shippingAddress: '123 Coffee St', notes: 'Bulk discount applied' },
    { id: 'SL0724-0004', invoiceNumber: 'INV-004', saleDate: getDateString(8), items: [{ stockId: 'ST0724-0004', variety: BeanVariety.ARABICA, quantityKg: 7, pricePerKg: 440000 }], customerName: 'Hotel Group', totalAmount: 3080000, paymentStatus: PaymentStatus.PAID, shippingAddress: '789 Hotel Blvd', notes: '' },
    { id: 'SL0724-0005', invoiceNumber: 'INV-005', saleDate: getDateString(10), items: [{ stockId: 'ST0724-0005', variety: BeanVariety.ROBUSTA, quantityKg: 12, pricePerKg: 320000 }], customerName: 'Online Order', totalAmount: 3840000, paymentStatus: PaymentStatus.UNPAID, shippingAddress: '456 Web Ave', notes: '' },
    { id: 'SL0724-0006', invoiceNumber: 'INV-006', saleDate: getDateString(12), items: [{ stockId: 'ST0724-0004', variety: BeanVariety.ARABICA, quantityKg: 4, pricePerKg: 450000 }], customerName: 'Local Cafe', totalAmount: 1800000, paymentStatus: PaymentStatus.PAID, shippingAddress: '123 Coffee St', notes: '' },
    { id: 'SL0724-0007', invoiceNumber: 'INV-007', saleDate: getDateString(20), items: [{ stockId: 'ST0724-0005', variety: BeanVariety.ROBUSTA, quantityKg: 15, pricePerKg: 320000 }], customerName: 'Distributor', totalAmount: 4800000, paymentStatus: PaymentStatus.PAID, shippingAddress: '1 Warehouse Rd', notes: '' },
];
const initialAlertSettings: AlertSetting[] = [ { id: 'AL0724-0001', variety: BeanVariety.ARABICA, type: StockType.ROASTED_BEAN, threshold: 50 }, { id: 'AL0724-0002', variety: BeanVariety.LIBERICA, type: StockType.GREEN_BEAN, threshold: 100 },];
const initialRoasts: RoastProfile[] = [ { id: 'RT0724-0001', batchId: 'RB-DEMO-001', roastDate: getDateString(4), greenBeanVariety: BeanVariety.ARABICA, greenBeanStockId: 'ST0724-0001', roasterName: 'Jane Doe', ambientTemp: 22, greenBeanWeightKg: 10, chargeTemp: 205, turnaroundTime: 95, turnaroundTemp: 88, dryingPhaseEndTime: 310, firstCrackTime: 550, totalRoastTime: 730, dropTemp: 218, developmentTime: 180, roastedWeightKg: 8.5, colorScore: 'Agtron 90', internalRoastingCostPerKg: 15000, notes: 'A sample roast for demonstration purposes.' }, { id: 'RT0724-0002', batchId: 'RB-DEMO-002', roastDate: getDateString(6), greenBeanVariety: BeanVariety.ROBUSTA, greenBeanStockId: 'ST0724-0002', roasterName: 'Admin', ambientTemp: 25, greenBeanWeightKg: 50, chargeTemp: 215, turnaroundTime: 105, turnaroundTemp: 92, dryingPhaseEndTime: 330, firstCrackTime: 600, totalRoastTime: 780, dropTemp: 225, developmentTime: 180, roastedWeightKg: 42, colorScore: 'Agtron 75', internalRoastingCostPerKg: 12000, notes: 'Standard roast for Robusta.' }];
const initialWarehouseLogs: WarehouseLog[] = [ { id: 'LG0724-0001', date: getDateString(15), itemId: 'ST0724-0001', change: 250, notes: 'Stock from PO #PO0724-0001' }, { id: 'LG0724-0002', date: getDateString(10), itemId: 'ST0724-0002', change: 500, notes: 'Stock from PO #PO0724-0002' }, { id: 'LG0724-0003', date: getDateString(8), itemId: 'ST0724-0003', change: 100, notes: 'Initial stock' }, { id: 'LG0724-0004', date: getDateString(4), itemId: 'ST0724-0001', change: -10, notes: 'Used for roast batch RB-DEMO-001' }, { id: 'LG0724-0005', date: getDateString(4), itemId: 'ST0724-0004', change: 8.5, notes: 'From roast batch RB-DEMO-001' }, { id: 'LG0724-0006', date: getDateString(3), itemId: 'ST0724-0005', change: -8, notes: 'Sale #SL0724-0002 to Online Order' }, { id: 'LG0724-0007', date: getDateString(2), itemId: 'ST0724-0004', change: -5, notes: 'Sale #SL0724-0001 to Local Cafe' }, { id: 'LG0724-0008', date: getDateString(1), itemId: 'ST0724-0004', change: -10, notes: 'Sale #SL0724-0003 to Local Cafe' }, { id: 'LG0724-0009', date: getDateString(8), itemId: 'ST0724-0004', change: -7, notes: 'Sale #SL0724-0004 to Hotel Group' }, { id: 'LG0724-0010', date: getDateString(10), itemId: 'ST0724-0005', change: -12, notes: 'Sale #SL0724-0005 to Online Order' }, { id: 'LG0724-0011', date: getDateString(12), itemId: 'ST0724-0004', change: -4, notes: 'Sale #SL0724-0006 to Local Cafe' }, { id: 'LG0724-0012', date: getDateString(5), itemId: 'ST0724-0001', change: 50, notes: 'Manual stock adjustment - Count Correction' }, { id: 'LG0724-0013', date: getDateString(6), itemId: 'ST0724-0002', change: -50, notes: 'Used for roast batch RB-DEMO-002' }, { id: 'LG0724-0014', date: getDateString(6), itemId: 'ST0724-0005', change: 42, notes: 'From roast batch RB-DEMO-002' }, { id: 'LG0724-0015', date: getDateString(20), itemId: 'ST0724-0005', change: -15, notes: 'Sale #SL0724-0007 to Distributor'}, ];
const initialPackaging: Packaging[] = [ { id: 'PK0724-0001', name: '250g Flat Bottom Pouch', sizeKg: 0.25, cost: 3500 }, { id: 'PK0724-0002', name: '1kg Side Gusset Bag', sizeKg: 1.0, cost: 8000 }, { id: 'PK0724-0003', name: '5kg Bulk Bag', sizeKg: 5.0, cost: 25000 }, ];
const initialExpenses: Expense[] = [ { id: 'EX0724-0001', date: getDateString(25), description: 'Monthly Rent', category: ExpenseCategory.RENT, amount: 15000000 }, { id: 'EX0724-0002', date: getDateString(20), description: 'Electricity Bill', category: ExpenseCategory.UTILITIES, amount: 2500000 }, { id: 'EX0724-0003', date: getDateString(1), description: 'Staff Salaries', category: ExpenseCategory.SALARY, amount: 35000000 }, { id: 'EX0724-0004', date: getDateString(15), description: 'Social Media Campaign', category: ExpenseCategory.MARKETING, amount: 5000000 }, ];
const initialTodos: Todo[] = [ { id: 'TD0724-0001', text: 'Follow up with Highland Coffee on PO #PO0724-0003', status: TaskStatus.IN_PROGRESS, createdAt: getDateString(2), dueDate: getDateString(-1), priority: Priority.HIGH, assignedTo: 'US0724-0003' }, { id: 'TD0724-0002', text: 'Schedule monthly roaster maintenance', status: TaskStatus.TODO, createdAt: getDateString(5), dueDate: getDateString(0), priority: Priority.MEDIUM, assignedTo: 'US0724-0002' }, { id: 'TD0724-0003', text: 'Prepare Q3 sales report', status: TaskStatus.DONE, createdAt: getDateString(7), dueDate: getDateString(4), priority: Priority.LOW, assignedTo: 'US0724-0001' }, { id: 'TD0724-0004', text: 'Finalize new blend recipe "Sunrise"', status: TaskStatus.TODO, createdAt: getDateString(1), dueDate: getDateString(1), priority: Priority.HIGH, assignedTo: 'US0724-0002' }, ];
const initialComments: Comment[] = [ { id: 'CM0724-0001', taskId: 'TD0724-0001', userId: 'US0724-0001', text: 'Any updates on this? Delivery is expected soon.', createdAt: getDateString(1) }, { id: 'CM0724-0002', taskId: 'TD0724-0001', userId: 'US0724-0003', text: 'I just called them. They said it will ship tomorrow.', createdAt: getDateString(0) }, ];
const initialGrades: GreenBeanGrade[] = [];
const initialCuppings: CuppingSession[] = [];
const initialBlends: Blend[] = [];
const initialExternalRoasts: ExternalRoastLog[] = [];


// --- DATABASE DEFINITION (DEXIE) ---

class CoffeeERPDexie extends Dexie {
    users!: Table<User>;
    suppliers!: Table<Supplier>;
    purchaseOrders!: Table<PurchaseOrder>;
    grades!: Table<GreenBeanGrade>;
    roasts!: Table<RoastProfile>;
    externalRoasts!: Table<ExternalRoastLog>;
    cuppings!: Table<CuppingSession>;
    blends!: Table<Blend>;
    stock!: Table<StockItem>;
    warehouseLogs!: Table<WarehouseLog>;
    sales!: Table<SalesRecord>;
    alertSettings!: Table<AlertSetting>;
    packaging!: Table<Packaging>;
    expenses!: Table<Expense>;
    todos!: Table<Todo>;
    comments!: Table<Comment>;

    constructor() {
        super('CoffeeERPDatabase');
        // FIX: Cast 'this' to Dexie to resolve typing issue with extended class.
        (this as Dexie).version(2).stores({
            users: 'id, username',
            suppliers: 'id, name',
            purchaseOrders: 'id, supplierId, status',
            grades: 'id, poId',
            roasts: 'id, batchId, greenBeanStockId',
            externalRoasts: 'id, greenBeanStockId',
            cuppings: 'id, roastProfileId',
            blends: 'id, name',
            stock: 'id, type, variety',
            warehouseLogs: 'id, itemId, date',
            sales: 'id, saleDate',
            alertSettings: 'id, variety, type',
            packaging: 'id, name',
            expenses: 'id, date, category',
            todos: 'id, status, dueDate, priority, assignedTo',
            comments: 'id, taskId',
        });
    }
}

const db = new CoffeeERPDexie();

// --- DATA SEEDING ---

const seedDatabase = async () => {
    const userCount = await db.users.count();
    if (userCount > 0) return;

    console.log("Seeding database with initial data...");
    // FIX: Cast 'db' to Dexie to resolve typing issue with extended class.
    await (db as Dexie).transaction('rw', (db as Dexie).tables, async () => {
        await Promise.all([
            db.users.bulkAdd(initialUsers),
            db.suppliers.bulkAdd(initialSuppliers),
            db.purchaseOrders.bulkAdd(initialPurchaseOrders),
            db.stock.bulkAdd(initialStock),
            db.sales.bulkAdd(initialSales),
            db.alertSettings.bulkAdd(initialAlertSettings),
            db.roasts.bulkAdd(initialRoasts),
            db.warehouseLogs.bulkAdd(initialWarehouseLogs),
            db.packaging.bulkAdd(initialPackaging),
            db.expenses.bulkAdd(initialExpenses),
            db.todos.bulkAdd(initialTodos),
            db.comments.bulkAdd(initialComments),
            db.grades.bulkAdd(initialGrades),
            db.cuppings.bulkAdd(initialCuppings),
            db.blends.bulkAdd(initialBlends),
            db.externalRoasts.bulkAdd(initialExternalRoasts),
        ]);
    });
};

// --- ID GENERATION ---

const generateNewId = async (prefix: string, table: Dexie.Table): Promise<string> => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const datePart = `${month}${year}`;
    const searchPrefix = `${prefix}${datePart}-`;
    const lastItem = await table.where('id').startsWith(searchPrefix).last();
    let maxSequence = 0;
    if (lastItem) {
        const sequenceStr = lastItem.id.split('-')[1];
        maxSequence = parseInt(sequenceStr, 10);
    }
    const newSequence = (maxSequence + 1).toString().padStart(4, '0');
    return `${searchPrefix}${newSequence}`;
};

// --- ASYNC CRUD OPERATIONS ---

const crudOperations = <T extends { id: string }>(table: Dexie.Table<T>, prefix: string) => ({
    getAll: () => table.toArray(),
    getById: (id: string) => table.get(id),
    add: async (item: Omit<T, 'id'>) => {
        const newId = await generateNewId(prefix, table);
        const newItem = { ...item, id: newId } as T;
        await table.add(newItem);
        return newItem;
    },
    update: (id: string, updatedItem: Partial<T>) => table.update(id, updatedItem),
    remove: (id: string) => table.delete(id),
});

const dataService = {
    users: {
        ...crudOperations<User>(db.users, 'US'),
        getByUsername: (username: string) => db.users.where('username').equals(username).first(),
    },
    suppliers: crudOperations<Supplier>(db.suppliers, 'SP'),
    purchaseOrders: crudOperations<PurchaseOrder>(db.purchaseOrders, 'PO'),
    stock: crudOperations<StockItem>(db.stock, 'ST'),
    sales: crudOperations<SalesRecord>(db.sales, 'SL'),
    grades: crudOperations<GreenBeanGrade>(db.grades, 'GR'),
    roasts: crudOperations<RoastProfile>(db.roasts, 'RT'),
    externalRoasts: crudOperations<ExternalRoastLog>(db.externalRoasts, 'ER'),
    cuppings: crudOperations<CuppingSession>(db.cuppings, 'CP'),
    blends: crudOperations<Blend>(db.blends, 'BL'),
    warehouseLogs: crudOperations<WarehouseLog>(db.warehouseLogs, 'LG'),
    alertSettings: crudOperations<AlertSetting>(db.alertSettings, 'AL'),
    packaging: crudOperations<Packaging>(db.packaging, 'PK'),
    expenses: crudOperations<Expense>(db.expenses, 'EX'),
    todos: crudOperations<Todo>(db.todos, 'TD'),
    comments: crudOperations<Comment>(db.comments, 'CM'),
};

// --- MAIN HOOK ---

export const useMockData = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initDb = async () => {
            try {
                await seedDatabase();
            } catch (e) {
                console.error("DB initialization error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        initDb();
    }, []);

    return { dataService, isLoading };
};
