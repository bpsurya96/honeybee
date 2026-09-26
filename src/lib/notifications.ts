export interface OrderNotificationData {
  orderId: string;
  parentName: string;
  childName: string;
  mobileNumber: string;
  deliveryAddress: string;
  booksOrdered: { name: string; quantity: number }[];
  totalAmount: number;
  paymentStatus: string;
}

export async function sendOrderNotifications(data: OrderNotificationData) {
  // Mock implementations for Email and WhatsApp
  // In a real application, these would call actual APIs (e.g. Resend, Twilio)
  
  console.log(`
=========================================
EMAIL NOTIFICATION
To: ${data.parentName}
Subject: New Order Received - ${data.orderId}
-----------------------------------------
New Order Received

Order ID: ${data.orderId}
Parent Name: ${data.parentName}
Child Name: ${data.childName}
Mobile Number: ${data.mobileNumber}
Delivery Address: ${data.deliveryAddress}
Books Ordered:
${data.booksOrdered.map(b => `- ${b.quantity}x ${b.name}`).join('\n')}
Total Amount: ₹${data.totalAmount}
Payment Status: ${data.paymentStatus}
Order Date: ${new Date().toLocaleString()}
=========================================
  `);

  console.log(`
=========================================
WHATSAPP NOTIFICATION
To: ${data.mobileNumber}
-----------------------------------------
New Book Order

Order: #${data.orderId.substring(0, 8)}
Parent: ${data.parentName}
Child: ${data.childName}
Amount: ₹${data.totalAmount}
Payment: ${data.paymentStatus}

Mobile: ${data.mobileNumber}

Please contact the parent to arrange payment.
=========================================
  `);
}
