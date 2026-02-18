// components/CollectionPDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  tableRow: { flexDirection: "row", borderBottom: "1pt solid #ccc" },
  tableCell: { flex: 1, padding: 4 },
});

export function CollectionPDF({ collection, donations, totalAmount, depositSlipUrl }: any) {
  // Make sure URL starts with https://
  const imageUrl =
    depositSlipUrl && !depositSlipUrl.startsWith("http")
      ? `https://vepoxyrnrsmcvshjfhuv.supabase.co${depositSlipUrl}`
      : depositSlipUrl;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Weekly Collection Summary</Text>
        <Text>Date: {collection.date}</Text>
        <Text>Service Type: {collection.service_type}</Text>
        <Text>Recorded By: {collection.recorded_by}</Text>
        <Text>Counted By: {collection.counted_by}</Text>

        <Text style={{ marginTop: 10 }}>Donations:</Text>
        <View>
          {donations.map((d: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{d.donor_name}</Text>
              <Text style={styles.tableCell}>{d.check_number}</Text>
              <Text style={styles.tableCell}>${d.amount}</Text>
              <Text style={styles.tableCell}>{d.donation_type}</Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 10 }}>Total: ${totalAmount}</Text>

        {imageUrl && (
          <>
            <Text style={{ marginTop: 10 }}>Deposit Slip:</Text>
            <Image src={imageUrl} style={{ width: 200, height: 200 }} />
          </>
        )}
      </Page>
    </Document>
  );
}