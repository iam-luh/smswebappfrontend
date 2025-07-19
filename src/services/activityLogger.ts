import { userLogService } from './userLogService';
import { notificationService } from './notificationService';
import { ProductStock } from './productService';
import { StockChange } from './stockChangeService';
import { StockAdjustment } from './stockAdjustmentService';
import { User } from './userService';
import { Notification } from './notificationService';

// Define interfaces for type safety
interface SaleData {
  stockChangeID?: number;
  productName: string;
  productColor: string;
  productSize: string;
  productQuantity: number;
  productUnit?: string;
  soldDate?: Date;
  productVariantID?: number;
}

interface StockData {
  stockChangeID?: number;
  productName: string;
  productColor: string;
  productSize: string;
  productQuantity: number;
  productUnit?: string;
  addedDate?: Date;
  productVariantID?: number;
}

interface AdjustmentData {
  adjustmentID?: number;
  stockAdjustmentId?: number;
  productName: string;
  productColor: string;
  productSize: string;
  adjustmentQuantity: number;
  productQuantity?: number;
  adjustmentReason?: string;
  reason?: string;
  adjustmentType?: string;
  adjustmentDate?: Date;
  productVariantID?: number;
}

interface UserData {
  id?: number;
  userId?: number;
  email: string;
  name?: string;
  username?: string;
  role?: string;
}

interface UnitData {
  id?: number;
  unitId?: number;
  unitName: string;
  unitSymbol?: string;
}

interface ColorData {
  id?: number;
  colorId?: number;
  colorName: string;
  name?: string;
}

interface SizeData {
  id?: number;
  sizeId?: number;
  sizeName: string;
  name?: string;
}

interface DateRange {
  startDate?: string | Date;
  endDate?: string | Date;
  [key: string]: unknown;
}

export class ActivityLogger {
  private static getCurrentUser() {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return { username: 'Unknown User', userId: 0 };
  }

  private static async createLog(action: string, details: string, entityType?: string, entityId?: number) {
    try {
      const user = this.getCurrentUser();
      await userLogService.createLog({
        userId: user.userId || 0,
        action,
        details: `${user.username}: ${details}`,
        ipAddress: await this.getClientIP()
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  private static async getClientIP(): Promise<string> {
    try {
      // In a real application, you might want to get this from your backend
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  // Authentication logs
  static async logLogin(username: string) {
    await this.createLog('Login', `User ${username} logged in successfully`);
  }

  static async logLogout(username: string) {
    await this.createLog('Logout', `User ${username} logged out`);
  }

  static async logLoginAttempt(username: string, success: boolean) {
    const action = success ? 'Login Success' : 'Login Failed';
    const details = success 
      ? `User ${username} logged in successfully`
      : `Failed login attempt for user ${username}`;
    await this.createLog(action, details);
  }

  // Product operations
  static async logProductCreate(productData: Record<string, unknown>) {
    await this.createLog(
      'Create Product',
      `Created product: ${String(productData.productName)} (${String(productData.productColor)}, ${String(productData.productSize)})`,
      'product',
      Number(productData.productId) || 0
    );
    
  // Create notification for new product
    await this.createProductNotification(
      'Product Created',
      `New product variant added: ${productData.productName} (${productData.productColor}, ${productData.productSize})`,
      'general',
      Number(productData.productId) || 0
    );
  }

  static async logProductUpdate(productId: number, productData: Record<string, unknown>, oldData?: Record<string, unknown>) {
    const changes = oldData ? this.getChangedFields(oldData, productData) : 'Updated';
    await this.createLog(
      'Update Product',
      `Updated product (ID: ${productId}): ${String(productData.productName)} - Changes: ${changes}`,
      'product',
      productId
    );
  }

  static async logProductDelete(productId: number, productName: string) {
    await this.createLog(
      'Delete Product',
      `Deleted product (ID: ${productId}): ${productName}`,
      'product',
      productId
    );
  }

  static async logBulkProductDelete(productName: string, count: number) {
    await this.createLog(
      'Delete Products (Bulk)',
      `Deleted ${count} product variants with name: ${productName}`,
      'product'
    );
  }

  // Sales operations
  static async logSaleCreate(saleData: StockChange) {
    await this.createLog(
      'Create Sale',
      `Recorded sale: ${saleData.productName} (${saleData.productColor}, ${saleData.productSize}) - Quantity: ${saleData.productQuantity}`,
      'sale',
      saleData.stockChangeID
    );

    // Create notification for sale
    await this.createSaleNotification(saleData);
  }

  static async logSaleUpdate(saleId: number, saleData: StockChange) {
    await this.createLog(
      'Update Sale',
      `Updated sale (ID: ${saleId}): ${saleData.productName} - Quantity: ${saleData.productQuantity}`,
      'sale',
      saleId
    );
  }

  static async logSaleDelete(saleId: number, productName: string) {
    await this.createLog(
      'Delete Sale',
      `Deleted sale record (ID: ${saleId}): ${productName}`,
      'sale',
      saleId
    );
  }

  // Stock operations
  static async logStockAddition(stockData: StockChange) {
    await this.createLog(
      'Add Stock',
      `Added stock: ${stockData.productName} (${stockData.productColor}, ${stockData.productSize}) - Quantity: ${stockData.productQuantity}`,
      'stock',
      stockData.stockChangeID
    );

    // Create notification for stock addition
    await this.createStockNotification(stockData);
  }

  static async logStockUpdate(stockId: number, stockData: StockChange) {
    await this.createLog(
      'Update Stock',
      `Updated stock record (ID: ${stockId}): ${stockData.productName} - Quantity: ${stockData.productQuantity}`,
      'stock',
      stockId
    );
  }

  static async logStockDelete(stockId: number, productName: string) {
    await this.createLog(
      'Delete Stock',
      `Deleted stock record (ID: ${stockId}): ${productName}`,
      'stock',
      stockId
    );
  }

  // Inventory adjustment operations
  static async logAdjustmentCreate(adjustmentData: StockAdjustment) {
    await this.createLog(
      'Create Adjustment',
      `Created inventory adjustment: ${adjustmentData.productName} (${adjustmentData.productColor}, ${adjustmentData.productSize}) - ${adjustmentData.adjustmentType}: ${adjustmentData.productQuantity} - Reason: ${adjustmentData.reason}`,
      'adjustment',
      adjustmentData.stockAdjustmentId
    );

    // Create notification for adjustment
    await this.createAdjustmentNotification(adjustmentData);
  }

  static async logAdjustmentDelete(adjustmentId: number, productName: string) {
    await this.createLog(
      'Delete Adjustment',
      `Deleted inventory adjustment (ID: ${adjustmentId}): ${productName}`,
      'adjustment',
      adjustmentId
    );
  }

  // User management operations
  static async logUserCreate(userData: UserData) {
    await this.createLog(
      'Create User',
      `Created new user: ${userData.username} (${userData.email}) - Role: ${userData.role}`,
      'user',
      userData.userId
    );
  }

  static async logUserUpdate(userId: number, userData: UserData) {
    await this.createLog(
      'Update User',
      `Updated user (ID: ${userId}): ${userData.username}`,
      'user',
      userId
    );
  }

  static async logUserDelete(userId: number, username: string) {
    await this.createLog(
      'Delete User',
      `Deleted user (ID: ${userId}): ${username}`,
      'user',
      userId
    );
  }

  // Unit management operations
  static async logUnitCreate(unitData: UnitData) {
    await this.createLog(
      'Create Unit',
      `Created unit: ${unitData.unitName} (${unitData.unitSymbol})`,
      'unit',
      unitData.unitId
    );
  }

  static async logUnitUpdate(unitId: number, unitData: UnitData) {
    await this.createLog(
      'Update Unit',
      `Updated unit (ID: ${unitId}): ${unitData.unitName}`,
      'unit',
      unitId
    );
  }

  static async logUnitDelete(unitId: number, unitName: string) {
    await this.createLog(
      'Delete Unit',
      `Deleted unit (ID: ${unitId}): ${unitName}`,
      'unit',
      unitId
    );
  }

  // Color and Size operations
  static async logColorCreate(colorData: ColorData) {
    await this.createLog(
      'Create Color',
      `Created color: ${colorData.name}`,
      'color',
      colorData.colorId
    );
  }

  static async logColorDelete(colorId: number, colorName: string) {
    await this.createLog(
      'Delete Color',
      `Deleted color (ID: ${colorId}): ${colorName}`,
      'color',
      colorId
    );
  }

  static async logSizeCreate(sizeData: SizeData) {
    await this.createLog(
      'Create Size',
      `Created size: ${sizeData.name}`,
      'size',
      sizeData.sizeId
    );
  }

  static async logSizeDelete(sizeId: number, sizeName: string) {
    await this.createLog(
      'Delete Size',
      `Deleted size (ID: ${sizeId}): ${sizeName}`,
      'size',
      sizeId
    );
  }

  // CSV Import/Export operations
  static async logCSVImport(entityType: string, successCount: number, failedCount: number) {
    await this.createLog(
      'CSV Import',
      `Imported ${entityType}: ${successCount} successful, ${failedCount} failed`,
      entityType
    );
  }

  static async logCSVExport(entityType: string, recordCount: number) {
    await this.createLog(
      'CSV Export',
      `Exported ${recordCount} ${entityType} records to CSV`,
      entityType
    );
  }

  static async logPDFExport(reportType: string, recordCount: number) {
    await this.createLog(
      'PDF Export',
      `Generated ${reportType} PDF report with ${recordCount} records`,
      'report'
    );
  }

  // Report generation
  static async logReportGeneration(reportType: string, dateRange?: DateRange) {
    const dateStr = dateRange ? ` (${dateRange.from} to ${dateRange.to})` : '';
    await this.createLog(
      'Generate Report',
      `Generated ${reportType} report${dateStr}`,
      'report'
    );
  }

  // Notification operations
  static async logNotificationRead(notificationId: number) {
    await this.createLog(
      'Read Notification',
      `Marked notification as read (ID: ${notificationId})`,
      'notification',
      notificationId
    );
  }

  // Private helper methods
  private static getChangedFields(oldData: Record<string, unknown>, newData: Record<string, unknown>): string {
    const changes = [];
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes.push(`${key}: ${oldData[key]} → ${newData[key]}`);
      }
    }
    return changes.length > 0 ? changes.join(', ') : 'No changes detected';
  }

  // Notification creation helpers
  private static async createProductNotification(title: string, message: string, type: 'general' | 'low_stock' | 'out_of_stock' | 'stock_addition' | 'inventory_adjustment' | 'sale_recorded', productId?: number) {
    try {
      await notificationService.createNotification({
        title,
        message,
        type,
        severity: 'medium',
        relatedEntityType: 'product',
        relatedEntityId: productId
      });
    } catch (error) {
      console.error('Failed to create product notification:', error);
    }
  }

  private static async createSaleNotification(saleData: StockChange) {
    try {
      await notificationService.createNotification({
        title: 'Sale Recorded',
        message: `Sale recorded: ${saleData.productName} (${saleData.productColor}, ${saleData.productSize}) - Quantity: ${saleData.productQuantity}`,
        type: 'sale_recorded',
        severity: 'medium',
        relatedEntityType: 'sale',
        relatedEntityId: saleData.stockChangeID
      });
    } catch (error) {
      console.error('Failed to create sale notification:', error);
    }
  }

  private static async createStockNotification(stockData: StockChange) {
    try {
      await notificationService.createNotification({
        title: 'Stock Added',
        message: `Stock added: ${stockData.productName} (${stockData.productColor}, ${stockData.productSize}) - Quantity: ${stockData.productQuantity}`,
        type: 'stock_addition',
        severity: 'medium',
        relatedEntityType: 'stock',
        relatedEntityId: stockData.stockChangeID
      });
    } catch (error) {
      console.error('Failed to create stock notification:', error);
    }
  }

  private static async createAdjustmentNotification(adjustmentData: StockAdjustment) {
    try {
      await notificationService.createNotification({
        title: 'Inventory Adjustment',
        message: `Inventory adjusted: ${adjustmentData.productName} (${adjustmentData.productColor}, ${adjustmentData.productSize}) - ${adjustmentData.adjustmentType}: ${adjustmentData.productQuantity}`,
        type: 'inventory_adjustment',
        severity: 'medium',
        relatedEntityType: 'adjustment',
        relatedEntityId: adjustmentData.stockAdjustmentId
      });
    } catch (error) {
      console.error('Failed to create adjustment notification:', error);
    }
  }
}

export default ActivityLogger;
