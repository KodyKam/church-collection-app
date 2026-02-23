// components/CollectionPDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12, fontWeight: "bold" },
  section: { marginBottom: 12 },
  table: { width: "auto", marginTop: 8, borderWidth: 1, borderColor: "#d1d5db", borderStyle: "solid" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d1d5db", borderBottomStyle: "solid" },
  tableHeader: { flex: 1, padding: 6, fontWeight: "bold", backgroundColor: "#f3f4f6" },
  tableCell: { flex: 1, padding: 6 },
  totalRow: { flexDirection: "row", fontWeight: "bold", backgroundColor: "#e5e7eb" }
});

export default function CollectionPDF({ collection, donations, totalAmount, depositSlipUrl }: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={{ fontSize: 18, marginBottom: 10, textAlign: "center" }}>Weekly Collection Summary</Text>
        <Text>Date: {collection.date}</Text>
        <Text>Service Type: {collection.service_type}</Text>
        <Text>Recorded By: {collection.recorded_by}</Text>
        <Text>Counted By: {collection.counted_by}</Text>

        <Text style={{ marginTop: 10 }}>Donations:</Text>
        <View style={styles.table}>
  <View style={styles.tableRow}>
    <Text style={styles.tableHeader}>Name</Text>
    <Text style={styles.tableHeader}>Check</Text>
    <Text style={styles.tableHeader}>Amount</Text>
    <Text style={styles.tableHeader}>Type</Text>
  </View>

  {donations.map((d: any, i: number) => (
    <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }]}>
      <Text style={styles.tableCell}>{d.donor_name}</Text>
      <Text style={styles.tableCell}>{d.check_number}</Text>
      <Text style={styles.tableCell}>${d.amount.toFixed(2)}</Text>
      <Text style={styles.tableCell}>{d.donation_type}</Text>
    </View>
  ))}

  <View style={styles.totalRow}>
    <Text style={[styles.tableCell, { flex: 2 }]}>Total</Text>
    <Text style={[styles.tableCell, { flex: 2 }]}>${totalAmount.toFixed(2)}</Text>
  </View>
</View>

        <Text style={{ marginTop: 10 }}>Total: ${totalAmount.toFixed(2)}</Text>

        {depositSlipUrl && (
  <View style={{ marginTop: 10, alignItems: "center" }}>
    <Text style={{ marginBottom: 6, textAlign: "left"}}>Deposit Slip:</Text>
    <Image
      src={
        depositSlipUrl.startsWith("http")
          ? depositSlipUrl
          : `https://vepoxyrnrsmcvshjfhuv.supabase.co${depositSlipUrl}`
      }
      style={{ width: 200, height: 200 }}
    />
  </View>
)}
      </Page>
    </Document>
  );
}