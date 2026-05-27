import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  brand: { fontSize: 18, fontWeight: 'bold', color: '#3B82F6' },
  meta: { textAlign: 'right', fontSize: 10, color: '#6b7280' },
  h2: { fontSize: 13, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, marginTop: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  col1: { flex: 3 }, col2: { flex: 1, textAlign: 'right' },
  total: { flexDirection: 'row', padding: 8, marginTop: 8, borderTopWidth: 2, borderTopColor: '#1f2937', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
});

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  description: string;
  amountLabel: string;
}

export const InvoicePdf = ({ invoice }: { invoice: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>FocusCheck</Text>
          <Text style={{ fontSize: 9, color: '#6b7280' }}>ADHD Screening Platform</Text>
        </View>
        <View style={styles.meta}>
          <Text>Invoice #{invoice.invoiceNumber}</Text>
          <Text>{new Date(invoice.date).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.h2}>Bill to</Text>
      <Text>{invoice.customerName}</Text>
      <Text style={{ color: '#6b7280' }}>{invoice.customerEmail}</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.col1}>Description</Text>
        <Text style={styles.col2}>Amount</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.col1}>{invoice.description}</Text>
        <Text style={styles.col2}>{invoice.amountLabel}</Text>
      </View>
      <View style={styles.total}>
        <Text style={styles.col1}>Total</Text>
        <Text style={styles.col2}>{invoice.amountLabel}</Text>
      </View>

      <Text style={[styles.h2, { marginTop: 24 }]}>Payment</Text>
      <View style={styles.row}><Text>Order ID</Text><Text>{invoice.orderId}</Text></View>
      <View style={styles.row}><Text>Status</Text><Text>Paid</Text></View>

      <Text style={styles.footer} fixed>
        Thank you for your purchase. Questions? Reply to your confirmation email.
      </Text>
    </Page>
  </Document>
);
