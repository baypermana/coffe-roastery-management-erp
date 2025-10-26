
export enum BeanVariety {
  ARABICA = "Arabica",
  ROBUSTA = "Robusta",
  LIBERICA = "Liberica",
  BLEND = "Blend"
}

export enum POStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  COMPLETED = "Completed"
}

export enum GradeStatus {
    ACCEPTED = "Accepted",
    RETURNED = "Returned"
}

export enum PaymentStatus {
    PAID = "Paid",
    UNPAID = "Unpaid",
    PARTIALLY_PAID = "Partially Paid",
    REFUNDED = "Refunded"
}

export enum ExpenseCategory {
    UTILITIES = "Utilities",
    SALARY = "Salary",
    RENT = "Rent",
    MARKETING = "Marketing",
    MAINTENANCE = "Maintenance",
    OTHER = "Other",
}

export enum UserRole {
    ADMIN = "Admin",
    ROASTER = "Roaster",
    QC = "QC", // Quality Control
    SALES = "Sales",
    USER = "User" // General user with limited access
}

export interface User {
    id: string;
    username: string;
    password?: string; // Should be handled securely in a real app
    role: UserRole;
}

export interface Expense {
    id: string;
    date: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
}


export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  origin: string; // e.g., "Aceh Gayo, Indonesia", "Sidamo, Ethiopia"
  specialties: BeanVariety[]; // e.g., [BeanVariety.ARABICA, BeanVariety.ROBUSTA]
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: {
    variety: BeanVariety;
    quantityKg: number;
    pricePerKg: number;
  }[];
  status: POStatus;
}

export interface GreenBeanGrade {
    id: string;
    poId: string;
    batchId: string;
    variety: BeanVariety;
    gradingDate: string;
    status: GradeStatus;

    // Detailed Physical Analysis
    physicalAnalysis: {
        screenSize: string; // e.g., "16-18"
        moistureContent: number; // %
        density: number; // g/L
        defectCount: number;
        waterActivity: number; // aw
    };
    
    notes: string;
}

export interface RoastProfile {
    id: string;
    batchId: string; // Auto-generated
    roastDate: string;
    greenBeanVariety: BeanVariety; // From selected stock
    greenBeanStockId: string; // To trace back to the exact green bean batch
    
    // Pre-Roast
    roasterName: string;
    ambientTemp: number; // Celsius
    greenBeanWeightKg: number; // Charge Weight
    chargeTemp: number; // Celsius

    // Milestones (Time in seconds, Temp in Celsius)
    turnaroundTime: number;
    turnaroundTemp: number;
    dryingPhaseEndTime: number; // "Yellowing" end time
    firstCrackTime: number; 
    
    // Post-Roast
    totalRoastTime: number; 
    dropTemp: number; // Celsius
    developmentTime: number; // Calculated: totalRoastTime - firstCrackTime
    roastedWeightKg: number;
    colorScore: string; // e.g., "Agtron 95"
    internalRoastingCostPerKg: number; // ADDED: Cost for internal ops
    notes: string;
}

export interface ExternalRoastLog {
    id: string;
    roasteryName: string;
    dateSent: string;
    dateReceived: string;
    greenBeanStockId: string;
    greenBeanVariety: BeanVariety;
    greenBeanWeightSentKg: number;
    roastedBeanWeightReceivedKg: number;
    roastingCostPerKg: number;
    notes: string;
}


export interface CuppingSession {
    id: string;
    roastProfileId: string;
    sessionDate: string;
    roastLevel: 'Cinnamon' | 'Light' | 'City' | 'Full City' | 'Dark';
    
    // SCA Standard Scores (6-10 scale)
    fragranceDry: number;
    fragranceBreak: number;
    flavor: number; 
    aftertaste: number; 
    acidity: number; 
    body: number; 
    balance: number; 
    sweetness: number;
    cleanliness: number;
    uniformity: number;

    // Defects
    defects: {
        numberOfCups: number;
        taints: number; // number of cups with taints
        faults: number; // number of cups with faults
    };

    finalScore: number; // Calculated score
    notes: string;
}


export interface Blend {
    id: string;
    name: string;
    components: {
        stockId: string; // Was roastProfileId, changed for consistency
        variety: BeanVariety;
        percentage: number;
        costPerKg: number; // Added to store the calculated cost
    }[];
    totalCostPerKg: number; // ADDED: To store final calculated cost
    creationDate: string;
    notes: string;
}

export enum StockType {
    GREEN_BEAN = "Green Bean",
    ROASTED_BEAN = "Roasted Bean"
}

export interface StockItem {
    id: string;
    type: StockType;
    variety: BeanVariety;
    quantityKg: number;
    location: string;
    lastUpdated: string;
}

export interface WarehouseLog {
    id: string;
    date: string;
    itemId: string;
    change: number; // positive for IN, negative for OUT
    notes: string;
}

export interface SalesRecord {
    id: string;
    invoiceNumber: string;
    saleDate: string;
    items: {
        stockId: string;
        variety: BeanVariety;
        quantityKg: number;
        pricePerKg: number;
    }[];
    customerName: string;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    shippingAddress: string;
    notes: string;
}

export interface AlertSetting {
    id: string;
    variety: BeanVariety;
    type: StockType;
    threshold: number;
}

export interface Packaging {
  id: string;
  name: string;
  sizeKg: number;
  cost: number;
}

export enum Priority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
}

export enum TaskStatus {
    TODO = "To Do",
    IN_PROGRESS = "In Progress",
    DONE = "Done",
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: string;
}

export interface Todo {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: string;
  dueDate?: string;
  priority: Priority;
  assignedTo?: string;
}


export type View = 'Dashboard' | 'Purchase Orders' | 'Grading Form' | 'Suppliers' | 'Roasting Form' | 'External Roasting' | 'Cupping Form' | 'Blending Form' | 'Warehouse' | 'Sales' | 'Kalkulator HPP' | 'Financial Management' | 'User Management' | 'Tasks';
